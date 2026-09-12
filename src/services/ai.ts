export interface AIWorker {
  user?: { name: string; avatar?: string | null };
  id: string;
  name?: string;
  averageRating?: number;
  totalJobs?: number;
  punctualityScore?: number;
  primaryTrade?: string;
  [key: string]: unknown;
}

export interface AIScores {
  compositeScore?: number;
  match_score?: number;
  distanceKm?: number;
  [key: string]: unknown;
}

export interface AIEstimate {
  basePrice?: number;
  labour?: number;
  travel?: number;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface AIDisputeData {
  category?: string;
  description?: string;
  customerName?: string;
  workerName?: string;
  [key: string]: unknown;
}

export interface AIFraudData {
  cancellations?: number;
  recentRatings?: number;
  priceDifference?: number;
  [key: string]: unknown;
}

export interface AIDemandData {
  [key: string]: unknown;
}

export interface AISkillGapsData {
  [key: string]: unknown;
}

import { generateGeminiContent } from '@/services/gemini';
import { CLASSIFICATION_EXAMPLES } from './ai-prompts';

export interface ParsedServiceRequest {
  intent: 'SERVICE_REQUEST' | 'EMERGENCY' | 'MEDICAL_EMERGENCY' | 'OUT_OF_SCOPE' | 'GENERAL_QUERY' | 'CLARIFICATION_REQUIRED';
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
  problem: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY' | 'CRITICAL';
  estimatedDuration: string | null;
  toolsNeeded: string[];
  clarificationQuestions: string[];
  parsedData: {
    text: string;
    language?: string;
    detectedKeywords: string[];
    aiProvider?: 'gemini' | 'mock';
  };
}

const CATEGORY_MAP: Record<string, { id: string; name: string; tools: string[]; duration: string }> = {
  ac: { id: 'cat-ac', name: 'AC Repair', tools: ['Pressure Gauge', 'Vacuum Pump'], duration: '1.5 - 2.5 hours' },
  plumber: { id: 'cat-plumber', name: 'Plumber', tools: ['Pipe Wrench', 'Teflon Tape'], duration: '1 - 2 hours' },
  electrician: { id: 'cat-electrician', name: 'Electrician', tools: ['Digital Multimeter', 'Insulated Screwdrivers'], duration: '1 - 2 hours' },
  carpenter: { id: 'cat-carpenter', name: 'Carpenter', tools: ['Wood Chisel Set', 'Cordless Drill'], duration: '2 - 4 hours' },
  painter: { id: 'cat-painter', name: 'Painter', tools: ['Roller Brushes', 'Sanding Paper'], duration: '4 - 8 hours' },
  cleaner: { id: 'cat-cleaner', name: 'Cleaner', tools: ['Industrial Vacuum', 'Microfiber Cloths'], duration: '2 - 3 hours' },
  appliance: { id: 'cat-appliance', name: 'Appliance Repair', tools: ['Component Tester'], duration: '1.5 - 2.5 hours' },
  pest: { id: 'cat-pest', name: 'Pest Control', tools: ['ULV Fogger'], duration: '1.5 - 2 hours' },
  waterproofing: { id: 'cat-waterproofing', name: 'Waterproofing', tools: ['Moisture Meter'], duration: '3 - 6 hours' },
  gardener: { id: 'cat-gardener', name: 'Gardener', tools: ['Pruning Shears'], duration: '2 - 4 hours' },
};

export async function parseServiceRequest(text: string, language?: string): Promise<ParsedServiceRequest> {
  const prompt = `You are the AI Concierge intent classification system for Co-opConnect (a household skilled trades cooperative in Ahmedabad).
You are a classification system, NOT a forced category selector.

Supported categories:
- cat-ac: AC Repair
- cat-plumber: Plumbing & Leakages
- cat-electrician: Electrical
- cat-carpenter: Carpentry
- cat-painter: Painting
- cat-cleaner: Home Cleaning
- cat-appliance: Appliance Repair
- cat-pest: Pest Control
- cat-waterproofing: Waterproofing
- cat-gardener: Gardening

CRITICAL RULES:
1. Never force an input into a category. Return categoryId: null if uncertain or if it's an emergency/out of scope.
2. Emergency/Medical requests take priority over services. (e.g. "accident hua hai" -> MEDICAL_EMERGENCY, categoryId null).
3. Out-of-scope requests (lawyer, restaurant, etc.) -> OUT_OF_SCOPE, categoryId null.
4. Ambiguous ("help", "worker chahiye") -> CLARIFICATION_REQUIRED, categoryId null.
5. Consider the entire context, not just keywords.
6. Support English, Hindi, Hinglish, Gujarati.

Respond strictly with this JSON format:
{
  "intent": "SERVICE_REQUEST" | "EMERGENCY" | "MEDICAL_EMERGENCY" | "OUT_OF_SCOPE" | "GENERAL_QUERY" | "CLARIFICATION_REQUIRED",
  "categoryId": "one of the supported category IDs, or null",
  "categoryName": "name of category, or null",
  "confidence": 0.0 to 1.0,
  "problem": "concise summary",
  "urgency": "NORMAL" | "URGENT" | "EMERGENCY" | "CRITICAL",
  "estimatedDuration": "estimated duration string or null",
  "toolsNeeded": ["list of tools"],
  "clarificationQuestions": ["1-2 helpful questions if clarification is needed"],
  "detectedKeywords": ["keywords"]
}

Examples (English, Hindi, Hinglish, Gujarati):
${CLASSIFICATION_EXAMPLES}

User Input: "${text}"`;

  const geminiResponse = await generateGeminiContent(prompt, {
    systemInstruction: 'You are an expert intent classification system. Output only valid JSON.',
    jsonMode: true,
    temperature: 0.1,
  });

  if (geminiResponse) {
    try {
      const parsed = JSON.parse(geminiResponse);
      
      // Category Validation against allowed list
      let finalCategoryId = parsed.categoryId;
      let finalIntent = parsed.intent || 'CLARIFICATION_REQUIRED';
      const confidence = parsed.confidence || 0.5;

      const isValidCategory = Object.values(CATEGORY_MAP).some(c => c.id === finalCategoryId);
      if (!isValidCategory || finalIntent !== 'SERVICE_REQUEST' || confidence < 0.85) {
        finalCategoryId = null;
        if (finalIntent === 'SERVICE_REQUEST') {
            finalIntent = 'CLARIFICATION_REQUIRED';
        }
      }

      return {
        intent: finalIntent,
        categoryId: finalCategoryId,
        categoryName: isValidCategory && finalCategoryId ? Object.values(CATEGORY_MAP).find(c => c.id === finalCategoryId)?.name || null : null,
        confidence,
        problem: parsed.problem || text,
        urgency: parsed.urgency || 'NORMAL',
        estimatedDuration: parsed.estimatedDuration || null,
        toolsNeeded: Array.isArray(parsed.toolsNeeded) ? parsed.toolsNeeded : [],
        clarificationQuestions: Array.isArray(parsed.clarificationQuestions) ? parsed.clarificationQuestions : [],
        parsedData: {
          text,
          language: language || 'en',
          detectedKeywords: Array.isArray(parsed.detectedKeywords) ? parsed.detectedKeywords : [],
          aiProvider: 'gemini',
        },
      };
    } catch {
      // Fallback to rule engine on JSON parse error
    }
  }

  // Fallback: Deterministic Rule Engine
  return fallbackParseServiceRequest(text, language);
}

function fallbackParseServiceRequest(text: string, language?: string): ParsedServiceRequest {
  const lower = text.toLowerCase();

  // Emergency Detection First
  if (lower.includes('accident') || lower.includes('chot') || lower.includes('injured') || lower.includes('ambulance') || lower.includes('doctor') || lower.includes('hospital') || lower.includes('gir gayi')) {
      return createDeterministicFallback(text, language, 'MEDICAL_EMERGENCY', null, 0.99, 'CRITICAL');
  }
  if (lower.includes('aag') || lower.includes('fire') || lower.includes('police') || lower.includes('short circuit') || lower.includes('sparking')) {
      return createDeterministicFallback(text, language, 'EMERGENCY', null, 0.99, 'CRITICAL');
  }

  // Out of Scope
  if (lower.includes('lawyer') || lower.includes('visa') || lower.includes('restaurant') || lower.includes('ticket') || lower.includes('movie') || lower.includes('mechanic') || lower.includes('flight')) {
      return createDeterministicFallback(text, language, 'OUT_OF_SCOPE', null, 0.95, 'NORMAL');
  }

  // Service Mapping — covers all 10 supported categories with EN/Hindi/Hinglish/Gujarati keywords.
  // FIX: previously only 5 of 10 categories were matched here, so any Gemini outage (timeout,
  // rate limit, quota, etc.) silently misclassified cleaner/appliance/pest/waterproofing/gardener
  // requests as CLARIFICATION_REQUIRED even when the request was completely unambiguous.
  // "ac" alone is too short/ambiguous for a plain substring check (matches "package", "attack",
  // etc.), so it gets a word-boundary regex instead of a substring match.
  if (/\bac\b/.test(lower)) {
    return createDeterministicFallback(text, language, 'SERVICE_REQUEST', CATEGORY_MAP.ac, 0.90, 'NORMAL');
  }

  const categoryKeywords: Record<string, string[]> = {
    ac: ['a/c', 'air condition', 'cooling', 'thanda nahi', 'એસી', 'एसी', 'ઠંડક'],
    plumber: ['plumb', 'leak', 'tap ', 'pipe', 'drain', 'faucet', 'geyser leak', 'toilet', 'flush', 'નળ', 'नल', 'ટપકે', 'टपक'],
    electrician: ['electric', 'wiring', 'wire', 'switch', 'fan ', 'mcb', 'inverter', 'bulb', 'socket', 'વીજળી', 'बिजली', 'ફેન'],
    carpenter: ['carpent', 'wood', 'door', 'furniture', 'wardrobe', 'shelf', 'shelves', 'hinge', 'ફર્નિચર', 'लकड़ी', 'बढ़ई'],
    painter: ['paint', 'whitewash', 'texture wall', 'રંગ', 'पेंट', 'पुताई'],
    cleaner: ['clean', 'cleaning', 'sofa wash', 'deep clean', 'housekeeping', 'saaf', 'સાફ', 'सफाई', 'सफ़ाई'],
    appliance: ['washing machine', 'refrigerator', 'fridge', 'microwave', 'geyser not', 'appliance', 'फ्रिज', 'વોશિંગ'],
    pest: ['pest', 'termite', 'cockroach', 'bed bug', 'ants', 'rat problem', 'mosquito', 'keede', 'कीड़े', 'મચ્છર'],
    waterproofing: ['waterproof', 'seepage', 'seeping', 'dampness', 'damp wall', 'terrace leak', 'ceiling leak', 'छत से पानी', 'છત'],
    gardener: ['garden', 'lawn', 'hedge', 'plant', 'gardening', 'weed', 'બગીચો', 'बगीचा', 'बाग'],
  };

  let categoryKey: string | null = null;
  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      categoryKey = key;
      break;
    }
  }

  if (categoryKey) {
      return createDeterministicFallback(text, language, 'SERVICE_REQUEST', CATEGORY_MAP[categoryKey], 0.90, 'NORMAL');
  }

  // Unknown -> Clarification
  return createDeterministicFallback(text, language, 'CLARIFICATION_REQUIRED', null, 0.50, 'NORMAL');
}

