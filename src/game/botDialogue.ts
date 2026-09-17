import { Character, GamePhase, PlayerRole, Language } from '../types';

export interface BotDialogueResult {
  bot: Character;
  text: string;
  stance: 'agree' | 'disagree' | 'neutral';
}

// Memory of when bots last spoke to prevent spamming
const lastSpokeMap = new Map<string, number>();
let lastGlobalBotChatTime = 0;

// Helper to check and update cooldown
export function canBotSpeak(botId: string, cooldownMs: number = 8000): boolean {
  const now = Date.now();
  const last = lastSpokeMap.get(botId) || 0;
  if (now - last < cooldownMs) return false;
  lastSpokeMap.set(botId, now);
  return true;
}

// Generate an intelligent in-game response when the player sends a chat/radio message
export function generateLocalBotReply(
  playerMessage: string,
  playerName: string,
  playerRole: PlayerRole,
  phase: GamePhase,
  characters: Character[],
  player: Character,
  excludeBotId?: string,
  language: Language = 'en'
): BotDialogueResult | null {
  const pName = playerName || (language === 'vi' ? 'Bạn' : 'You');
  const cleanMsg = playerMessage.toLowerCase().trim();
  const isVi = language === 'vi';

  // Pick a candidate bot (prefer living teammate or nearest bot)
  const livingBots = characters.filter((c) => c.isBot && !c.isCaught && c.id !== excludeBotId);
  if (livingBots.length === 0) return null;

  // Split bots into allies and seekers
  const allyBots = livingBots.filter((c) => c.role === playerRole);
  const enemyBots = livingBots.filter((c) => c.role !== playerRole);

  // Distance to nearest seeker
  const seekers = characters.filter((c) => c.role === 'seeker');
  let minDistToSeeker = 9999;
  for (const s of seekers) {
    const d = Math.hypot(s.x - player.x, s.y - player.y);
    if (d < minDistToSeeker) minDistToSeeker = d;
  }

  // Intent classification (Bilingual: English & Vietnamese)
  const isGreeting = /^(hi|hello|hey|yo|anyone|greetings|sup|chào|alo|helo|hé lô|chao)\b/i.test(cleanMsg);
  const isAskingSeeker = /(thợ săn|seeker|hunter|bắt được ai|ở đâu|thợ săn đâu|tìm thấy chưa|đang ở đâu|chỗ nào|thợ săn tới chưa)/i.test(cleanMsg);
  const isSafetyCheck = /(is it safe|clear|coast is clear|safe to move|can i move|seeker near|where is seeker|any sign|an toàn|có an toàn|thợ săn đâu|đi được chưa|ra được chưa)/i.test(cleanMsg);
  const isLockerPlan = /(locker|crate|box|wardrobe|recycle|tủ|thùng|rương|chui vào|trốn trong)/i.test(cleanMsg);
  const isSplitPlan = /(split up|separate|go different|scatter|spread out|tản ra|chia ra|tách ra)/i.test(cleanMsg);
  const isTogetherPlan = /(stick together|follow me|with me|stay together|group up|team up|đi chung|cùng nhau|đi theo tôi|tụ lại)/i.test(cleanMsg);
  const isRunPlan = /(run|sprint|rush|make a run|dash|bolt|hurry|chạy|chạy mau|chạy đi|chạy thôi)/i.test(cleanMsg);
  const isStayPlan = /(stay put|stay still|dont move|don't move|freeze|hold ground|camp|đứng yên|đừng nhúc nhích|ở yên|ngồi im)/i.test(cleanMsg);
  const isTaunt = /(catch me|cant catch|find me|too slow|seeker noob|blind|clueless|too easy|won't find|bắt tao đi|đố bắt được|gà|mù à|chậm thế|không bắt được đâu)/i.test(cleanMsg);
  const isQuietOrder = /(shh|quiet|hush|silence|mute|suỵt|im lặng|im|yên lặng|bé mồm)/i.test(cleanMsg);
  const isAgreeCheck = /(do you agree|agree or disagree|what do you think|should we|good idea|bad idea|\?|đồng ý không|nghĩ sao|nên không|có nên)/i.test(cleanMsg);

  let chosenBot: Character = allyBots[0] || livingBots[0];
  let replyText = '';
  let stance: 'agree' | 'disagree' | 'neutral' = 'neutral';

  // 1. Player Taunting or Belittling the Seeker
  if (isTaunt) {
    if (enemyBots.length > 0 && playerRole === 'hider') {
      chosenBot = enemyBots[0];
      stance = 'disagree';
      const seekerDisagrees = isVi
        ? [
            `Tôi không nghĩ vậy đâu, ${pName}! Quay đầu lại nhìn sau lưng xem!`,
            `Đừng có đắc ý sớm quá, ${pName}! Tôi đang dò sóng radio của bạn đấy!`,
            `Tôi không nghĩ bạn trốn thoát được đâu, ${pName}! Đèn pin chiếu tới là biết liền!`,
            `Chậm rãi thôi, ${pName}! Chỉ vài giây nữa là bạn hết cười nổi!`,
            `Nói to trên bộ đàm thế, ${pName}! Tôi đã định vị được tín hiệu của bạn rồi!`,
          ]
        : [
            `I don't think so, ${pName}! Turn around and check your six!`,
            `I really don't think so, ${pName}! I'm tracking your radio frequency right now!`,
            `I don't think you will, ${pName}! Let's see how fast you run when my flashlight hits you!`,
            `Not so fast, ${pName}! You won't be laughing in about 5 seconds!`,
          ];
      replyText = seekerDisagrees[Math.floor(Math.random() * seekerDisagrees.length)];
    } else {
      chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
      if (Math.random() > 0.45) {
        stance = 'disagree';
        const allyDisagrees = isVi
          ? [
              `Tôi không nghĩ thế đâu, đừng chủ quan ${pName}! Thợ săn này chạy nhanh lắm đấy!`,
              `Nói to trên kênh radio làm gì, ${pName}! Lộ vị trí cả lũ bây giờ!`,
              `Tôi không nghĩ nên gáy sớm đâu, ${pName}! Cẩn thận kẻo bị tóm đầu tiên!`,
              `Suỵt, giữ im lặng đi ${pName}! Họ đang lùng sục quanh đây đấy!`,
            ]
          : [
              `I don't think so, don't get cocky ${pName}! This seeker moves way too fast!`,
              `I don't think that's smart, ${pName}! Don't jinx us on the open radio channel!`,
              `I really don't think so, ${pName}! You're giving away our sector!`,
              `I wouldn't say that out loud, ${pName}! Keep your voice down!`,
            ];
        replyText = allyDisagrees[Math.floor(Math.random() * allyDisagrees.length)];
      } else {
        stance = 'agree';
        const allyAgrees = isVi
          ? [
              `Haha chuẩn luôn ${pName}! Nãy giờ họ đi ngang qua bụi cỏ mà không thấy!`,
              `Hoàn toàn đồng ý với ${pName}, vòng này chúng ta dắt mũi thợ săn ngon lành!`,
            ]
          : [
              `Haha agreed ${pName}! He literally walked past three of us in the bushes!`,
              `Totally agree ${pName}, we're running circles around them this round!`,
            ];
        replyText = allyAgrees[Math.floor(Math.random() * allyAgrees.length)];
      }
    }
  }
  // 1.5. Player Asking about the Seeker / Location
  else if (isAskingSeeker && enemyBots.length > 0 && playerRole === 'hider' && Math.random() < 0.7) {
    chosenBot = enemyBots[0];
    stance = 'disagree';
    const seekerReplies = isVi
      ? [
          `Tôi đang ở ngay gần bạn đấy, ${pName}! Liệu mà trốn cho kỹ!`,
          `Tìm bạn chứ tìm ai, ${pName}! Chuẩn bị tinh thần bị tóm đi!`,
          `Tôi vừa bắt được tín hiệu radio của bạn rồi nhé, ${pName}!`,
          `Hỏi làm gì ${pName}? Quay đầu lại xem có ánh đèn pin không!`,
          `Tôi đang rà soát từng ngóc ngách đây, ${pName}! Không thoát được đâu!`,
        ]
      : [
          `I'm closer than you think, ${pName}! Better hide well!`,
          `Looking for you, ${pName}! Get ready to get tagged!`,
          `I just intercepted your radio signal, ${pName}!`,
          `Why ask, ${pName}? Turn around and see the flashlight!`,
        ];
    replyText = seekerReplies[Math.floor(Math.random() * seekerReplies.length)];
  }
  // 2. Safety / Coast is Clear Check
  else if (isSafetyCheck) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    if (minDistToSeeker < 300) {
      stance = 'disagree';
      const dangerDisagrees = isVi
        ? [
            `Tôi không nghĩ an toàn đâu, ${pName}! Thợ săn cách chưa đầy 20m, CẤM cử động!`,
            `Nguy hiểm lắm ${pName}! Đèn pin của họ đang quét ngay gần bạn kìa, ngồi im!`,
            `Tuyệt đối không được ra, ${pName}! Nhúc nhích là bị tóm ngay lập tức!`,
            `Tôi thấy chưa ổn tí nào, ${pName}! Họ đang lượn lờ bên ngoài, nín thở đi!`,
          ]
        : [
            `I don't think so, ${pName}! Seeker is less than 20 meters away, do NOT move!`,
            `I really don't think so, ${pName}! I see their flashlight sweeping right near you, stay frozen!`,
            `Definitely not safe, ${pName}! I don't think you should move an inch!`,
            `I don't think that's clear at all, ${pName}! Threat is right outside, hold your breath!`,
          ];
      replyText = dangerDisagrees[Math.floor(Math.random() * dangerDisagrees.length)];
    } else {
      stance = 'agree';
      const clearAgrees = isVi
        ? [
            `Đồng ý với ${pName}! Thợ săn đang ở tít đầu kia bản đồ, tranh thủ đổi chỗ đi!`,
            `Hiện tại an toàn rồi đó ${pName}! Nhớ cúi thấp người khi di chuyển nhé!`,
            `Tôi cũng thấy vậy, ${pName}. Di chuyển nhanh trước khi họ quay lại!`,
          ]
        : [
            `I agree ${pName}! Seeker is across the map on radar, safe to relocate now!`,
            `Agreed ${pName}, coast is clear for the moment! Stay crouched!`,
            `I agree with that assessment, ${pName}. Move quickly before they double back!`,
          ];
      replyText = clearAgrees[Math.floor(Math.random() * clearAgrees.length)];
    }
  }
  // 3. Lockers / Crates / Wardrobe Plan
  else if (isLockerPlan) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    if (Math.random() > 0.48) {
      stance = 'agree';
      const lockerAgrees = isVi
        ? [
            `Tôi đồng ý với ${pName}! Chui vào tủ là che chắn được 100% ánh đèn pin!`,
            `Ý hay đó ${pName}, tôi cũng vừa chui tọt vào một cái thùng gỗ rồi!`,
            `Đồng ý luôn ${pName}! Chỗ này cực kỳ an toàn nếu thợ săn không trực tiếp mở ra!`,
          ]
        : [
            `I agree ${pName}! Lockers give 100% concealment from flashlight beams!`,
            `Agreed ${pName}, I'm sneaking into a nearby crate right now! Good call!`,
            `I'm with you on that, ${pName}! Lockers are the safest bet if they don't search inside!`,
          ];
      replyText = lockerAgrees[Math.floor(Math.random() * lockerAgrees.length)];
    } else {
      stance = 'disagree';
      const lockerDisagrees = isVi
        ? [
            `Tôi không nghĩ vậy đâu, ${pName}! Thợ săn mà lục tủ là hết đường chạy thoát!`,
            `Tôi thấy không nên đâu ${pName}! Mấy cái tủ với thùng là nơi họ mở đầu tiên!`,
            `Tôi không nghĩ nên chui vào đó, ${pName}! Bụi rậm rậm rạp có nhiều lối thoát hơn!`,
            `Đừng mạo hiểm ${pName}! Tự nhốt mình vào một chỗ dễ bị bắt trọn gói lắm!`,
          ]
        : [
            `I don't think so, ${pName}! If the seeker searches your locker, you have zero escape route!`,
            `I really don't think that's a good idea, ${pName}! Lockers are the first place they check!`,
            `I don't think so, ${pName}! High-density bushes are way safer and have multiple exits!`,
            `I wouldn't risk that, ${pName}! Trapping yourself in a box is asking to get tagged!`,
          ];
      replyText = lockerDisagrees[Math.floor(Math.random() * lockerDisagrees.length)];
    }
  }
  // 4. Splitting Up Plan
  else if (isSplitPlan) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    if (Math.random() > 0.45) {
      stance = 'agree';
      const splitAgrees = isVi
        ? [
            `Hoàn toàn đồng ý với ${pName}! Tản ra làm thợ săn mất công đuổi từng đứa một!`,
            `Đồng ý ${pName}, tôi lượn qua góc phía nam đây! Chúc may mắn!`,
          ]
        : [
            `I totally agree ${pName}! Splitting up forces the seeker to waste time chasing one by one!`,
            `Agreed ${pName}, I'm rotating to the south corner right now!`,
          ];
      replyText = splitAgrees[Math.floor(Math.random() * splitAgrees.length)];
    } else {
      stance = 'disagree';
      const splitDisagrees = isVi
        ? [
            `Tôi không nghĩ nên tách ra đâu, ${pName}! Ở gần nhau còn ném đá đánh lạc hướng cứu nhau được!`,
            `Tôi nghĩ đi theo cặp vẫn hơn, ${pName}! Tách lẻ dễ bị thợ săn tỉa từng người!`,
            `Chưa chắc đâu ${pName}! Giữ phòng tuyến khu này tốt hơn là chạy tán loạn!`,
          ]
        : [
            `I don't think so, ${pName}! If we stay in sound range we can throw decoy rocks to save each other!`,
            `I really don't think that's the play, ${pName}! Sticking in pairs keeps us covered!`,
            `Not so sure about that, ${pName}! There are better hiding spots if we hold this sector together!`,
          ];
      replyText = splitDisagrees[Math.floor(Math.random() * splitDisagrees.length)];
    }
  }
  // 5. Sticking Together / Following
  else if (isTogetherPlan) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    if (Math.random() > 0.5) {
      stance = 'agree';
      const togetherAgrees = isVi
        ? [
            `Đồng ý với ${pName}, tôi ở ngay sau bạn đây! Để ý bọc lót cho nhau nhé!`,
            `Tôi tán thành kế hoạch này, ${pName}! Đông người dễ yểm trợ hơn, đi thôi!`,
          ]
        : [
            `Agreed ${pName}, I'm right behind you! Let's watch each other's six!`,
            `I agree with that plan, ${pName}! Safety in numbers, let's move together!`,
          ];
      replyText = togetherAgrees[Math.floor(Math.random() * togetherAgrees.length)];
    } else {
      stance = 'disagree';
      const togetherDisagrees = isVi
        ? [
            `Tôi không nghĩ vậy đâu, ${pName}! Đi chùm lại cho thợ săn bắt combo à!`,
            `Tôi thấy đi chung nguy hiểm lắm, ${pName}! Hai người đi bộ tạo sóng âm thanh to gấp đôi!`,
            `Không nên đâu ${pName}! Phải tản ra thì họ mới không bắt hết một lượt được!`,
          ]
        : [
            `I don't think so, ${pName}! Grouping up makes us an easy double-tag for the seeker!`,
            `I really don't think so, ${pName}! Two sets of footsteps will attract the seeker instantly!`,
            `I don't think that's safe, ${pName}! We need to spread out so they can't catch us all at once!`,
          ];
      replyText = togetherDisagrees[Math.floor(Math.random() * togetherDisagrees.length)];
    }
  }
  // 6. Running / Sprinting
  else if (isRunPlan) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    if (minDistToSeeker < 250) {
      stance = 'agree';
      replyText = isVi
        ? `Đồng ý với ${pName}! Thợ săn đến sát mông rồi, chạy thục mạng đi!`
        : `Agreed ${pName}! Seeker is right on us, sprint for your life!`;
    } else {
      stance = 'disagree';
      const runDisagrees = isVi
        ? [
            `Tôi không nghĩ nên chạy đâu, ${pName}! Chạy tạo sóng âm thanh lớn trên radar đấy! Cúi người đi!`,
            `Không đời nào, chạy lúc này là tự sát đó ${pName}! Cứ nấp yên đi!`,
            `Tôi thấy chạy lúc này không khôn ngoan, ${pName}! Để dành thể lực lúc bị phát hiện thật sự đã!`,
            `Đừng manh động, ${pName}! Bạn đang gây ra quá nhiều tiếng động đó!`,
          ]
        : [
            `I don't think so, ${pName}! Sprinting creates giant sound ripples on radar! Crouch instead!`,
            `No way, I don't think so, ${pName}! Running is suicide right now, stay hidden!`,
            `I really don't think running is smart, ${pName}! Keep your stamina for when you actually get spotted!`,
            `I don't think that's the move, ${pName}! You're making way too much noise!`,
          ];
      replyText = runDisagrees[Math.floor(Math.random() * runDisagrees.length)];
    }
  }
  // 7. Staying Put
  else if (isStayPlan || isQuietOrder) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    stance = 'agree';
    const stayAgrees = isVi
      ? [
          `Đồng ý 100% với ${pName}! Đứng im không tạo tiếng động nào, bất động như đá đi!`,
          `Nhất trí ${pName}, im lặng tuyệt đối trên sóng radio ngay lúc này!`,
          `Tôi đồng ý ở yên tại chỗ, ${pName}. Đừng để họ nghe thấy bất kỳ âm thanh nào!`,
        ]
      : [
          `100% agree ${pName}! Zero sound ripples while standing still, stay frozen!`,
          `Agreed ${pName}, radio silence and zero movement right now!`,
          `I agree with staying put, ${pName}. Don't let them hear a thing!`,
        ];
    replyText = stayAgrees[Math.floor(Math.random() * stayAgrees.length)];
  }
  // 8. General Questions / Suggestions
  else if (isAgreeCheck) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    if (Math.random() > 0.5) {
      stance = 'agree';
      const generalAgrees = isVi
        ? [
            `Tôi đồng ý với ${pName}! Đó là nước đi chiến thuật thông minh nhất!`,
            `Nhất trí 100% luôn, ${pName}! Cứ triển khai theo kế hoạch đó đi!`,
            `Tôi ủng hộ bạn, ${pName}! Ý kiến rất chuẩn!`,
            `Đúng rồi đó, tôi hoàn toàn đồng tình với ${pName}! Triển thôi!`,
          ]
        : [
            `I agree with you ${pName}! That's our smartest tactical play!`,
            `Agreed 100%, ${pName}! Let's execute that plan!`,
            `I'm with you on that, ${pName}! Good call!`,
            `Yes, I completely agree ${pName}! Let's do it!`,
          ];
      replyText = generalAgrees[Math.floor(Math.random() * generalAgrees.length)];
    } else {
      stance = 'disagree';
      const generalDisagrees = isVi
        ? [
            `Tôi không nghĩ vậy đâu, ${pName}! Thợ săn đang tuần tra gắt gao lắm, nguy hiểm cực kỳ!`,
            `Tôi thấy không ổn tí nào, ${pName}! Chúng ta nên phòng thủ và giữ kín chỗ nấp!`,
            `Tôi không nghĩ đó là ý hay đâu, ${pName}. Rất dễ bị phát hiện!`,
            `Đừng làm vậy ${pName}! Kế hoạch đó có quá nhiều sơ hở!`,
            `Thành thật mà nói tôi không đồng ý, ${pName}. Cứ giữ nguyên vị trí hiện tại đã!`,
          ]
        : [
            `I don't think so, ${pName}! That's way too dangerous with this seeker around!`,
            `I really don't think so, ${pName}! We need to play defensively and preserve our spots!`,
            `I don't think that's a good idea, ${pName}. We'll definitely get caught!`,
            `I wouldn't do that, ${pName}! That plan has too many blind spots!`,
            `Honestly, I don't think so, ${pName}. Let's stick to our current cover!`,
          ];
      replyText = generalDisagrees[Math.floor(Math.random() * generalDisagrees.length)];
    }
  }
  // 9. Greetings
  else if (isGreeting) {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    stance = 'neutral';
    const greetReplies = isVi
      ? [
          `Chào ${pName}! Sẵn sàng cho thợ săn hít khói vòng này chưa?`,
          `Hé lô ${pName}! Cúi đầu xuống và chú ý quan sát nhé!`,
          `Có tôi đây ${pName}! Cùng nhau sống sót tới giây cuối cùng nào!`,
        ]
      : [
          `Hey ${pName}! Ready to outwit the seeker this round?`,
          `Yo ${pName}! Keep your head down and stay frosty!`,
          `What's up ${pName}! Let's make sure our squad survives!`,
        ];
    replyText = greetReplies[Math.floor(Math.random() * greetReplies.length)];
  }
  // 10. General Fallback
  else {
    chosenBot = allyBots[Math.floor(Math.random() * allyBots.length)] || livingBots[0];
    if (Math.random() > 0.5) {
      stance = 'agree';
      const fallbackAgrees = isVi
        ? [
            `Tôi đồng ý với ${pName}, chúng ta cùng chung chí hướng! Trận này phải thắng!`,
            `Nhất trí với ${pName}! Tôi tin tưởng quyết định của bạn!`,
            `Ý kiến hay đó ${pName}, tôi hoàn toàn ủng hộ!`,
          ]
        : [
            `I agree ${pName}, we're on the same page! Let's win this!`,
            `Agreed ${pName}! I trust your call on this one!`,
            `Good point ${pName}, I agree with that!`,
          ];
      replyText = fallbackAgrees[Math.floor(Math.random() * fallbackAgrees.length)];
    } else {
      stance = 'disagree';
      const fallbackDisagrees = isVi
        ? [
            `Tôi không nghĩ vậy đâu, ${pName}. Cứ thận trọng quan sát thêm một chút đã!`,
            `Tôi thấy chưa ổn lắm, ${pName}! Tình hình vòng này đang rất khó lường!`,
            `Tôi không nghĩ đó là nước đi đúng đắn, ${pName}. Ưu tiên số một là không để lộ vị trí!`,
            `Chưa chắc đâu nhé, ${pName}! Đợi thợ săn đi khuất rồi tính tiếp!`,
          ]
        : [
            `I don't think so, ${pName}. Better to stay cautious and observe!`,
            `I really don't think so, ${pName}! The situation is way too unpredictable right now!`,
            `I don't think that's the right play, ${pName}. Let's focus on staying undetected first!`,
            `Not so sure about that, ${pName}! Let's wait until the seeker passes!`,
          ];
      replyText = fallbackDisagrees[Math.floor(Math.random() * fallbackDisagrees.length)];
    }
  }

  return { bot: chosenBot, text: replyText, stance };
}

