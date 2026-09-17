import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize Gemini client:', e);
    }
  }
  return aiClient;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Bot conversational talk route
app.post('/api/bot-talk', async (req, res) => {
  try {
    const { playerMessage, playerName, playerRole, phase, characters, language } = req.body;
    const ai = getAIClient();

    if (!ai || !playerMessage) {
      return res.status(200).json({ fallback: true });
    }

    const livingBots = (characters || []).filter((c: any) => c.isBot && !c.isCaught);
    if (livingBots.length === 0) {
      return res.status(200).json({ fallback: true });
    }

    const botDescriptions = livingBots
      .map((b: any) => `${b.name} (${b.role})`)
      .join(', ');

    const isVi = language === 'vi';

    const languageInstruction = isVi
      ? `CRITICAL LANGUAGE DIRECTIVE: The player is playing in VIETNAMESE. The bot's reply "text" MUST BE 100% IN NATURAL, ENGAGING VIETNAMESE (Tiếng Việt). Do NOT speak English under any circumstance. If the bot is a seeker, the seeker MUST speak 100% VIETNAMESE with an imposing, competitive seeker personality. Examples: "Tôi không nghĩ bạn trốn thoát được đâu, ${playerName}!", "Tôi đang ở ngay gần bạn đấy, ${playerName}!", "Quay đầu lại nhìn sau lưng đi, ${playerName}!".`
      : `CRITICAL LANGUAGE DIRECTIVE: The bot's reply "text" must be in English.`;

    const prompt = `You are an in-game AI bot playing a 2D stealth Hide and Seek match.
Human player: "${playerName || 'You'}" (Role: ${playerRole}).
Match phase: "${phase}".
Living in-game bots: ${botDescriptions}.

The human player just said over the match radio:
"${playerMessage}"

Select one of the living bots to respond directly to the human player "${playerName || 'You'}".
CRITICAL DIRECTIVE: The bot MUST have an opinion and explicitly AGREE or DISAGREE with the human player:
- If the player proposes a tactic, hiding spot, question, or claim (e.g. "Let's hide here", "Is it safe?", "Should we run?", "Seeker is blind"):
  * If AGREEING: State clear agreement (e.g. in Vietnamese: "Tôi đồng ý với ${playerName}!", "Ý hay đó ${playerName}!" / in English: "I agree ${playerName}!") and give a quick reason.
  * If DISAGREEING: State natural conversational disagreement (e.g. in Vietnamese: "Tôi không nghĩ vậy đâu ${playerName}...", "Nguy hiểm lắm ${playerName} ơi!" / in English: "I don't think so ${playerName}...") and give a quick counter-reason.
- If a seeker bot replies to a hider player's taunt or claim, the seeker should fiercely disagree (e.g. in Vietnamese: "Tôi không nghĩ vậy đâu, ${playerName}! Quay lại nhìn sau lưng đi!" / in English: "I don't think so, ${playerName}! Check your six!").
- Address "${playerName || 'You'}" directly by name.
- Keep the reply natural and punchy (max 18 words, exactly one sentence).
- Set "stance" field to "agree" if agreeing, "disagree" if disagreeing, or "neutral" if purely greeting.

${languageInstruction}

Return ONLY valid JSON matching this schema:
{
  "botName": "Exact name of chosen bot",
  "botRole": "hider or seeker",
  "stance": "agree" or "disagree" or "neutral",
  "text": "Your punchy line to the player explicitly agreeing or disagreeing in the requested language"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const resultText = response.text?.trim();
    if (resultText) {
      const parsed = JSON.parse(resultText);
      return res.json(parsed);
    }

    return res.json({ fallback: true });
  } catch (err) {
    return res.json({ fallback: true });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