function createDeterministicFallback(text: string, language: string | undefined, intent: ParsedServiceRequest['intent'], cat: { id: string; name: string; duration?: string; tools?: string[] } | null, confidence: number, urgency: ParsedServiceRequest['urgency']): ParsedServiceRequest {
  return {
    intent,
    categoryId: cat?.id || null,
    categoryName: cat?.name || null,
    confidence,
    problem: text,
    urgency,
    estimatedDuration: cat?.duration || null,
    toolsNeeded: cat?.tools || [],
    clarificationQuestions: intent === 'CLARIFICATION_REQUIRED' ? ['Could you please provide more details about the service you need?'] : [],
    parsedData: {
      text,
      language: language || 'en',
      detectedKeywords: [],
      aiProvider: 'mock',
    }
  };
}

// ============================================================
// 2. EXPLAINABLE WORKER MATCH
// ============================================================
export async function generateMatchExplanation(worker: AIWorker, scores: AIScores): Promise<string> {
  const workerName = worker?.user?.name || worker?.name || 'The technician';
  const trade = worker?.primaryTrade || 'Technician';
  const matchScore = scores?.match_score || scores?.compositeScore || 92;
  const distance = scores?.distanceKm ? `${scores.distanceKm} km away` : 'nearby';
  const rating = worker?.averageRating && worker.averageRating > 0 ? `${worker.averageRating}★` : 'verified skills';
  const punctuality = worker?.punctualityScore ? `${worker.punctualityScore}% punctuality` : 'reliable schedule';

  const prompt = `Write a friendly, transparent 2-sentence explanation to a customer explaining why ${workerName} (${trade}) was selected by the cooperative FairMatch engine.
Facts: Match Score: ${matchScore}%, Distance: ${distance}, Rating: ${rating}, Punctuality: ${punctuality}. Mention cooperative fair work principles.`;

  const geminiExplanation = await generateGeminiContent(prompt, { temperature: 0.3 });
  if (geminiExplanation) {
    return geminiExplanation.trim();
  }

  return `${workerName} was selected with a ${matchScore}% FairMatch score based on verified ${trade} skills, proximity (${distance}), high reliability (${punctuality}), and equitable cooperative job allocation.`;
}