// Optional API call to Gemini server endpoint with instant fallback
export async function getBotReplyFromAIOrLocal(
  playerMessage: string,
  playerName: string,
  playerRole: PlayerRole,
  phase: GamePhase,
  characters: Character[],
  player: Character,
  language: Language = 'en'
): Promise<BotDialogueResult | null> {
  // Always prepare local fallback
  const localFallback = generateLocalBotReply(
    playerMessage,
    playerName,
    playerRole,
    phase,
    characters,
    player,
    undefined,
    language
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch('/api/bot-talk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerMessage,
        playerName: playerName || (language === 'vi' ? 'Bạn' : 'You'),
        playerRole,
        phase,
        characters: characters.map((c) => ({
          name: c.name,
          role: c.role,
          isCaught: c.isCaught,
          isBot: c.isBot,
        })),
        language,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.text && data.botName) {
        // Find matching bot
        const matchedBot = characters.find(
          (c) => c.isBot && c.name.toLowerCase().includes(data.botName.toLowerCase().replace('[bot]', '').trim())
        );
        const stance: 'agree' | 'disagree' | 'neutral' =
          data.stance === 'agree' || data.stance === 'disagree' || data.stance === 'neutral'
            ? data.stance
            : /disagree|don't think so|don't think that|no way|bad idea|terrible|i wouldn't|definitely not|not so sure|không nghĩ|không nên|nguy hiểm|sai rồi/i.test(data.text)
            ? 'disagree'
            : /agree|good idea|great call|yes|with you|totally|đồng ý|nhất trí|tán thành|chuẩn|ý hay/i.test(data.text)
            ? 'agree'
            : 'neutral';

        if (matchedBot && !matchedBot.isCaught) {
          return { bot: matchedBot, text: data.text, stance };
        }
        if (localFallback) {
          return { bot: localFallback.bot, text: data.text, stance };
        }
      }
    }
  } catch {
    // Timeout or fetch error -> use local fallback seamlessly
  }

  return localFallback;
}

