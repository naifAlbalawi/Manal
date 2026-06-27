const AI_KEY = "amal_ai_config";

export const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", defaultModel: "gpt-4o-mini", authType: "Bearer" },
  { id: "anthropic", name: "Anthropic", baseUrl: "https://api.anthropic.com/v1", defaultModel: "claude-3-haiku-20240307", authType: "x-api-key" },
  { id: "gemini", name: "Google Gemini", baseUrl: "https://generativelanguage.googleapis.com/v1beta", defaultModel: "gemini-1.5-flash", authType: "key" },
  { id: "custom", name: "Custom", baseUrl: "", defaultModel: "", authType: "Bearer" },
];

export function loadAIConfig() {
  try {
    const raw = localStorage.getItem(AI_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    provider: "openai",
    model: "",
    apiKey: "",
    customBaseUrl: "",
    authType: "Bearer",
    customAuthHeader: "",
    mode: "both",
    systemPrompt: "You are a helpful assistant that extracts structured data from receipts and invoices. Return JSON with items array containing name and price.",
  };
}

export function saveAIConfig(config) {
  try { localStorage.setItem(AI_KEY, JSON.stringify(config)); } catch (e) {}
}

export function isAIEnabled() {
  try {
    const s = localStorage.getItem("amal_v4");
    if (s) return JSON.parse(s).settings?.aiEnabled || false;
  } catch (e) {}
  return false;
}

export async function processWithAI(file, text, config) {
  // Stub - implement actual API call based on provider
  console.log("AI processing", { file, text, config });
  return [];
}
