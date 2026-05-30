// MindLens AI Client Data Store and Mock Intelligence Engine
// Stores user data in LocalStorage and provides mock sentiment/voice/predictions.

export interface EmotionDetail {
  name: string;
  intensity: number; // 0 to 1
  color: string;
}

export interface EmotionAnalysis {
  stressScore: number; // 1 to 100
  energyScore: number; // 1 to 100
  confidenceScore: number; // 1 to 100
  focusScore: number; // 1 to 100
  motivationScore: number; // 1 to 100
  emotions: EmotionDetail[];
  themes: string[];
  insight: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  analysis: EmotionAnalysis;
}

export interface VoiceEntry {
  id: string;
  duration: string;
  createdAt: string;
  transcription: string;
  pace: number; // WPM
  energy: number; // 1 to 100
  pauses: number; // count
  confidence: number; // 0 to 100
  analysis: EmotionAnalysis;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  detectedEmotion?: string;
}

export interface WellnessScore {
  overall: number; // 1 to 100
  stress: number;
  energy: number;
  confidence: number;
  focus: number;
  motivation: number;
  trend: "up" | "down" | "stable";
  insight: string;
}

export interface WellnessPrediction {
  id: string;
  type: "Burnout Risk" | "Stress Escalation" | "Motivation Decline" | "Recovery Likelihood";
  score: number; // percentage
  confidence: number; // percentage
  status: "low" | "medium" | "high";
  explanation: string;
  details: string[];
}

export interface UserProfile {
  name: string;
  ageRange: string;
  goals: string[];
  isOnboarded: boolean;
}

// Preloaded mock data if LocalStorage is empty
const MOCK_JOURNALS_INIT: JournalEntry[] = [
  {
    id: "j-1",
    title: "Quiet morning reflections",
    content: "Woke up feeling exceptionally calm today. The sun was coming through the window, and I had a nice cup of tea. Ready to take on the day without rushing.",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // 3 days ago
    analysis: {
      stressScore: 18,
      energyScore: 75,
      confidenceScore: 82,
      focusScore: 88,
      motivationScore: 80,
      emotions: [
        { name: "Serenity", intensity: 0.9, color: "var(--calm)" },
        { name: "Gratitude", intensity: 0.85, color: "var(--warmth)" },
        { name: "Optimism", intensity: 0.7, color: "var(--energy)" }
      ],
      themes: ["Morning Routine", "Peacefulness", "Self-Care"],
      insight: "A beautiful, serene start to your day. Gentle routines are showing high correlation with positive energy and solid focus metrics today."
    }
  },
  {
    id: "j-2",
    title: "Mid-week project pressure",
    content: "Absolutely swamped with the new project launch. Meetings back to back all afternoon, and the budget numbers aren't lining up. Feels like we're running out of time, and my shoulders are incredibly tense.",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), // 1 day ago
    analysis: {
      stressScore: 78,
      energyScore: 40,
      confidenceScore: 55,
      focusScore: 60,
      motivationScore: 68,
      emotions: [
        { name: "Anxiety", intensity: 0.8, color: "var(--destructive)" },
        { name: "Overwhelm", intensity: 0.75, color: "var(--focus)" },
        { name: "Determination", intensity: 0.65, color: "var(--energy)" }
      ],
      themes: ["Work Pressure", "Deadlines", "Physical Tension"],
      insight: "Significant stress spike detected. Tense shoulders and rush feelings correlate with work. Consider a 5-minute deep breathing break."
    }
  }
];

const MOCK_VOICE_INIT: VoiceEntry[] = [
  {
    id: "v-1",
    duration: "0:45",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    transcription: "I have been trying to stay focused today, but there's a lot of noise. I think taking a short walk outside really helped me reset my breathing and slow down.",
    pace: 110,
    energy: 52,
    pauses: 4,
    confidence: 89,
    analysis: {
      stressScore: 35,
      energyScore: 62,
      confidenceScore: 70,
      focusScore: 72,
      motivationScore: 75,
      emotions: [
        { name: "Mindfulness", intensity: 0.8, color: "var(--calm)" },
        { name: "Relief", intensity: 0.75, color: "var(--warmth)" }
      ],
      themes: ["Nature Walk", "Resetting"],
      insight: "Speaking pace is calm and controlled. The moderate energy level suggests a recovering state from previous focus fatigue."
    }
  }
];

