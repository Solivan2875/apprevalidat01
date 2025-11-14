
export interface Station {
  id: string;
  area: string;
  title: string;
  pepMinutes: number;
  weight: number;
  script: string;
  personality?: string;
  evaluationCriteria?: string;
}

export interface ScoreEntry {
  date: string; // ISO string
  score: number;
}

export type Scores = Record<string, ScoreEntry[]>;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatbotMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
}