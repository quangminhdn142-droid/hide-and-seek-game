import { HidingSpotQuestion, HidingSpotType, GameMap } from '../types';

export const HIDING_QUESTIONS: HidingSpotQuestion[] = [
  // ==========================================
  // PHẦN 1: TOÁN LỚP 6 (GRADE 6 MATHEMATICS)
  // ==========================================

  // 0 - Toán 6: Phép cộng số nguyên khác dấu
  {
    question: 'Grade 6 Math: What is the value of (-18) + 30?',
    questionVi: 'Toán lớp 6: Giá trị của phép tính (-18) + 30 là:',
    options: ['-12', '12', '-48', '48'],
    optionsVi: ['-12', '12', '-48', '48'],
    correctIndex: 1,
    hint: 'Adding integers with different signs: 30 - 18 = 12.',
    hintVi: 'Quy tắc cộng hai số nguyên khác dấu: lấy số lớn trừ số bé, mang dấu số có giá trị tuyệt đối lớn hơn: 30 - 18 = 12.',
  },

  // 1 - Toán 6: Phép nhân hai số nguyên âm
  {
    question: 'Grade 6 Math: What is the product of (-6) × (-8)?',
    questionVi: 'Toán lớp 6: Kết quả của phép nhân hai số nguyên (-6) × (-8) là:',
    options: ['-48', '48', '-14', '14'],
    optionsVi: ['-48', '48', '-14', '14'],
    correctIndex: 1,
    hint: 'Multiplying two negative numbers gives a positive product: (-) × (-) = (+).',
    hintVi: 'Tích của hai số nguyên âm luôn là một số nguyên dương: (-) × (-) = (+).',
  },

  // 2 - Toán 6: Ước chung lớn nhất (ƯCLN)
  {
    question: 'Grade 6 Math: What is the Greatest Common Divisor (GCD) of 36 and 54?',
    questionVi: 'Toán lớp 6: Ước chung lớn nhất (ƯCLN) của hai số 36 và 54 là bao nhiêu?',
    options: ['9', '6', '18', '27'],
    optionsVi: ['9', '6', '18', '27'],
    correctIndex: 2,
    hint: '36 = 2² × 3², 54 = 2 × 3³. GCD = 2 × 3² = 18.',
    hintVi: 'Phân tích ra thừa số nguyên tố: 36 = 2² × 3² và 54 = 2 × 3³. ƯCLN(36, 54) = 2 × 3² = 18.',
  },

  // 3 - Toán 6: Bội chung nhỏ nhất (BCNN)
  {
    question: 'Grade 6 Math: What is the Least Common Multiple (LCM) of 12 and 18?',
    questionVi: 'Toán lớp 6: Bội chung nhỏ nhất (BCNN) của hai số 12 và 18 là bao nhiêu?',
    options: ['24', '36', '72', '48'],
    optionsVi: ['24', '36', '72', '48'],
    correctIndex: 1,
    hint: '12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 36.',
    hintVi: 'Phân tích: 12 = 2² × 3, 18 = 2 × 3². BCNN(12, 18) = 2² × 3² = 36.',
  },

  // 4 - Toán 6: Lũy thừa với số mũ tự nhiên
  {
    question: 'Grade 6 Math: Calculate the value of the exponent: 2⁵ = ?',
    questionVi: 'Toán lớp 6: Giá trị của lũy thừa 2⁵ (hai lũy thừa năm) là:',
    options: ['10', '25', '32', '64'],
    optionsVi: ['10', '25', '32', '64'],
    correctIndex: 2,
    hint: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32.',
    hintVi: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32 (không phải lấy 2 × 5).',
  },

  // 5 - Toán 6: Thứ tự thực hiện phép tính có ngoặc vuông
  {
    question: 'Grade 6 Math: Compute: 50 - [30 - (6 - 2)²] = ?',
    questionVi: 'Toán lớp 6: Thực hiện thứ tự phép tính: 50 - [30 - (6 - 2)²] = ?',
    options: ['34', '36', '4', '42'],
    optionsVi: ['34', '36', '4', '42'],
    correctIndex: 1,
    hint: '(6 - 2)² = 4² = 16. Inside brackets: 30 - 16 = 14. Then 50 - 14 = 36.',
    hintVi: 'Trong ngoặc tròn trước: (6 - 2)² = 16. Trong ngoặc vuông: 30 - 16 = 14. Cuối cùng: 50 - 14 = 36.',
  },

  // 6 - Toán 6: Dấu hiệu chia hết cho 2, 3 và 5
  {
    question: 'Grade 6 Math: Which number below is divisible by all three numbers: 2, 3, and 5?',
    questionVi: 'Toán lớp 6: Số nào trong các số sau chia hết cho cả ba số: 2, 3 và 5?',
    options: ['135', '250', '120', '112'],
    optionsVi: ['135', '250', '120', '112'],
    correctIndex: 2,
    hint: 'Ends in 0 (divisible by 2 and 5) and sum of digits 1 + 2 + 0 = 3 (divisible by 3).',
    hintVi: 'Tận cùng bằng 0 thì chia hết cho cả 2 và 5. Tổng các chữ số (1 + 2 + 0 = 3) chia hết cho 3. Vậy là số 120.',
  },

  // 7 - Toán 6: Số nguyên tố
  {
    question: 'Grade 6 Math: Which of the following numbers is a prime number (số nguyên tố)?',
    questionVi: 'Toán lớp 6: Số nào dưới đây là một số nguyên tố?',
    options: ['39', '49', '51', '29'],
    optionsVi: ['39', '49', '51', '29'],
    correctIndex: 3,
    hint: '39 = 3 × 13, 49 = 7², 51 = 3 × 17. Only 29 has exactly two divisors (1 and itself).',
    hintVi: '39 chia hết cho 3, 49 chia hết cho 7, 51 chia hết cho 3. Chỉ có 29 chỉ chia hết cho 1 và chính nó.',
  },

  // 8 - Toán 6: Cộng hai phân số không cùng mẫu
  {
    question: 'Grade 6 Math: Calculate the sum of fractions: 1/4 + 2/3 = ?',
    questionVi: 'Toán lớp 6: Thực hiện phép cộng phân số không cùng mẫu: 1/4 + 2/3 = ?',
    options: ['3/7', '11/12', '7/12', '3/12'],
    optionsVi: ['3/7', '11/12', '7/12', '3/12'],
    correctIndex: 1,
    hint: 'Common denominator is 12: 3/12 + 8/12 = 11/12.',
    hintVi: 'Quy đồng mẫu số chung là 12: 3/12 + 8/12 = 11/12.',
  },

  // 9 - Toán 6: Chia hai phân số
  {
    question: 'Grade 6 Math: Calculate the quotient of fractions: (3/5) ÷ (9/10) = ?',
    questionVi: 'Toán lớp 6: Thực hiện phép chia hai phân số: (3/5) : (9/10) = ?',
    options: ['2/3', '27/50', '3/2', '1/3'],
    optionsVi: ['2/3', '27/50', '3/2', '1/3'],
    correctIndex: 0,
    hint: '(3/5) × (10/9) = (3 × 10) / (5 × 9) = 30/45 = 2/3.',
    hintVi: 'Nhân với phân số nghịch đảo: (3/5) × (10/9) = 30/45 = 2/3.',
  },

  // 10 - Toán 6: Giá trị phân số của một số
  {
    question: 'Grade 6 Math: Find 3/4 of 60 kg:',
    questionVi: 'Toán lớp 6: Tìm giá trị 3/4 của 60 kg:',
    options: ['40 kg', '50 kg', '45 kg', '35 kg'],
    optionsVi: ['40 kg', '50 kg', '45 kg', '35 kg'],
    correctIndex: 2,
    hint: '60 × (3/4) = (60 ÷ 4) × 3 = 45 kg.',
    hintVi: 'Muốn tìm m/n của số a, ta lấy a × m/n = 60 × (3/4) = 45 kg.',
  },

  // 11 - Toán 6: Tìm một số biết giá trị phân số của nó
  {
    question: 'Grade 6 Math: Find a number x knowing that 2/5 of x is equal to 30:',
    questionVi: 'Toán lớp 6: Tìm một số biết rằng 2/5 của số đó bằng 30:',
    options: ['75', '60', '50', '12'],
    optionsVi: ['75', '60', '50', '12'],
    correctIndex: 0,
    hint: 'x = 30 ÷ (2/5) = 30 × (5/2) = 75.',
    hintVi: 'Muốn tìm một số biết m/n của nó bằng a, ta lấy a : (m/n) = 30 : (2/5) = 75.',
  },

  // 12 - Toán 6: Làm tròn số thập phân
  {
    question: 'Grade 6 Math: Round the decimal 18.765 to the nearest tenth (one decimal place):',
    questionVi: 'Toán lớp 6: Làm tròn số thập phân 18,765 đến hàng phần mười (chữ số thập phân thứ nhất):',
    options: ['18.7', '18.76', '18.8', '19.0'],
    optionsVi: ['18,7', '18,76', '18,8', '19,0'],
    correctIndex: 2,
    hint: 'The next digit is 6 (≥ 5), so round up: 18.7 + 0.1 = 18.8.',
    hintVi: 'Chữ số ngay sau hàng phần mười là 6 (≥ 5), nên ta cộng thêm 1 vào chữ số hàng phần mười: 18,8.',
  },

  // 13 - Toán 6: Tỉ số phần trăm và giảm giá
  {
    question: 'Grade 6 Math: A shirt priced at $200 is discounted by 15%. How much is the discount?',
    questionVi: 'Toán lớp 6: Một chiếc áo có giá niêm yết 200.000 đồng được giảm giá 15%. Số tiền được giảm là:',
    options: ['25.000 đồng', '30.000 đồng', '35.000 đồng', '15.000 đồng'],
    optionsVi: ['25.000 đồng', '30.000 đồng', '35.000 đồng', '15.000 đồng'],
    correctIndex: 1,
    hint: '200,000 × 15% = 200,000 × 0.15 = 30,000.',
    hintVi: 'Số tiền giảm giá = 200.000 × 15% = 200.000 × 0,15 = 30.000 đồng.',
  },

  // 14 - Toán 6: Hình học trực quan - Diện tích hình thoi
  {
    question: 'Grade 6 Math: A rhombus has diagonal lengths of 12 cm and 8 cm. What is its area?',
    questionVi: 'Toán lớp 6: Một hình thoi có độ dài hai đường chéo là 12 cm và 8 cm. Diện tích của hình thoi là:',
    options: ['96 cm²', '48 cm²', '20 cm²', '40 cm²'],
    optionsVi: ['96 cm²', '48 cm²', '20 cm²', '40 cm²'],
    correctIndex: 1,
    hint: 'Area of a rhombus = (d₁ × d₂) ÷ 2 = (12 × 8) ÷ 2 = 48 cm².',
    hintVi: 'Diện tích hình thoi bằng nửa tích độ dài hai đường chéo: S = (d₁ × d₂) : 2 = (12 × 8) : 2 = 48 cm².',
  },

  // 15 - Toán 6: Hình học trực quan - Chu vi lục giác đều
  {
    question: 'Grade 6 Math: A regular hexagon has side lengths of 6 cm. What is its perimeter?',
    questionVi: 'Toán lớp 6: Một hình lục giác đều có độ dài mỗi cạnh là 6 cm. Chu vi của hình lục giác đều đó là:',
    options: ['24 cm', '30 cm', '36 cm', '42 cm'],
    optionsVi: ['24 cm', '30 cm', '36 cm', '42 cm'],
    correctIndex: 2,
    hint: 'A regular hexagon has 6 equal sides: Perimeter = 6 × 6 = 36 cm.',
    hintVi: 'Hình lục giác đều có 6 cạnh bằng nhau: Chu vi P = 6 × 6 = 36 cm.',
  },

  // 16 - Toán 6: Diện tích hình bình hành
  {
    question: 'Grade 6 Math: A parallelogram has a base of 15 cm and a corresponding height of 8 cm. What is its area?',
    questionVi: 'Toán lớp 6: Một hình bình hành có độ dài cạnh đáy là 15 cm và chiều cao tương ứng là 8 cm. Diện tích hình bình hành là:',
    options: ['60 cm²', '120 cm²', '46 cm²', '90 cm²'],
    optionsVi: ['60 cm²', '120 cm²', '46 cm²', '90 cm²'],
    correctIndex: 1,
    hint: 'Area of parallelogram = base × height = 15 × 8 = 120 cm².',
    hintVi: 'Diện tích hình bình hành S = đáy × chiều cao = 15 × 8 = 120 cm².',
  },

  // 17 - Toán 6: Trung điểm của đoạn thẳng
  {
    question: 'Grade 6 Math: Point M is the midpoint of segment AB of length 14 cm. What is the length of AM?',
    questionVi: 'Toán lớp 6: Điểm M là trung điểm của đoạn thẳng AB có độ dài 14 cm. Độ dài đoạn thẳng AM là:',
    options: ['7 cm', '28 cm', '3.5 cm', '10 cm'],
    optionsVi: ['7 cm', '28 cm', '3,5 cm', '10 cm'],
    correctIndex: 0,
    hint: 'The midpoint divides the segment into two equal halves: AM = AB ÷ 2 = 7 cm.',
    hintVi: 'Trung điểm chia đoạn thẳng thành hai nửa bằng nhau: AM = AB : 2 = 14 : 2 = 7 cm.',
  },

  // 18 - Toán 6: Góc tù
  {
    question: 'Grade 6 Math: An angle measuring 120° is classified as what kind of angle?',
    questionVi: 'Toán lớp 6: Góc có số đo bằng 120° thuộc loại góc nào?',
    options: ['Góc nhọn (Acute)', 'Góc vuông (Right)', 'Góc tù (Obtuse)', 'Góc bẹt (Straight)'],
    optionsVi: ['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt'],
    correctIndex: 2,
    hint: 'Angles strictly between 90° and 180° are obtuse angles.',
    hintVi: 'Góc có số đo lớn hơn 90° và nhỏ hơn 180° gọi là góc tù.',
  },

  // 19 - Toán 6: Xác suất thực nghiệm
  {
    question: 'Grade 6 Math: A 6-sided die is rolled 20 times, landing on face "5" exactly 6 times. What is the experimental probability of getting "5"?',
    questionVi: 'Toán lớp 6: Gieo một con xúc xắc 6 mặt 20 lần, thấy có 6 lần xuất hiện mặt 5 chấm. Xác suất thực nghiệm xuất hiện mặt 5 chấm là:',
    options: ['1/6', '3/10 (0,3)', '1/20', '6/10'],
    optionsVi: ['1/6', '3/10 (0,3)', '1/20', '6/10'],
    correctIndex: 1,
    hint: 'Experimental probability = Successful occurrences ÷ Total trials = 6 / 20 = 3/10 = 0.3.',
    hintVi: 'Xác suất thực nghiệm = Số lần xảy ra biến cố : Tổng số lần thực nghiệm = 6 / 20 = 3/10 = 0,3.',
  },

  // ============================================================
  // PHẦN 2: NGỮ VĂN & TIẾNG VIỆT LỚP 6 (GRADE 6 LITERATURE)
  // ============================================================

  // 20 - Ngữ văn 6: Truyền thuyết Thánh Gióng
  {
    question: 'Grade 6 Literature: In the legend of Thánh Gióng, at which mountain peak did Gióng ascend to heaven after vanquishing the Ân invaders?',
    questionVi: 'Ngữ văn 6: Trong truyền thuyết "Thánh Gióng", sau khi đánh tan giặc Ân xâm lược, Thánh Gióng đã cưỡi ngựa bay về trời tại đỉnh núi nào?',
    options: ['Núi Sóc (Sóc Sơn)', 'Núi Ba Vì', 'Núi Yên Tử', 'Núi Tản Viên'],
    optionsVi: ['Núi Sóc (Sóc Sơn)', 'Núi Ba Vì', 'Núi Yên Tử', 'Núi Tản Viên'],
    correctIndex: 0,
    hint: 'Located in Sóc Sơn, Hanoi, where the historic Gióng festival takes place annually.',
    hintVi: 'Gióng lên đỉnh núi Sóc (huyện Sóc Sơn, Hà Nội), cởi giáp sắt rồi cùng ngựa bay về trời.',
  },

  // 21 - Ngữ văn 6: Truyện Bánh chưng bánh giầy
  {
    question: 'Grade 6 Literature: In "Bánh chưng, bánh giầy", which prince was inspired by a deity in a dream to craft the two cakes symbolizing Heaven and Earth?',
    questionVi: 'Ngữ văn 6: Trong truyện "Bánh chưng, bánh giầy", người con thứ mấy của vua Hùng được thần báo mộng làm hai thứ bánh tượng trưng cho Trời và Đất?',
    options: ['Lang Liêu (chàng Liêu)', 'Mai An Tiêm', 'Sơn Tinh', 'Thạch Sanh'],
    optionsVi: ['Lang Liêu (chàng Liêu)', 'Mai An Tiêm', 'Sơn Tinh', 'Thạch Sanh'],
    correctIndex: 0,
    hint: 'The modest, hardworking 18th prince who lived close to agricultural fields.',
    hintVi: 'Lang Liêu - chàng hoàng tử thứ 18 tính tình chăm chỉ, gắn bó với ruộng đồng nông nghiệp.',
  },

  // 22 - Ngữ văn 6: Truyện cổ tích Thạch Sanh - Niêu cơm thần
  {
    question: 'Grade 6 Literature: What wondrous magical property did Thạch Sanh’s enchanted rice pot (niêu cơm thần) possess when feeding the soldiers of 18 vassal states?',
    questionVi: 'Ngữ văn 6: Trong truyện cổ tích "Thạch Sanh", niêu cơm thần thết đãi quân sĩ 18 nước chư hầu có đặc điểm kỳ diệu gì?',
    options: [
      'Biến gạo thành châu báu vàng bạc.',
      'Cứ ăn hết lại tự động đầy lên, ăn mãi không bao giờ vơi.',
      'Ăn vào giúp binh lính tàng hình.',
      'Chỉ người dũng cảm mới mở được nắp.',
    ],
    optionsVi: [
      'Biến gạo thành châu báu vàng bạc.',
      'Cứ ăn hết lại tự động đầy lên, ăn mãi không bao giờ vơi.',
      'Ăn vào giúp binh lính tàng hình.',
      'Chỉ người dũng cảm mới mở được nắp.',
    ],
    correctIndex: 1,
    hint: 'No matter how much the enemy soldiers ate, the pot constantly refilled itself, symbolizing peaceful goodwill.',
    hintVi: 'Niêu cơm tí hon nhưng quân lính ăn mãi không bao giờ hết, tượng trưng cho lòng nhân ái, chuộng hòa bình của dân tộc.',
  },

  // 23 - Ngữ văn 6: Bài học đường đời đầu tiên (Dế Mèn phiêu lưu ký - Tô Hoài)
  {
    question: 'Grade 6 Literature: In Tô Hoài’s "Bài học đường đời đầu tiên", who tragically died because of Dế Mèn’s reckless teasing of Chị Cốc?',
    questionVi: 'Ngữ văn 6: Trong đoạn trích "Bài học đường đời đầu tiên" (Dế Mèn phiêu lưu ký - Tô Hoài), nhân vật nào đã phải chịu cái chết oan ức vì trò ngỗ nghịch trêu chị Cốc của Dế Mèn?',
    options: ['Dế Choắt', 'Dế Trũi', 'Bọ Ngựa', 'Xiến Tóc'],
    optionsVi: ['Dế Choắt', 'Dế Trũi', 'Bọ Ngựa', 'Xiến Tóc'],
    correctIndex: 0,
    hint: 'The sickly, slender neighbor crickets who was beaten by Chị Cốc.',
    hintVi: 'Dế Choắt gầy gò, ốm yếu đã bị chị Cốc mổ oan dẫn đến cái chết thương tâm, để lại bài học thấm thía cho Dế Mèn.',
  },

  // 24 - Ngữ văn 6: Truyện ngắn Cô bé bán diêm (Andersen)
  {
    question: 'Grade 6 Literature: In Andersen’s "The Little Match Girl", what vision appeared in the final match flame on that freezing New Year’s Eve?',
    questionVi: 'Ngữ văn 6: Trong truyện ngắn "Cô bé bán diêm" (Andersen), khi quẹt hết tất cả những que diêm còn lại, hình ảnh người thân yêu nào đã hiện ra dịu hiền bên cô bé?',
    options: ['Người mẹ tảo tần', 'Người bà hiền hậu', 'Cô giáo cũ', 'Người cha'],
    optionsVi: ['Người mẹ tảo tần', 'Người bà hiền hậu', 'Cô giáo cũ', 'Người cha'],
    correctIndex: 1,
    hint: 'Her loving grandmother who had passed away, holding her hand to ascend into heaven.',
    hintVi: 'Người bà hiền hậu đã qua đời hiện ra rực sáng, dắt tay cô bé bay lên về với Chúa.',
  },

  // 25 - Ngữ văn 6: Bài thơ Đêm nay Bác không ngủ (Minh Huệ)
  {
    question: 'Grade 6 Literature: In Minh Huệ’s poem "Đêm nay Bác không ngủ", who woke up in the forest hut to witness Uncle Hồ quietly tending the fire and tucking in blankets?',
    questionVi: 'Ngữ văn 6: Trong bài thơ "Đêm nay Bác không ngủ" của nhà thơ Minh Huệ, nhân vật chiến sĩ thức giấc chứng kiến Bác Hồ đốt lửa sưởi ấm cho bộ đội là ai?',
    options: ['Anh đội viên', 'Chú liên lạc', 'Chính trị viên', 'Bác thợ rừng'],
    optionsVi: ['Anh đội viên', 'Chú liên lạc', 'Chính trị viên', 'Bác thợ rừng'],
    correctIndex: 0,
    hint: 'The young soldier through whose loving and respectful eyes Uncle Hồ is depicted.',
    hintVi: 'Hình tượng Bác Hồ hiện lên qua góc nhìn ấm áp, kính yêu của anh đội viên.',
  },

  // 26 - Ngữ văn 6: Bài thơ Lượm (Tố Hữu)
  {
    question: 'Grade 6 Literature: In Tố Hữu’s poem "Lượm", what was the brave boy courier delivering across bullet-strewn battlefields when he sacrificed his life?',
    questionVi: 'Ngữ văn 6: Trong bài thơ "Lượm" của nhà thơ Tố Hữu, chú bé liên lạc dũng cảm Lượm hy sinh anh dũng khi đang làm nhiệm vụ gì?',
    options: [
      'Chuyển bức thư "Thượng khẩn" qua làn đạn.',
      'Dẫn đường cho bộ đội đánh đồn giặc.',
      'Tiếp tế lương thực và đạn dược cho tiền tuyến.',
      'Dò mìn phá bẫy trên cánh đồng lúa.',
    ],
    optionsVi: [
      'Chuyển bức thư "Thượng khẩn" qua làn đạn.',
      'Dẫn đường cho bộ đội đánh đồn giặc.',
      'Tiếp tế lương thực và đạn dược cho tiền tuyến.',
      'Dò mìn phá bẫy trên cánh đồng lúa.',
    ],
    correctIndex: 0,
    hint: '"Thư đề Thượng khẩn / Sợ chi hiểm nghèo...".',
    hintVi: 'Câu thơ: "Thư đề: Thượng khẩn / Vụt qua mặt trận / Đạn bay vèo vèo...".',
  },

  // 27 - Ngữ văn 6: Biện pháp tu từ Ẩn dụ
  {
    question: 'Grade 6 Literature: In the verses: "Người Cha mái tóc bạc / Đốt lửa cho anh nằm", which rhetorical device is used with "Người Cha" referring to Uncle Hồ?',
    questionVi: 'Ngữ văn 6: Trong câu thơ: "Người Cha mái tóc bạc / Đốt lửa cho anh nằm" (Minh Huệ), hình ảnh "Người Cha" được tác giả sử dụng biện pháp tu từ gì?',
    options: ['Hoán dụ', 'So sánh', 'Ẩn dụ', 'Điệp từ'],
    optionsVi: ['Hoán dụ', 'So sánh', 'Ẩn dụ', 'Điệp từ'],
    correctIndex: 2,
    hint: 'A metaphor (ẩn dụ phẩm chất) linking Uncle Hồ’s boundless paternal affection with a father.',
    hintVi: 'Biện pháp tu từ ẩn dụ (dựa trên nét tương đồng về tình yêu thương, sự che chở giữa Bác Hồ và người cha).',
  },

  // 28 - Ngữ văn 6: Biện pháp tu từ Hoán dụ
  {
    question: 'Grade 6 Literature: In the verse: "Áo chàm đưa buổi phân ly / Cầm tay nhau biết nói gì hôm nay", what figure of speech is "Áo chàm" (indigo jacket)?',
    questionVi: 'Ngữ văn 6: Trong câu thơ: "Áo chàm đưa buổi phân ly / Cầm tay nhau biết nói gì hôm nay" (Tố Hữu), hình ảnh "Áo chàm" sử dụng biện pháp tu từ gì?',
    options: ['Ẩn dụ', 'Hoán dụ', 'Nhân hóa', 'So sánh'],
    optionsVi: ['Ẩn dụ', 'Hoán dụ', 'Nhân hóa', 'So sánh'],
    correctIndex: 1,
    hint: 'Metonymy (hoán dụ): using a distinctive garment (indigo clothing) to represent the ethnic people of the Việt Bắc highlands.',
    hintVi: 'Hoán dụ (lấy trang phục áo chàm truyền thống để chỉ đồng bào các dân tộc vùng căn cứ kháng chiến Việt Bắc).',
  },

  // 29 - Ngữ văn 6: Từ láy trong Tiếng Việt
  {
    question: 'Grade 6 Literature: Which of the following words is a reduplicative word (từ láy) in Vietnamese?',
    questionVi: 'Ngữ văn 6: Từ nào dưới đây là một từ láy trong Tiếng Việt?',
    options: ['Xe cộ', 'Nhà cửa', 'Rì rào', 'Bàn ghế'],
    optionsVi: ['Xe cộ', 'Nhà cửa', 'Rì rào', 'Bàn ghế'],
    correctIndex: 2,
    hint: 'Phonetic repetition mimicking the gentle rustle of leaves or rushing water.',
    hintVi: '"Rì rào" là từ láy mô phỏng âm thanh gió thổi, sóng vỗ. Các từ còn lại là từ ghép đẳng lập.',
  },

  // 30 - Ngữ văn 6: Từ ghép đẳng lập
  {
    question: 'Grade 6 Literature: Which of the following words is a coordinate compound word (từ ghép đẳng lập)?',
    questionVi: 'Ngữ văn 6: Từ nào dưới đây là từ ghép đẳng lập (hai tiếng bình đẳng về mặt ngữ pháp)?',
    options: ['Quần áo', 'Bút bi', 'Xe máy', 'Cây chuối'],
    optionsVi: ['Quần áo', 'Bút bi', 'Xe máy', 'Cây chuối'],
    correctIndex: 0,
    hint: 'Both components (quần and áo) carry independent, equal grammatical status.',
    hintVi: '"Quần áo" gồm hai tiếng có vai trò bình đẳng, không tiếng nào phụ thuộc tiếng nào (khác với bút bi, xe máy là từ ghép chính phụ).',
  },

  // 31 - Ngữ văn 6: Từ nhiều nghĩa (Từ đa nghĩa)
  {
    question: 'Grade 6 Literature: The use of the word "chân" in "chân núi" (foot of mountain) and "chân bàn" (leg of table) compared to "chân người" (human leg) is an example of:',
    questionVi: 'Ngữ văn 6: Hiện tượng từ "chân" trong các từ "chân núi", "chân bàn" so với "chân người" thuộc hiện tượng ngôn ngữ nào?',
    options: ['Từ đồng âm', 'Từ trái nghĩa', 'Từ nhiều nghĩa (từ đa nghĩa)', 'Từ đồng nghĩa'],
    optionsVi: ['Từ đồng âm', 'Từ trái nghĩa', 'Từ nhiều nghĩa (từ đa nghĩa)', 'Từ đồng nghĩa'],
    correctIndex: 2,
    hint: 'Polysemy: derived meanings connected by visual or functional resemblance to the bottom supporting base.',
    hintVi: 'Từ nhiều nghĩa (nghĩa chuyển dựa trên nét tương đồng về vị trí nâng đỡ dưới đáy so với nghĩa gốc là chân người).',
  },

  // 32 - Ngữ văn 6: Truyện ngắn Gió lạnh đầu mùa (Thạch Lam)
  {
    question: 'Grade 6 Literature: In Thạch Lam’s "Gió lạnh đầu mùa", to whom did the siblings Sơn and Lan give their warm old cotton jacket?',
    questionVi: 'Ngữ văn 6: Trong truyện ngắn "Gió lạnh đầu mùa" của nhà văn Thạch Lam, hai chị em Sơn và Lan đã lén mang chiếc áo bông cũ đem cho ai?',
    options: ['Bé Hiên', 'Bác thợ rèn', 'Bác phu xe', 'Bà bán vé số'],
    optionsVi: ['Bé Hiên', 'Bác thợ rèn', 'Bác phu xe', 'Bà bán vé số'],
    correctIndex: 0,
    hint: 'The poor neighboring girl shivering in the cold wearing only a tattered flimsy shirt.',
    hintVi: 'Bé Hiên - cô bé nhà nghèo hàng xóm co ro trong manh áo rách tả tơi giữa mùa đông giá rét.',
  },

  // 33 - Ngữ văn 6: Truyền thuyết Sự tích Hồ Gươm
  {
    question: 'Grade 6 Literature: In "Sự tích Hồ Gươm", the Golden Turtle (Rùa Vàng) surfaced on Tả Vọng Lake to reclaim the sacred Thuận Thiên sword from whom?',
    questionVi: 'Ngữ văn 6: Trong truyền thuyết "Sự tích Hồ Gươm", Rùa Vàng nổi lên trên hồ Tả Vọng để đòi lại thanh gươm thần Thuận Thiên từ tay ai?',
    options: ['Vua Lê Lợi (Lê Thái Tổ)', 'Trần Hưng Đạo', 'Quang Trung', 'Lý Thường Kiệt'],
    optionsVi: ['Vua Lê Lợi (Lê Thái Tổ)', 'Trần Hưng Đạo', 'Quang Trung', 'Lý Thường Kiệt'],
    correctIndex: 0,
    hint: 'The founding king of the Later Lê dynasty who led the Lam Sơn uprising.',
    hintVi: 'Vua Lê Lợi (Lê Thái Tổ) sau khi đánh đuổi giặc Minh đã hoàn trả gươm báu cho Long Quân qua Rùa Vàng.',
  },

  // 34 - Ngữ văn 6: Trạng ngữ trong câu
  {
    question: 'Grade 6 Literature: In the sentence: "Trên cành cây cao, bầy chim ríu rít hót ca", what syntactic role does "Trên cành cây cao" serve?',
    questionVi: 'Ngữ văn 6: Trong câu: "Trên cành cây cao, bầy chim ríu rít hót ca", cụm từ "Trên cành cây cao" đóng vai trò ngữ pháp gì?',
    options: ['Trạng ngữ chỉ nơi chốn', 'Chủ ngữ của câu', 'Trạng ngữ chỉ thời gian', 'Vị ngữ của câu'],
    optionsVi: ['Trạng ngữ chỉ nơi chốn', 'Chủ ngữ của câu', 'Trạng ngữ chỉ thời gian', 'Vị ngữ của câu'],
    correctIndex: 0,
    hint: 'Specifies the spatial location where the bird singing occurs.',
    hintVi: 'Trạng ngữ chỉ nơi chốn (trả lời cho câu hỏi: Bầy chim ríu rít hót ca ở đâu?).',
  },

  // 35 - Ngữ văn 6: Dấu ngoặc kép
  {
    question: 'Grade 6 Literature: What is the primary function of quotation marks (dấu ngoặc kép) in writing?',
    questionVi: 'Ngữ văn 6: Dấu ngoặc kép trong văn bản thường được dùng với công dụng chính nào sau đây?',
    options: [
      'Đánh dấu ranh giới các vế câu ghép.',
      'Đánh dấu lời dẫn trực tiếp hoặc từ ngữ mang nghĩa đặc biệt.',
      'Để biểu thị cảm xúc ngạc nhiên, thán phục.',
      'Để nối các từ ngữ có quan hệ đẳng lập.',
    ],
    optionsVi: [
      'Đánh dấu ranh giới các vế câu ghép.',
      'Đánh dấu lời dẫn trực tiếp hoặc từ ngữ mang nghĩa đặc biệt.',
      'Để biểu thị cảm xúc ngạc nhiên, thán phục.',
      'Để nối các từ ngữ có quan hệ đẳng lập.',
    ],
    correctIndex: 1,
    hint: 'Encloses direct quotations, spoken words, or words used with special figurative intent.',
    hintVi: 'Dấu ngoặc kép dùng để dẫn lời nói trực tiếp của nhân vật hoặc đánh dấu từ ngữ hiểu theo nghĩa đặc biệt/mỉa mai.',
  },

  // 36 - Ngữ văn 6: Bài thơ Mây và sóng (R. Tagore)
  {
    question: 'Grade 6 Literature: Rabindranath Tagore, author of the poem "Mây và sóng" celebrating maternal devotion, is a famous poet from which country?',
    questionVi: 'Ngữ văn 6: Đại thi hào R. Tagore - tác giả bài thơ "Mây và sóng" ca ngợi tình mẫu tử thiêng liêng - là nhà thơ của quốc gia nào?',
    options: ['Ấn Độ', 'Nga', 'Trung Quốc', 'Nhật Bản'],
    optionsVi: ['Ấn Độ', 'Nga', 'Trung Quốc', 'Nhật Bản'],
    correctIndex: 0,
    hint: 'The first Asian Nobel laureate in Literature from India.',
    hintVi: 'Rabindranath Tagore là nhà thơ, triết gia vĩ đại của đất nước Ấn Độ (châu Á đầu tiên đoạt giải Nobel Văn học).',
  },

  // 37 - Ngữ văn 6: Truyện cổ tích Thạch Sanh - Tiếng đàn thần
  {
    question: 'Grade 6 Literature: In "Thạch Sanh", whose treacherous betrayal was exposed and whose army was subdued by the melody of the enchanted zither (đàn thần)?',
    questionVi: 'Ngữ văn 6: Trong truyện cổ tích "Thạch Sanh", tiếng đàn thần dưới ngục sâu vang lên đã vạch trần tội ác phản trắc của ai?',
    options: ['Lý Thông', 'Chằn Tinh', 'Đại Bàng', 'Thái y'],
    optionsVi: ['Lý Thông', 'Chằn Tinh', 'Đại Bàng', 'Thái y'],
    correctIndex: 0,
    hint: 'The deceitful sworn brother who repeatedly stole Thạch Sanh’s achievements.',
    hintVi: 'Tiếng đàn thần giải oan cho Thạch Sanh, vạch mặt tên Lý Thông gian trá, xảo quyệt và khiến quân 18 nước bãi binh.',
  },

  // 38 - Ngữ văn 6: Cụm danh từ
  {
    question: 'Grade 6 Literature: In the noun phrase: "Tất cả những bông hoa hồng nhung rực rỡ ấy", which word is the core central noun (danh từ trung tâm)?',
    questionVi: 'Ngữ văn 6: Trong cụm danh từ: "Tất cả những bông hoa hồng nhung rực rỡ ấy", từ nào là danh từ trung tâm?',
    options: ['hoa (bông hoa)', 'tất cả', 'rực rỡ', 'ấy'],
    optionsVi: ['hoa (bông hoa)', 'tất cả', 'rực rỡ', 'ấy'],
    correctIndex: 0,
    hint: 'The central entity being described by surrounding quantifiers and modifiers.',
    hintVi: '"Hoa" (hoặc "bông hoa") là danh từ trung tâm; "tất cả những" là phần phụ trước, "hồng nhung rực rỡ ấy" là phần phụ sau.',
  },

  // 39 - Ngữ văn 6: Thành ngữ về tình nghĩa bạn bè
  {
    question: 'Grade 6 Literature: Which idiom describes standing shoulder-to-shoulder sharing both hardships and joy through adversity?',
    questionVi: 'Ngữ văn 6: Thành ngữ nào dưới đây thể hiện sự đồng lòng, cùng chia sẻ ngọt bùi cay đắng trong cuộc sống?',
    options: [
      'Đồng cam cộng khổ',
      'Đục nước béo cò',
      'Khẩu phật tâm xà',
      'Dậu đổ bìm leo',
    ],
    optionsVi: [
      'Đồng cam cộng khổ',
      'Đục nước béo cò',
      'Khẩu phật tâm xà',
      'Dậu đổ bìm leo',
    ],
    correctIndex: 0,
    hint: '"Cam" means sweetness and "khổ" means bitterness; sharing both together.',
    hintVi: '"Đồng cam cộng khổ" ("cam": ngọt, "khổ": đắng) nghĩa là cùng nhau chia sẻ mọi niềm vui và gian nan vất vả.',
  },
];

// Helper to get random question
export function getRandomHidingQuestion(): HidingSpotQuestion {
  const idx = Math.floor(Math.random() * HIDING_QUESTIONS.length);
  return { ...HIDING_QUESTIONS[idx] };
}

// Assign a question to every spot based on type and unique index
export function getQuestionForSpot(type: HidingSpotType, spotIndex: number): HidingSpotQuestion {
  // Alternate between Math 6 and Vietnamese Literature 6 questions across spots
  const questionsCount = HIDING_QUESTIONS.length;
  const pickedIndex = (spotIndex * 7 + (type === 'crate' ? 12 : type === 'locker' ? 13 : type === 'wardrobe' ? 7 : type === 'recycle_bin' ? 4 : type === 'bush' ? 16 : 0)) % questionsCount;
  return { ...HIDING_QUESTIONS[pickedIndex] };
}

// Ensure every single hiding spot in a map has a valid question
export function ensureMapQuestions(map: GameMap): void {
  if (!map.hidingSpots) return;
  map.hidingSpots.forEach((spot, idx) => {
    if (!spot.question) {
      spot.question = getQuestionForSpot(spot.type, idx);
    }
  });
}