// ============================================================
// 3. PRICE ESTIMATE EXPLANATION
// ============================================================
export async function generatePriceExplanation(estimate: AIEstimate): Promise<string> {
  const basePrice = estimate?.basePrice || estimate?.labour || 350;
  const travel = estimate?.travel || 50;

  const prompt = `Explain transparent cooperative service pricing in 2 concise sentences for an estimate of ₹${basePrice} labour and ₹${travel} travel allowance. Highlight that 100% of fair labour goes directly to the worker with standard 5% society development and 2% worker welfare contributions.`;

  const geminiExplanation = await generateGeminiContent(prompt, { temperature: 0.2 });
  if (geminiExplanation) {
    return geminiExplanation.trim();
  }

  return `Transparent cooperative pricing: ₹${basePrice} base labour is directly credited to your verified worker, with ₹${travel} travel allowance and mandatory 5% cooperative and 2% welfare contributions to secure worker health and pension funds.`;
}

// ============================================================
// 4. DEMAND FORECASTING ASSISTANCE
// ============================================================
export async function analyzeDemand(data: AIDemandData): Promise<{ insights: string; trend: 'INCREASING' | 'STABLE' | 'DECREASING'; aiProvider?: string }> {
  const area = data?.area || 'Ahmedabad';
  const category = data?.category || 'All Trades';
  const totalVolume = data?.totalVolume || 120;

  const prompt = `Analyze urban domestic service demand in ${area} for category "${category}" with a weekly volume of ${totalVolume} bookings.
Provide 2 sentences of operational intelligence for cooperative dispatch managers regarding peak hours, weather influences, and worker capacity.
Format as JSON: { "insights": "text", "trend": "INCREASING" | "STABLE" | "DECREASING" }`;

  const geminiResponse = await generateGeminiContent(prompt, { jsonMode: true, temperature: 0.2 });
  if (geminiResponse) {
    try {
      const parsed = JSON.parse(geminiResponse);
      if (parsed.insights && parsed.trend) {
        return {
          insights: parsed.insights,
          trend: parsed.trend,
          aiProvider: 'gemini',
        };
      }
    } catch {}
  }

  return {
    insights: `High demand for ${category} observed in ${area}. Seasonal surge patterns indicate increasing service booking volumes during morning and weekend windows.`,
    trend: 'INCREASING',
    aiProvider: 'mock',
  };
}