const MOCK_CHAT_INIT: ChatMessage[] = [
  {
    id: "c-1",
    role: "assistant",
    content: "Hello! I am Lens, your personal wellness companion. How is your inner state shifting today?",
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

// Conversational rule-based analyzer for Journal entries
export function analyzeJournalText(title: string, text: string): EmotionAnalysis {
  const content = (title + " " + text).toLowerCase();
  
  let stress = 30;
  let energy = 55;
  let confidence = 60;
  let focus = 60;
  let motivation = 60;
  
  const emotions: EmotionDetail[] = [];
  const themes: string[] = [];
  
  // Stress indicators
  if (content.includes("stress") || content.includes("anxious") || content.includes("panic") || content.includes("worry") || content.includes("scared")) {
    stress += 25;
    energy -= 10;
    confidence -= 10;
    emotions.push({ name: "Anxiety", intensity: 0.78, color: "rgba(239, 68, 68, 0.7)" });
  }
  if (content.includes("busy") || content.includes("overwhelmed") || content.includes("tired") || content.includes("exhausted") || content.includes("swamped")) {
    stress += 20;
    energy -= 20;
    motivation -= 5;
    emotions.push({ name: "Fatigue", intensity: 0.82, color: "var(--focus)" });
    themes.push("Fatigue");
  }
  if (content.includes("deadline") || content.includes("work") || content.includes("project") || content.includes("meeting")) {
    stress += 15;
    focus += 10;
    themes.push("Professional");
  }
  
  // Positive indicators
  if (content.includes("happy") || content.includes("calm") || content.includes("peace") || content.includes("relax") || content.includes("serene")) {
    stress -= 20;
    energy += 15;
    confidence += 10;
    emotions.push({ name: "Serenity", intensity: 0.85, color: "var(--calm)" });
  }
  if (content.includes("thankful") || content.includes("gratitude") || content.includes("appreciate") || content.includes("nice") || content.includes("sun")) {
    stress -= 15;
    confidence += 15;
    emotions.push({ name: "Gratitude", intensity: 0.88, color: "var(--warmth)" });
    themes.push("Gratitude");
  }
  if (content.includes("proud") || content.includes("achieved") || content.includes("won") || content.includes("success") || content.includes("confident")) {
    confidence += 25;
    motivation += 20;
    emotions.push({ name: "Pride", intensity: 0.84, color: "var(--energy)" });
    themes.push("Achievement");
  }
  if (content.includes("gym") || content.includes("run") || content.includes("walk") || content.includes("exercise") || content.includes("nature")) {
    energy += 20;
    stress -= 10;
    themes.push("Physical Wellness");
  }

  // Normalize scores between 10 and 95
  stress = Math.max(10, Math.min(95, stress));
  energy = Math.max(10, Math.min(95, energy));
  confidence = Math.max(10, Math.min(95, confidence));
  focus = Math.max(10, Math.min(95, focus));
  motivation = Math.max(10, Math.min(95, motivation));
  
  if (emotions.length === 0) {
    emotions.push({ name: "Equilibrium", intensity: 0.70, color: "var(--calm)" });
  }
  
  if (themes.length === 0) {
    themes.push("Reflection");
  }

  // Generate a premium empathetic wellness insight
  let insight = "Your metrics indicate a steady, balanced baseline. Keep exploring your thoughts freely.";
  if (stress > 65) {
    insight = "Noticeable markers of overload are appearing in your expression. Tense feelings or rushing are active stressors. Try breathing in for 4s, holding for 4s, and exhaling for 6s.";
  } else if (energy < 40) {
    insight = "Your vital battery registers on the lower side. Prioritizing rest, dimming screens early, and allowing yourself to do 'nothing' for an hour will help recover your focus scores.";
  } else if (confidence > 75) {
    insight = "Excellent inner alignment! Your words show absolute clarity and high personal confidence. Leverage this motivational window to tackle demanding creative tasks.";
  } else if (emotions.some(e => e.name === "Serenity")) {
    insight = "A beautiful state of serene stillness. These moments of quiet awareness are fundamental in building long-term emotional resilience.";
  }

  return {
    stressScore: Math.round(stress),
    energyScore: Math.round(energy),
    confidenceScore: Math.round(confidence),
    focusScore: Math.round(focus),
    motivationScore: Math.round(motivation),
    emotions,
    themes,
    insight
  };
}

// Storage helpers
export function getLocalProfile(): UserProfile {
  if (typeof window === "undefined") return { name: "", ageRange: "", goals: [], isOnboarded: false };
  const stored = localStorage.getItem("mindlens_profile");
  if (stored) return JSON.parse(stored);
  return { name: "", ageRange: "", goals: [], isOnboarded: false };
}

export function saveLocalProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem("mindlens_profile", JSON.stringify(profile));
}

export function getLocalJournals(): JournalEntry[] {
  if (typeof window === "undefined") return MOCK_JOURNALS_INIT;
  const stored = localStorage.getItem("mindlens_journals");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("mindlens_journals", JSON.stringify(MOCK_JOURNALS_INIT));
  return MOCK_JOURNALS_INIT;
}

export function saveLocalJournal(entry: Omit<JournalEntry, "id" | "createdAt" | "analysis">): JournalEntry {
  const journals = getLocalJournals();
  const analysis = analyzeJournalText(entry.title, entry.content);
  const newEntry: JournalEntry = {
    ...entry,
    id: "j-" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    analysis
  };
  
  journals.unshift(newEntry);
  localStorage.setItem("mindlens_journals", JSON.stringify(journals));
  return newEntry;
}

export function getLocalVoiceEntries(): VoiceEntry[] {
  if (typeof window === "undefined") return MOCK_VOICE_INIT;
  const stored = localStorage.getItem("mindlens_voice");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("mindlens_voice", JSON.stringify(MOCK_VOICE_INIT));
  return MOCK_VOICE_INIT;
}

export function saveLocalVoice(transcription: string, pace: number, energy: number, pauses: number, duration: string): VoiceEntry {
  const voiceList = getLocalVoiceEntries();
  const analysis = analyzeJournalText("Voice Recording", transcription);
  // voice is usually lower stress if conversational
  analysis.stressScore = Math.max(12, Math.round(analysis.stressScore * 0.8));
  
  const newEntry: VoiceEntry = {
    id: "v-" + Math.random().toString(36).substr(2, 9),
    duration,
    createdAt: new Date().toISOString(),
    transcription,
    pace,
    energy,
    pauses,
    confidence: Math.round(85 + Math.random() * 12),
    analysis
  };
  
  voiceList.unshift(newEntry);
  localStorage.setItem("mindlens_voice", JSON.stringify(voiceList));
  return newEntry;
}

export function getLocalChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return MOCK_CHAT_INIT;
  const stored = localStorage.getItem("mindlens_chat");
  if (stored) return JSON.parse(stored);
  localStorage.setItem("mindlens_chat", JSON.stringify(MOCK_CHAT_INIT));
  return MOCK_CHAT_INIT;
}

