export type ApplicationQuestionId = "q1" | "q2" | "q3" | "q4" | "q5";

export interface ApplicationQuestion {
  id: ApplicationQuestionId;
  prompt: string;
  helper?: string;
}

export const APPLICATION_QUESTIONS: ApplicationQuestion[] = [
  {
    id: "q1",
    prompt: "If you were dropped on a beach right now, what would your Survivor entrance quote be?",
    helper: "Paint a vivid picture—we want to hear your voice.",
  },
  {
    id: "q2",
    prompt:
      "What kind of chaos would you bring to camp — are you the firemaker, the schemer, the snack thief, or the one starting dance parties?",
    helper: "Tell us about the flavor you bring to a tribe.",
  },
  {
    id: "q3",
    prompt: "You just found a mysterious advantage. What’s your first move: hide it, brag about it, or fake another one for fun?",
    helper: "Walk us through your thought process.",
  },
  {
    id: "q4",
    prompt: "What’s your dream Survivor alliance name, and who (real or fictional) would be in it?",
    helper: "Name your perfect squad and why they’re unstoppable.",
  },
  {
    id: "q5",
    prompt: "Describe your Survivor gameplay style using only three emojis — and tell us why you chose them.",
    helper: "Give us the emojis and the story behind them.",
  },
];
