export interface HabitData {
  habits: Array<{
    title: string;
    category: string;
    targetFrequency: number;
    completionRate: number;
    currentStreak: number;
    totalLogs: number;
    completedLogs: number;
  }>;
  overallStats: {
    totalHabits: number;
    averageCompletionRate: number;
    totalStreakDays: number;
    activeDays: number;
  };
  period: string;
}

export interface AIInsightResult {
  insight: string;
  recommendation: string;
  motivation: string;
  score: number;
}

export async function generateHabitInsight(
  userData: HabitData,
  language: string = 'en'
): Promise<AIInsightResult> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return generateFallbackInsight(userData, language);
  }

  const prompt = buildPrompt(userData, language);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: getSystemPrompt(language),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status);
      return generateFallbackInsight(userData, language);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return generateFallbackInsight(userData, language);
    }

    const parsed = JSON.parse(content);

    return {
      insight: parsed.insight || "Keep tracking your habits consistently.",
      recommendation:
        parsed.recommendation || "Focus on one habit at a time for best results.",
      motivation:
        parsed.motivation || "Every day is a new opportunity to improve.",
      score: Math.min(100, Math.max(0, parsed.score || 50)),
    };
  } catch (error) {
    console.error("AI insight generation failed:", error);
    return generateFallbackInsight(userData, language);
  }
}

function getSystemPrompt(language: string): string {
  const prompts: Record<string, string> = {
    en: `You are an expert behavioral psychologist and habit coach. 
Analyze habit tracking data and provide structured, personalized insights.
Always respond with valid JSON in the exact format specified.
Be encouraging, specific, and actionable in your responses.
Respond in English.`,
    id: `Anda adalah psikolog perilaku dan pelatih kebiasaan ahli.
Analisis data pelacakan kebiasaan dan berikan wawasan terstruktur dan personal.
Selalu respons dengan JSON valid dalam format yang tepat.
Bersikaplah mendorong, spesifik, dan dapat ditindaklanjuti dalam respons Anda.
Respons dalam Bahasa Indonesia.`,
    zh: `您是专业的行为心理学家和习惯教练。
分析习惯跟踪数据并提供结构化的个性化洞察。
始终以指定的确切格式响应有效的JSON。
在您的回复中要鼓励、具体和可操作。
用简体中文回复。`,
  };

  return prompts[language] || prompts.en;
}

function buildPrompt(userData: HabitData, language: string = 'en'): string {
  const habitSummaries = userData.habits
    .map(
      (h) =>
        `- ${h.title} (${h.category}): ${h.completionRate.toFixed(0)}% completion rate, ${h.currentStreak} day streak, target: ${h.targetFrequency}x/week`
    )
    .join("\n");

  const prompts: Record<string, string> = {
    en: `Analyze this habit tracking data for the period: ${userData.period}

HABITS:
${habitSummaries}

OVERALL STATS:
- Total active habits: ${userData.overallStats.totalHabits}
- Average completion rate: ${userData.overallStats.averageCompletionRate.toFixed(1)}%
- Total streak days: ${userData.overallStats.totalStreakDays}
- Active tracking days: ${userData.overallStats.activeDays}

Provide a comprehensive analysis in this exact JSON format:
{
  "insight": "2-3 sentence analysis of their consistency patterns, strengths, and areas for improvement",
  "recommendation": "2-3 specific, actionable recommendations based on the data patterns",
  "motivation": "1-2 sentences of personalized motivational message based on their progress",
  "score": <number 0-100 representing overall habit health score>
}`,
    id: `Analisis data pelacakan kebiasaan untuk periode: ${userData.period}

KEBIASAAN:
${habitSummaries}

STATISTIK KESELURUHAN:
- Total kebiasaan aktif: ${userData.overallStats.totalHabits}
- Tingkat penyelesaian rata-rata: ${userData.overallStats.averageCompletionRate.toFixed(1)}%
- Total hari streak: ${userData.overallStats.totalStreakDays}
- Hari pelacakan aktif: ${userData.overallStats.activeDays}

Berikan analisis komprehensif dalam format JSON yang tepat ini:
{
  "insight": "2-3 kalimat analisis pola konsistensi, kekuatan, dan area untuk perbaikan",
  "recommendation": "2-3 rekomendasi spesifik dan dapat ditindaklanjuti berdasarkan pola data",
  "motivation": "1-2 kalimat pesan motivasi personal berdasarkan kemajuan mereka",
  "score": <angka 0-100 yang mewakili skor kesehatan kebiasaan keseluruhan>
}`,
    zh: `分析这个时期的习惯跟踪数据: ${userData.period}

习惯:
${habitSummaries}

总体统计:
- 活跃习惯总数: ${userData.overallStats.totalHabits}
- 平均完成率: ${userData.overallStats.averageCompletionRate.toFixed(1)}%
- 总连续天数: ${userData.overallStats.totalStreakDays}
- 活跃跟踪天数: ${userData.overallStats.activeDays}

以以下确切的JSON格式提供全面分析:
{
  "insight": "2-3句话分析他们的一致性模式、优势和改进领域",
  "recommendation": "基于数据模式的2-3个具体可操作建议",
  "motivation": "基于他们进度的1-2句个性化激励信息",
  "score": <代表整体习惯健康评分的0-100数字>
}`,
  };

  return prompts[language] || prompts.en;
}

