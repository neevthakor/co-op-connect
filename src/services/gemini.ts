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
  if (!process.env.AI_API_KEY && !process.env.GEMINI_API_KEY) {
    try {
      process.loadEnvFile?.();
    } catch {
      // Ignored if file doesn't exist or environment is already populated
    }
  }

  const rawKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();

  const rawProvider = process.env.AI_PROVIDER?.toLowerCase()?.trim();
  const isMockExplicit = rawProvider === 'mock';
  const isGeminiRequested = rawProvider === 'gemini' || (!rawProvider && Boolean(apiKey));
  const provider: 'gemini' | 'mock' = (isGeminiRequested && !isMockExplicit && Boolean(apiKey)) ? 'gemini' : 'mock';

  const rawModel = process.env.GEMINI_MODEL?.trim() || 'gemini-3.7-flash';
  const model = rawModel.replace(/^["']|["']$/g, '').replace(/^models\//, '').trim() || 'gemini-3.7-flash';

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
    thinkingLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
    maxOutputTokens?: number;
  }
): Promise<string | null> {
  const config = getGeminiConfig();

  if (!config.apiKey) {
    if (config.provider === 'gemini') {
      console.warn(
        '[Gemini API] Missing API key: Neither AI_API_KEY nor GEMINI_API_KEY is configured in the environment. Falling back to rule-based engine.'
      );
    }
    return null; // Fallback to mock
  }

  if (config.provider !== 'gemini') {
    return null; // Fallback to mock
  }

  const timeoutMs = options?.timeoutMs || 3000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const cleanModel = config.model.replace(/^models\//, '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cleanModel)}:generateContent`;

    const contents: Record<string, unknown>[] = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const isGemini3 = cleanModel.toLowerCase().includes('gemini-3') || cleanModel.toLowerCase().includes('3.');

    const generationConfig: Record<string, unknown> = {
      maxOutputTokens: options?.maxOutputTokens ?? 1024,
    };

    // Traditional sampling parameters (temperature, topP, topK) are unsupported in Gemini 3.x
    // Preserve backwards compatibility by only setting temperature for legacy models (e.g. Gemini 1.5)
    if (!isGemini3 && options?.temperature !== undefined) {
      generationConfig.temperature = options.temperature;
    }

    if (options?.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    // Configure thinking for Gemini 3.x models to maintain fast response times
    if (isGemini3) {
      generationConfig.thinkingConfig = {
        thinkingLevel: options?.thinkingLevel ?? 'LOW',
      };
    }

    const payload: Record<string, unknown> = {
      contents,
      generationConfig,
    };

    if (options?.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    let res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // Transient retry on 503 (high demand spikes) before falling back
    if (res.status === 503 && !controller.signal.aborted) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!controller.signal.aborted) {
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': config.apiKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      }
    }

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errMessage = '';
      try {
        const errJson = await res.json();
        errMessage = errJson?.error?.message || '';
      } catch {
        const rawText = await res.text().catch(() => '');
        errMessage = rawText.slice(0, 150);
      }

      const status = res.status;
      const lowerMsg = errMessage.toLowerCase();

      if (
        status === 400 &&
        (lowerMsg.includes('api key') ||
          lowerMsg.includes('invalid_argument') ||
          lowerMsg.includes('unregistered') ||
          lowerMsg.includes('api_key'))
      ) {
        console.warn(
          `[Gemini API] Authentication Failure (HTTP ${status}): Invalid or inactive API key. Falling back to rule-based engine. Detail: ${errMessage}`
        );
      } else if (status === 401 || status === 403) {
        console.warn(
          `[Gemini API] Authentication Failure (HTTP ${status}): Unauthorized or permission denied. Falling back to rule-based engine. Detail: ${errMessage}`
        );
      } else if (status === 404) {
        console.warn(
          `[Gemini API] Model Not Found (HTTP 404): Model '${config.model}' is not found or no longer available. Falling back to rule-based engine. Detail: ${errMessage}`
        );
      } else if (status === 429 || lowerMsg.includes('resource_exhausted')) {
        console.warn(
          `[Gemini API] Rate Limit (HTTP 429): Quota or rate limit exceeded. Falling back to rule-based engine. Detail: ${errMessage}`
        );
      } else if (status === 503) {
        console.warn(
          `[Gemini API] Service Unavailable (HTTP 503): High demand or temporary service downtime. Falling back to rule-based engine. Detail: ${errMessage}`
        );
      } else {
        console.warn(
          `[Gemini API] Other Gemini Failure (HTTP ${status} ${res.statusText}): ${errMessage}. Falling back to rule-based engine.`
        );
      }
      return null;
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts;

    // Filter out thought parts (Gemini 3.x thinking parts) and extract clean response text
    let candidateText: string | null = null;
    if (Array.isArray(parts)) {
      const nonThoughtParts = parts.filter((p: { inlineData?: unknown; text?: string; thought?: boolean }) => !p.thought && typeof p.text === 'string');
      if (nonThoughtParts.length > 0) {
        candidateText = nonThoughtParts.map((p: { inlineData?: unknown; text?: string; thought?: boolean }) => p.text).join('');
      } else if (typeof parts[0]?.text === 'string') {
        candidateText = parts[0].text;
      }
    }

    if (!candidateText) {
      console.warn(`[Gemini API] Empty Response: No candidate text returned by Gemini. Falling back to rule-based engine.`);
      return null;
    }

    let resultText = candidateText.trim();
    if (options?.jsonMode) {
      // Strip markdown code blocks if the model wrapped the JSON output
      if (resultText.startsWith('```json')) {
        resultText = resultText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      } else if (resultText.startsWith('```')) {
        resultText = resultText.replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      }
    }

    return resultText || null;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if ((err as Error).name === 'AbortError') {
      console.warn(`[Gemini API] Timeout: Request timed out after ${timeoutMs}ms. Falling back to rule-based engine.`);
    } else {
      console.warn(`[Gemini API] Other Gemini Failure: Connection or network error: ${(err as Error).message}. Falling back to rule-based engine.`);
    }
    return null;
  }
}