export function saveLocalChatMessage(role: "user" | "assistant", content: string, detectedEmotion?: string): ChatMessage {
  const history = getLocalChatHistory();
  const newMessage: ChatMessage = {
    id: "c-" + Math.random().toString(36).substr(2, 9),
    role,
    content,
    createdAt: new Date().toISOString(),
    detectedEmotion
  };
  
  history.push(newMessage);
  localStorage.setItem("mindlens_chat", JSON.stringify(history));
  return newMessage;
}

export function clearChatHistory() {
  if (typeof window === "undefined") return;
  localStorage.setItem("mindlens_chat", JSON.stringify(MOCK_CHAT_INIT));
}

// Generate Aggregate Wellness Score
export function getWellnessScore(): WellnessScore {
  const journals = getLocalJournals();
  const voices = getLocalVoiceEntries();
  
  let totalStress = 30;
  let totalEnergy = 60;
  let totalConfidence = 65;
  let totalFocus = 70;
  let totalMotivation = 65;
  let count = 0;
  
  // Aggregate recent journal scores
  journals.slice(0, 5).forEach(j => {
    totalStress += j.analysis.stressScore;
    totalEnergy += j.analysis.energyScore;
    totalConfidence += j.analysis.confidenceScore;
    totalFocus += j.analysis.focusScore;
    totalMotivation += j.analysis.motivationScore;
    count++;
  });
  
  // Aggregate voice scores
  voices.slice(0, 3).forEach(v => {
    totalStress += v.analysis.stressScore;
    totalEnergy += v.analysis.energyScore;
    totalConfidence += v.analysis.confidenceScore;
    totalFocus += v.analysis.focusScore;
    totalMotivation += v.analysis.motivationScore;
    count++;
  });
  
  if (count > 0) {
    totalStress = Math.round(totalStress / (count + 1));
    totalEnergy = Math.round(totalEnergy / (count + 1));
    totalConfidence = Math.round(totalConfidence / (count + 1));
    totalFocus = Math.round(totalFocus / (count + 1));
    totalMotivation = Math.round(totalMotivation / (count + 1));
  }
  
  // Overall score: higher is better (low stress + good energy/confidence/focus/motivation)
  const baseWellness = (100 - totalStress + totalEnergy + totalConfidence + totalFocus + totalMotivation) / 5;
  const overall = Math.max(25, Math.min(98, Math.round(baseWellness)));
  
  let insight = "Your metrics indicate high mental clarity and stability. Perfect day for learning or creative expansion.";
  if (totalStress > 60) {
    insight = "Your stress score has risen. You are showing elevated indicators of burnout. Consider activating calm modes.";
  } else if (totalEnergy < 45) {
    insight = "Overall cognitive load is high, and physical energy indicators are low. Prioritize deep rest today.";
  } else if (overall > 80) {
    insight = "Outstanding balance of energy and serene mood today. Keep doing what you're doing, your mindset is strong!";
  }
  
  return {
    overall,
    stress: totalStress,
    energy: totalEnergy,
    confidence: totalConfidence,
    focus: totalFocus,
    motivation: totalMotivation,
    trend: totalStress > 50 ? "down" : "up",
    insight
  };
}