function generateFallbackInsight(userData: HabitData, language: string = 'en'): AIInsightResult {
  const rate = userData.overallStats.averageCompletionRate;
  const habits = userData.overallStats.totalHabits;
  const streaks = userData.overallStats.totalStreakDays;

  let insight = "";
  let recommendation = "";
  let motivation = "";
  let score = 0;

  if (language === 'id') {
    return generateIndonesianFallback(rate, habits, streaks);
  } else if (language === 'zh') {
    return generateChineseFallback(rate, habits, streaks);
  }

  // English fallback
  if (rate >= 80) {
    insight = `Excellent performance! You're maintaining ${rate.toFixed(0)}% completion rate across ${habits} habit${habits !== 1 ? "s" : ""}. Your consistency is remarkable and your ${streaks}-day total streak demonstrates strong commitment.`;
    recommendation =
      "Consider adding a new challenging habit to expand your growth. Review your most successful habits and identify what makes them stick — apply those strategies to any weaker areas.";
    motivation =
      "You're in the top tier of habit trackers. Keep this momentum and watch how these small daily actions compound into extraordinary results!";
    score = Math.min(95, 70 + rate * 0.25);
  } else if (rate >= 60) {
    insight = `Good progress! With a ${rate.toFixed(0)}% completion rate across ${habits} habit${habits !== 1 ? "s" : ""}, you're building solid foundations. Your ${streaks} total streak days show real dedication.`;
    recommendation =
      "Focus on your top 2-3 highest-impact habits and reduce friction for completing them. Consider habit stacking — linking new habits to existing ones to boost completion rates.";
    motivation =
      "You're well on your way to mastery. Every completed habit is a vote for the person you're becoming — keep casting those votes!";
    score = Math.min(75, 50 + rate * 0.3);
  } else if (rate >= 40) {
    insight = `You're making progress with a ${rate.toFixed(0)}% completion rate. With ${habits} habit${habits !== 1 ? "s" : ""} tracked, you're building awareness of your patterns, which is the first step to improvement.`;
    recommendation =
      "Simplify your habits to make them easier to complete. Instead of big ambitious goals, focus on a 2-minute version of each habit. Consistency beats intensity — aim for 60%+ before adding complexity.";
    motivation =
      "Progress is not always linear. The fact that you're tracking shows commitment — now let's turn that awareness into action, one small step at a time.";
    score = Math.min(55, 30 + rate * 0.4);
  } else {
    insight = `You're in the early stages with a ${rate.toFixed(0)}% completion rate. This data is valuable — it reveals which habits need more support and the right environmental design.`;
    recommendation =
      "Pick just ONE habit and commit to doing it daily for 21 days. Remove all obstacles and make it impossible not to do. Set a specific time and location for each habit.";
    motivation =
      "The hardest part is starting, and you've already done that by tracking. Every expert was once a beginner — your future self will thank you for the work you do today.";
    score = Math.max(20, rate * 0.5);
  }

  return { insight, recommendation, motivation, score };
}