// ============================================================
// 5. SKILL-GAP ANALYSIS
// ============================================================
export async function analyzeSkillGaps(skillGaps: string[]): Promise<{ recommendations: string[]; summary: string; aiProvider?: string }> {
  const prompt = `You are a vocational training advisor for Gujarat labor cooperatives.
Review these detected skill gap categories: ${JSON.stringify(skillGaps || ['AC Inverter Diagnostics', 'Solar Inverter Wiring'])}.
Provide a 2-sentence summary and 3 concrete cooperative upskilling workshop modules.
Format as JSON: { "summary": "text", "recommendations": ["module 1", "module 2", "module 3"] }`;

  const geminiResponse = await generateGeminiContent(prompt, { jsonMode: true, temperature: 0.2 });
  if (geminiResponse) {
    try {
      const parsed = JSON.parse(geminiResponse);
      if (parsed.summary && Array.isArray(parsed.recommendations)) {
        return {
          summary: parsed.summary,
          recommendations: parsed.recommendations,
          aiProvider: 'gemini',
        };
      }
    } catch {}
  }

  return {
    summary: 'Unmet consumer demand identified in specialized technical trades. Upskilling apprentices into certified master technicians will increase cooperative earnings.',
    recommendations: [
      'Inverter & Dual-Inverter AC Advanced Diagnostics Workshop',
      'Smart Home Electrical Automation & MCB Safety Certification',
      'Hydro-Jet Drain Cleaning and Modern Plumbing Fitting Techniques',
    ],
    aiProvider: 'mock',
  };
}

