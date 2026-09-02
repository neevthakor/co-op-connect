/**
 * Server-Side Gemini AI Service Client
 * 
 * Securely communicates with Google Gemini Generative Language API.
 * - Reads AI_API_KEY / GEMINI_API_KEY and AI_PROVIDER from server environment.
 * - Never exposes keys or secrets to client bundles.
 * - Enforces timeout, error handling, rate-limit fallback to mock provider.
 */

export interface GeminiConfig {
  apiKey: string;
  provider: 'gemini' | 'mock';
  model: string;
}

function getGeminiConfig(): GeminiConfig {
  const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
  const provider = (process.env.AI_PROVIDER?.toLowerCase() === 'gemini' && apiKey) ? 'gemini' : 'mock';
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  return { apiKey, provider, model };
}

/**
 * Log AI service operational status safely without exposing secrets
 */
export function logAiStatus(): void {
  const config = getGeminiConfig();
  if (config.provider === 'gemini') {
    const maskedKey = config.apiKey.length > 8
      ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}`
      : '***';
    console.log(`[Co-opConnect AI] Active Provider: GEMINI (${config.model}), Key: ${maskedKey}`);
  } else {
    console.log(`[Co-opConnect AI] Active Provider: MOCK / RULE-BASED ENGINE`);
  }
}

/**
 * Execute a structured prompt on Gemini with timeout and error resilience
 */
export async function generateGeminiContent(
  prompt: string,
  options?: {
    systemInstruction?: string;
    jsonMode?: boolean;
    timeoutMs?: number;
    temperature?: number;
  }
): Promise<string | null> {
  const config = getGeminiConfig();

  if (config.provider !== 'gemini' || !config.apiKey) {
    return null; // Fallback to mock
  }

  const timeoutMs = options?.timeoutMs || 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

    const contents: any[] = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const generationConfig: any = {
      temperature: options?.temperature ?? 0.2,
      maxOutputTokens: 1024,
    };

    if (options?.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    const payload: any = {
      contents,
      generationConfig,
    };

    if (options?.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Gemini API] HTTP ${res.status}: ${res.statusText}. Falling back to rule-based engine. ${errText.slice(0, 100)}`);
      return null;
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[Gemini API] Request timed out after ${timeoutMs}ms. Falling back to rule-based engine.`);
    } else {
      console.warn(`[Gemini API] Error: ${err.message}. Falling back to rule-based engine.`);
    }
    return null;
  }
}