// Optional secondary bot to chime in or argue with the primary bot
export function getSecondaryBotReply(
  playerMessage: string,
  playerName: string,
  playerRole: PlayerRole,
  phase: GamePhase,
  characters: Character[],
  player: Character,
  primaryBotId: string,
  language: Language = 'en'
): BotDialogueResult | null {
  const otherBots = characters.filter((c) => c.isBot && !c.isCaught && c.id !== primaryBotId);
  if (otherBots.length === 0) return null;

  return generateLocalBotReply(
    playerMessage,
    playerName,
    playerRole,
    phase,
    characters,
    player,
    primaryBotId,
    language
  );
}

// Proximity & event-based in-game whispers directed to the player
export function checkInGameProximityDialogue(
  player: Character,
  characters: Character[],
  phase: GamePhase,
  phaseTimeLeft: number,
  onBotSpeak: (bot: Character, text: string) => void,
  language: Language = 'en'
) {
  if (phase !== 'seeking' && phase !== 'hiding') return;
  const now = Date.now();
  const isVi = language === 'vi';

  // Throttle global bot speech so it feels natural, not overwhelming (min 4.5s between ambient bot whispers)
  if (now - lastGlobalBotChatTime < 4500) return;

  const pName = player.name || (isVi ? 'Bạn' : 'You');

  // SCENARIO 1: Hiding Phase Countdown Encouragement (first 10 seconds)
  if (phase === 'hiding' && phaseTimeLeft > 5) {
    const nearbyAlly = characters.find(
      (c) => c.isBot && c.role === player.role && !c.isCaught && Math.hypot(c.x - player.x, c.y - player.y) < 140
    );
    if (nearbyAlly && canBotSpeak(nearbyAlly.id, 25000)) {
      lastGlobalBotChatTime = now;
      const lines = isVi
        ? [
            `Nhanh lên ${pName}, tìm chỗ trốn ngon trước khi hết giờ kìa!`,
            `Chúc may mắn ${pName}, cùng nhau sống sót qua ván này nhé!`,
            `Tôi chui vào mấy cái thùng đây ${pName}! Bạn tìm góc khác đi!`,
          ]
        : [
            `Hurry ${pName}, find a good spot before time runs out!`,
            `Good luck ${pName}, let's make sure we survive!`,
            `I'm heading for the crates, ${pName}! You find another spot!`,
          ];
      onBotSpeak(nearbyAlly, lines[Math.floor(Math.random() * lines.length)]);
      return;
    }
  }

  if (phase !== 'seeking') return;

  // SCENARIO 2: Player is Hider, hiding near a fellow bot hider
  if (player.role === 'hider' && !player.isCaught) {
    const nearbyHiderBot = characters.find(
      (c) => c.isBot && c.role === 'hider' && !c.isCaught && Math.hypot(c.x - player.x, c.y - player.y) < 110
    );

    if (nearbyHiderBot && canBotSpeak(nearbyHiderBot.id, 14000)) {
      lastGlobalBotChatTime = now;
      const whisperLines = isVi
        ? [
            `Suỵt ${pName}, nín thở đi...`,
            `Im lặng ${pName}, đừng nhúc nhích một li nào!`,
            `Chỗ này đủ cho cả hai chúng ta đó ${pName}. Giữ yên lặng nha!`,
            `Tôi nghe thấy tiếng bước chân bên ngoài rồi ${pName}... im nào!`,
            `Chỗ trốn đẹp đấy ${pName}. Đừng có ngó đầu ra nhé!`,
          ]
        : [
            `Psst ${pName}, hold your breath...`,
            `Shhh ${pName}, don't move a muscle!`,
            `Room for both of us here, ${pName}. Just stay quiet!`,
            `I hear footsteps outside, ${pName}... quiet!`,
            `Nice hiding spot, ${pName}. Don't peek!`,
          ];
      onBotSpeak(nearbyHiderBot, whisperLines[Math.floor(Math.random() * whisperLines.length)]);
      return;
    }

    // SCENARIO 3: Seeker Bot searching dangerously close to the player (< 130)
    const nearbySeeker = characters.find(
      (c) => c.isBot && c.role === 'seeker' && Math.hypot(c.x - player.x, c.y - player.y) < 130
    );

    if (nearbySeeker && canBotSpeak(nearbySeeker.id, 12000)) {
      lastGlobalBotChatTime = now;
      if (player.hidingSpotId) {
        const lockerLines = isVi
          ? [
              `Tôi nghe thấy tiếng thở dốc trong mấy cái tủ này đó, ${pName}...`,
              `Đang lục từng cái hộc đây, ${pName}... chuẩn bị tinh thần đi!`,
              `Đừng nín thở nữa, tôi nghe rõ tiếng tim bạn đập rồi, ${pName}!`,
              `Có người trốn trong cái góc này! Để tôi mở nắp ra xem nào!`,
              `Tôi biết bạn đang ở rất gần đây, ${pName}... bước ra tự thú đi!`,
            ]
          : [
              `I can hear breathing in one of these boxes, ${pName}...`,
              `Checking every locker, ${pName}... come out!`,
              `I know you're close by, ${pName}...`,
            ];
        onBotSpeak(nearbySeeker, lockerLines[Math.floor(Math.random() * lockerLines.length)]);
      } else {
        const spotLines = isVi
          ? [
              `Tôi thấy dấu vết của bạn rồi nhé, ${pName}!`,
              `Hết đường trốn thoát rồi, ${pName}!`,
              `Bắt quả tang bạn rồi, ${pName}! Chạy đâu cho thoát!`,
              `Tia đèn pin của tôi đang rọi ngay chân bạn kìa, ${pName}!`,
              `Đứng im đấy ${pName}! Bạn không chạy nhanh hơn tôi đâu!`,
            ]
          : [
              `I see your tracks, ${pName}!`,
              `Nowhere left to hide, ${pName}!`,
              `Found you, ${pName}! You can't outrun me!`,
            ];
        onBotSpeak(nearbySeeker, spotLines[Math.floor(Math.random() * spotLines.length)]);
      }
      return;
    }
  }

  // SCENARIO 4: Player is Seeker, approaching a hidden bot (< 100)
  if (player.role === 'seeker') {
    const nearbyHider = characters.find(
      (c) => c.isBot && c.role === 'hider' && !c.isCaught && Math.hypot(c.x - player.x, c.y - player.y) < 95
    );

    if (nearbyHider && canBotSpeak(nearbyHider.id, 12000)) {
      lastGlobalBotChatTime = now;
      const panicWhispers = isVi
        ? [
            `*thì thầm* Trời ơi xin đừng nhìn qua bên này, ${pName}...`,
            `*hút hoảng* Cứ đi thẳng qua đi mà, ${pName}...`,
            `Làm ơn đừng có rọi đèn pin về phía tôi, ${pName}!`,
            `*đang nín thở trước ${pName}*`,
          ]
        : [
            `*whispers* Oh please don't check over here, ${pName}...`,
            `*gasp* Keep walking past, ${pName}...`,
            `Please don't turn on that flashlight, ${pName}!`,
            `*holding breath from ${pName}*`,
          ];
      onBotSpeak(nearbyHider, panicWhispers[Math.floor(Math.random() * panicWhispers.length)]);
      return;
    }
  }
}
