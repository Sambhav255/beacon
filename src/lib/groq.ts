import Groq from "groq-sdk";

export const MODEL_PRIMARY = "llama-3.3-70b-versatile";
export const MODEL_FALLBACK = "llama-3.1-70b-versatile";

export function hasGroqKey() {
  return Boolean(process.env.GROQ_API_KEY);
}

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Groq({ apiKey });
}