// Generate Wellness Predictions
export function getWellnessPredictions(): WellnessPrediction[] {
  const scores = getWellnessScore();
  
  return [
    {
      id: "p-1",
      type: "Burnout Risk",
      score: Math.round(scores.stress * 0.85 + (100 - scores.energy) * 0.15),
      confidence: 88,
      status: scores.stress > 65 ? "high" : scores.stress > 45 ? "medium" : "low",
      explanation: "Burnout risk represents your aggregate nervous system load vs cognitive energy recovery.",
      details: [
        "Elevated average weekly stress scores (currently at " + scores.stress + "/100).",
        "Mild sleep disturbances extracted from recent journal notes.",
        "Compounded work-related theme matches in the past 7 days."
      ]
    },
    {
      id: "p-2",
      type: "Stress Escalation",
      score: Math.round(scores.stress * 0.6 + (100 - scores.focus) * 0.4),
      confidence: 82,
      status: scores.stress > 55 ? "medium" : "low",
      explanation: "Predicts the probability of encountering an acute anxiety or distress threshold in the coming days.",
      details: [
        "Pace of speech in voice entries indicates mild cognitive rushing.",
        "Focus capacity shows slight friction, making tasks feel heavier.",
        "Daily reflection themes showing elevated deadline sensitivity."
      ]
    },
    {
      id: "p-3",
      type: "Motivation Decline",
      score: Math.round((100 - scores.motivation) * 0.7 + scores.stress * 0.3),
      confidence: 85,
      status: scores.motivation < 50 ? "high" : scores.motivation < 65 ? "medium" : "low",
      explanation: "Estimates the likelihood of feeling listless, distracted, or finding it difficult to start complex tasks.",
      details: [
        "Energy index is currently " + scores.energy + "/100.",
        "Strong correlation between high stress and physical fatigue indicators.",
        "Self-direction metrics are stable but require intentional recharge."
      ]
    },
    {
      id: "p-4",
      type: "Recovery Likelihood",
      score: Math.round((100 - scores.stress) * 0.5 + scores.confidence * 0.5),
      confidence: 90,
      status: scores.overall > 70 ? "high" : "medium",
      explanation: "Chances of returning to an optimal baseline of peace and high vitality within the next 48 hours.",
      details: [
        "Excellent emotional self-awareness demonstrated in journals.",
        "Strong active goals for stress reduction and self-discovery.",
        "Highly adaptive cognitive patterns recognized in conversations."
      ]
    }
  ];
}