// ============================================================
// 6. AI DISPUTE ASSISTANT
// ============================================================
export async function assistDispute(disputeData: AIDisputeData): Promise<{
  summary: string;
  timeline: string[];
  possibleResolutions: string[];
  aiProvider?: string;
}> {
  const complaintCategory = disputeData?.category || 'Service Quality';
  const description = disputeData?.description || 'Customer reported incomplete service or rework requirement.';
  const customerName = disputeData?.customerName || 'Customer';
  const workerName = disputeData?.workerName || 'Worker';

  const prompt = `You are a neutral cooperative dispute mediator.
Analyze this service dispute:
- Customer: ${customerName}
- Worker: ${workerName}
- Category: ${complaintCategory}
- Description: ${description}

Provide a fair, neutral summary, a 4-step factual timeline, and 3 actionable resolution options ensuring quality and fair worker treatment.
Format as JSON:
{
  "summary": "neutral 2-sentence mediation summary",
  "timeline": ["step 1", "step 2", "step 3", "step 4"],
  "possibleResolutions": ["option 1", "option 2", "option 3"]
}`;

  const geminiResponse = await generateGeminiContent(prompt, { jsonMode: true, temperature: 0.2 });
  if (geminiResponse) {
    try {
      const parsed = JSON.parse(geminiResponse);
      if (parsed.summary && Array.isArray(parsed.timeline) && Array.isArray(parsed.possibleResolutions)) {
        return {
          summary: parsed.summary,
          timeline: parsed.timeline,
          possibleResolutions: parsed.possibleResolutions,
          aiProvider: 'gemini',
        };
      }
    } catch {}
  }

  return {
    summary: `Dispute regarding ${complaintCategory.toLowerCase().replace(/_/g, ' ')} between ${customerName} and ${workerName}. Factual inspection of before/after photos and diagnostic log is recommended for impartial resolution.`,
    timeline: [
      'Booking scheduled and confirmed via platform',
      'Worker arrived on-site and verified customer 4-digit PIN',
      'Job marked completed by worker',
      `Customer filed grievance under category: ${complaintCategory}`,
    ],
    possibleResolutions: [
      'Dispatch cooperative warranty rework inspection at zero additional customer cost',
      'Issue partial compensation for unverified material or labor adjustments',
      'Schedule cooperative mediation session with society representative',
    ],
    aiProvider: 'mock',
  };
}

// ============================================================
// 7. Fraud Detection Placeholder
// ============================================================
export async function detectFraud(data: AIFraudData): Promise<{ riskScore: number; anomalies: string[]; isSuspicious: boolean }> {
  let riskScore = 0;
  const anomalies: string[] = [];

  if (data.cancellations && data.cancellations >= 3) {
    riskScore += 0.4;
    anomalies.push(`High cancellation rate (${data.cancellations} recent)`);
  }
  
  if (data.recentRatings && data.recentRatings >= 5) {
    riskScore += 0.3;
    anomalies.push(`Suspiciously high rating velocity (${data.recentRatings} in 24h)`);
  }

  if (data.priceDifference && data.priceDifference > 50) {
    riskScore += 0.3;
    anomalies.push(`Price anomaly detected: ${data.priceDifference}% difference from estimate`);
  }

  return {
    riskScore,
    anomalies,
    isSuspicious: riskScore >= 0.5,
  };
}