function generateIndonesianFallback(rate: number, habits: number, streaks: number): AIInsightResult {
  let insight = "";
  let recommendation = "";
  let motivation = "";
  let score = 0;

  if (rate >= 80) {
    insight = `Performa luar biasa! Anda mempertahankan tingkat penyelesaian ${rate.toFixed(0)}% di ${habits} kebiasaan. Konsistensi Anda luar biasa dan total streak ${streaks} hari menunjukkan komitmen yang kuat.`;
    recommendation =
      "Pertimbangkan untuk menambahkan kebiasaan baru yang menantang untuk memperluas pertumbuhan Anda. Tinjau kebiasaan paling sukses Anda dan identifikasi apa yang membuatnya bertahan — terapkan strategi tersebut ke area yang lebih lemah.";
    motivation =
      "Anda berada di tingkat teratas pelacak kebiasaan. Pertahankan momentum ini dan saksikan bagaimana tindakan kecil sehari-hari ini berkembang menjadi hasil yang luar biasa!";
    score = Math.min(95, 70 + rate * 0.25);
  } else if (rate >= 60) {
    insight = `Kemajuan yang baik! Dengan tingkat penyelesaian ${rate.toFixed(0)}% di ${habits} kebiasaan, Anda sedang membangun fondasi yang solid. Total ${streaks} hari streak menunjukkan dedikasi nyata.`;
    recommendation =
      "Fokus pada 2-3 kebiasaan berdampak tertinggi Anda dan kurangi hambatan untuk menyelesaikannya. Pertimbangkan habit stacking — menghubungkan kebiasaan baru dengan yang sudah ada untuk meningkatkan tingkat penyelesaian.";
    motivation =
      "Anda berada di jalan menuju penguasaan. Setiap kebiasaan yang diselesaikan adalah suara untuk orang yang Anda ingin menjadi — terus berikan suara itu!";
    score = Math.min(75, 50 + rate * 0.3);
  } else if (rate >= 40) {
    insight = `Anda membuat kemajuan dengan tingkat penyelesaian ${rate.toFixed(0)}%. Dengan ${habits} kebiasaan yang dilacak, Anda membangun kesadaran tentang pola Anda, yang merupakan langkah pertama untuk perbaikan.`;
    recommendation =
      "Sederhanakan kebiasaan Anda agar lebih mudah diselesaikan. Alih-alih tujuan besar yang ambisius, fokus pada versi 2 menit dari setiap kebiasaan. Konsistensi mengalahkan intensitas — targetkan 60%+ sebelum menambah kompleksitas.";
    motivation =
      "Kemajuan tidak selalu linear. Fakta bahwa Anda melacak menunjukkan komitmen — sekarang mari ubah kesadaran itu menjadi tindakan, satu langkah kecil pada satu waktu.";
    score = Math.min(55, 30 + rate * 0.4);
  } else {
    insight = `Anda berada di tahap awal dengan tingkat penyelesaian ${rate.toFixed(0)}%. Data ini berharga — ini mengungkapkan kebiasaan mana yang membutuhkan lebih banyak dukungan dan desain lingkungan yang tepat.`;
    recommendation =
      "Pilih hanya SATU kebiasaan dan berkomitmen untuk melakukannya setiap hari selama 21 hari. Hilangkan semua hambatan dan buat tidak mungkin untuk tidak melakukannya. Tetapkan waktu dan lokasi spesifik untuk setiap kebiasaan.";
    motivation =
      "Bagian tersulit adalah memulai, dan Anda sudah melakukannya dengan melacak. Setiap ahli pernah menjadi pemula — diri Anda di masa depan akan berterima kasih atas pekerjaan yang Anda lakukan hari ini.";
    score = Math.max(20, rate * 0.5);
  }

  return { insight, recommendation, motivation, score };
}

function generateChineseFallback(rate: number, habits: number, streaks: number): AIInsightResult {
  let insight = "";
  let recommendation = "";
  let motivation = "";
  let score = 0;

  if (rate >= 80) {
    insight = `表现卓越！您在${habits}个习惯中保持了${rate.toFixed(0)}%的完成率。您的一致性令人瞩目，${streaks}天的总连续记录展示了强大的承诺。`;
    recommendation =
      "考虑添加一个新的具有挑战性的习惯来扩展您的成长。回顾您最成功的习惯并确定是什么让它们坚持下来——将这些策略应用到任何较弱的领域。";
    motivation =
      "您处于习惯追踪者的顶级层次。保持这种势头，观察这些小的日常行动如何复合成非凡的结果！";
    score = Math.min(95, 70 + rate * 0.25);
  } else if (rate >= 60) {
    insight = `进展良好！在${habits}个习惯中保持${rate.toFixed(0)}%的完成率，您正在建立坚实的基础。您的${streaks}天总连续记录显示了真正的奉献精神。`;
    recommendation =
      "专注于您影响最大的2-3个习惯，减少完成它们的障碍。考虑习惯堆叠——将新习惯与现有习惯联系起来以提高完成率。";
    motivation =
      "您正在通往精通的道路上。每个完成的习惯都是对您正在成为的人的投票——继续投这些票！";
    score = Math.min(75, 50 + rate * 0.3);
  } else if (rate >= 40) {
    insight = `您正在取得进展，完成率为${rate.toFixed(0)}%。通过追踪${habits}个习惯，您正在建立对您模式的认识，这是改进的第一步。`;
    recommendation =
      "简化您的习惯使它们更容易完成。不要设定宏大的目标，专注于每个习惯的2分钟版本。一致性胜过强度——在增加复杂性之前瞄准60%+。";
    motivation =
      "进步不总是线性的。您正在跟踪的事实表明了承诺——现在让我们将这种意识转化为行动，一次一小步。";
    score = Math.min(55, 30 + rate * 0.4);
  } else {
    insight = `您处于早期阶段，完成率为${rate.toFixed(0)}%。这些数据很有价值——它揭示了哪些习惯需要更多支持和正确的环境设计。`;
    recommendation =
      "只选择一个习惯并承诺每天坚持21天。消除所有障碍，使之不可能不做。为每个习惯设定具体的时间和地点。";
    motivation =
      "最难的部分是开始，而您已经通过跟踪做到了这一点。每个专家曾经都是初学者——您未来的自己会感谢您今天所做的工作。";
    score = Math.max(20, rate * 0.5);
  }

  return { insight, recommendation, motivation, score };
}