// Generate Empathetic Chat Companion Responses
export function generateMockCompanionResponse(userMessage: string): { content: string; emotion: string } {
  const msg = userMessage.toLowerCase();
  
  let response = "I hear you, and I'm fully here with you. Can you tell me a bit more about what's sitting heaviest in your awareness right now?";
  let emotion = "Empathy";
  
  if (msg.includes("sad") || msg.includes("depressed") || msg.includes("cry") || msg.includes("lonely") || msg.includes("alone")) {
    response = "I'm so sorry things are feeling so heavy right now. Sitting with that kind of loneliness or sadness takes a lot. Please remember that you don't have to carry it all perfectly. I'm right here with you. What kind of small comfort would feel best right now?";
    emotion = "Deep Warmth";
  } else if (msg.includes("stressed") || msg.includes("busy") || msg.includes("overwhelmed") || msg.includes("anxious") || msg.includes("worry") || msg.includes("scared")) {
    response = "I can feel the tension in your words. When everything feels like it's piling up at once, the nervous system naturally goes into overdrive. Let's do a simple thing together: drop your shoulders, unclench your jaw, and take one slow, deep breath in... and let it all out. What is one small task we can let go of today?";
    emotion = "Soothing Calm";
  } else if (msg.includes("happy") || msg.includes("good") || msg.includes("excited") || msg.includes("great") || msg.includes("accomplished") || msg.includes("won")) {
    response = "What a beautiful shift in your energy! It makes me so glad to hear you feeling this sense of alignment and lightness. Let's savor this feeling for a moment. What made this breakthrough or positive moment possible today?";
    emotion = "Shared Joy";
  } else if (msg.includes("tired") || msg.includes("exhausted") || msg.includes("sleep") || msg.includes("drained")) {
    response = "It sounds like your system is calling out for a real, deep recharge. Exhaustion isn't just physical; it's emotional and cognitive too. Can you give yourself permission to step away from screens and expectations, even if just for 30 minutes, to lie down and do absolutely nothing?";
    emotion = "Nurturing Support";
  } else if (msg.includes("how am i feeling") || msg.includes("my emotion") || msg.includes("analyze me") || msg.includes("metrics")) {
    const scores = getWellnessScore();
    response = `Looking at your recent journals and reflections, your overall wellness alignment stands at **${scores.overall}/100**. Your stress is around **${scores.stress}/100**, and your energy is **${scores.energy}/100**. You seem to be carrying some work-related fatigue, but your cognitive resilience is highly active. How does this scan feel to you?`;
    emotion = "Insightful Scan";
  } else if (msg.includes("help me reflect") || msg.includes("journal prompt") || msg.includes("reflect")) {
    const prompts = [
      "What is something that felt small today, but actually took a lot of emotional energy to handle?",
      "If your current mood was a weather pattern, how would you describe it? A calm fog, a passing shower, or bright sunlight?",
      "Describe one moment today where you felt completely in your body and present. What were you doing?",
      "What is a boundary you maintained or wish you had maintained today? How did it feel?"
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    response = `I would love to help you reflect. Take a quiet moment and consider this prompt: \n\n*"${randomPrompt}"*\n\nWhenever you're ready, feel free to write your thoughts down here or in your journal.`;
    emotion = "Gentle Guide";
  }
  
  return { content: response, emotion };
}

// Emergency support detector
export function detectEmergencyDistress(text: string): boolean {
  const content = text.toLowerCase();
  const dangerKeywords = [
    "suicide", "kill myself", "end my life", "want to die", "self harm", "cutting myself", 
    "no reason to live", "better off dead", "hurt myself", "hopelessness despair"
  ];
  return dangerKeywords.some(keyword => content.includes(keyword));
}
