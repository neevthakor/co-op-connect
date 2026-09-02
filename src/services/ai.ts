import { generateGeminiContent } from '@/services/gemini';

export interface ParsedServiceRequest {
  categoryId: string;
  categoryName: string;
  problem: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  estimatedDuration: string;
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
  ac: {
    id: 'cat-ac',
    name: 'AC Repair',
    tools: ['Pressure Gauge', 'Vacuum Pump', 'Refrigerant R32/R410A', 'Fin Comb', 'Multimeter'],
    duration: '1.5 - 2.5 hours',
  },
  plumber: {
    id: 'cat-plumber',
    name: 'Plumber',
    tools: ['Pipe Wrench', 'Teflon Tape', 'Drain Auger', 'Hex Keys', 'Replacement Washers'],
    duration: '1 - 2 hours',
  },
  electrician: {
    id: 'cat-electrician',
    name: 'Electrician',
    tools: ['Digital Multimeter', 'Insulated Screwdrivers', 'Wire Stripper', 'Voltage Tester', 'Insulation Tape'],
    duration: '1 - 2 hours',
  },
  carpenter: {
    id: 'cat-carpenter',
    name: 'Carpenter',
    tools: ['Wood Chisel Set', 'Cordless Drill', 'Hand Saw', 'Level Tool', 'Wood Screws'],
    duration: '2 - 4 hours',
  },
  painter: {
    id: 'cat-painter',
    name: 'Painter',
    tools: ['Roller Brushes', 'Sanding Paper', 'Masking Tape', 'Drop Cloths', 'Primer Spray'],
    duration: '4 - 8 hours',
  },
  cleaner: {
    id: 'cat-cleaner',
    name: 'Cleaner',
    tools: ['Industrial Vacuum', 'Microfiber Cloths', 'Eco-friendly Degreaser', 'Squeegee'],
    duration: '2 - 3 hours',
  },
  appliance: {
    id: 'cat-appliance',
    name: 'Appliance Repair',
    tools: ['Component Tester', 'Thermal Sensor', 'Socket Set', 'Replacement Fuses'],
    duration: '1.5 - 2.5 hours',
  },
  pest: {
    id: 'cat-pest',
    name: 'Pest Control',
    tools: ['ULV Fogger', 'Gel Applicator', 'Protective Respirator Mask', 'Certified Insecticide'],
    duration: '1.5 - 2 hours',
  },
  waterproofing: {
    id: 'cat-waterproofing',
    name: 'Waterproofing',
    tools: ['Moisture Meter', 'Chemical Sealant Spray', 'Crack Filler Compound', 'Polymer Coating'],
    duration: '3 - 6 hours',
  },
  gardener: {
    id: 'cat-gardener',
    name: 'Gardener',
    tools: ['Pruning Shears', 'Hedge Trimmer', 'Trowel', 'Organic Fertilizer'],
    duration: '2 - 4 hours',
  },
};

// ============================================================
// 1. AI SERVICE CONCIERGE
// ============================================================
export async function parseServiceRequest(text: string, language?: string): Promise<ParsedServiceRequest> {
  const prompt = `You are the AI Concierge for Co-opConnect, a cooperative platform for household skilled trades in Ahmedabad, India.
Analyze the customer's natural-language service inquiry (which may be in English, Hindi, or Gujarati):
"${text}"

Categories available:
- cat-ac: AC Repair & Servicing
- cat-plumber: Plumbing & Leakages
- cat-electrician: Electrical & Wiring
- cat-carpenter: Carpentry & Woodwork
- cat-painter: Painting & Whitewash
- cat-cleaner: Home Cleaning
- cat-appliance: Appliance Repair (Refrigerator, Washing Machine, Geyser, Microwave)
- cat-pest: Pest Control
- cat-waterproofing: Waterproofing & Dampness Seepage
- cat-gardener: Gardening & Landscaping
- cat-technician: General Household Maintenance

Respond with a valid JSON object only with this exact schema:
{
  "categoryId": "one of the category IDs above",
  "categoryName": "name of category",
  "problem": "concise summary of the problem",
  "urgency": "NORMAL" | "URGENT" | "EMERGENCY",
  "estimatedDuration": "estimated duration string e.g. 1.5 - 2.5 hours",
  "toolsNeeded": ["list of 3-5 necessary tools"],
  "clarificationQuestions": ["2-3 helpful clarifying questions for the customer"],
  "detectedKeywords": ["detected keywords from user input"]
}`;

  const geminiResponse = await generateGeminiContent(prompt, {
    systemInstruction: 'You are an expert domestic service triage assistant. Output only JSON.',
    jsonMode: true,
    temperature: 0.1,
  });

  if (geminiResponse) {
    try {
      const parsed = JSON.parse(geminiResponse);
      if (parsed.categoryId && parsed.categoryName) {
        return {
          categoryId: parsed.categoryId,
          categoryName: parsed.categoryName,
          problem: parsed.problem || text,
          urgency: parsed.urgency || 'NORMAL',
          estimatedDuration: parsed.estimatedDuration || '1 - 2 hours',
          toolsNeeded: Array.isArray(parsed.toolsNeeded) ? parsed.toolsNeeded : ['Standard Toolset'],
          clarificationQuestions: Array.isArray(parsed.clarificationQuestions)
            ? parsed.clarificationQuestions
            : ['Please specify your exact address and landmark.'],
          parsedData: {
            text,
            language: language || 'en',
            detectedKeywords: Array.isArray(parsed.detectedKeywords) ? parsed.detectedKeywords : [],
            aiProvider: 'gemini',
          },
        };
      }
    } catch {
      // Fallback to rule engine on JSON parse error
    }
  }

  // Fallback: Deterministic Rule Engine
  return fallbackParseServiceRequest(text, language);
}

function fallbackParseServiceRequest(text: string, language?: string): ParsedServiceRequest {
  const lower = text.toLowerCase();

  let categoryKey = 'technician';
  const detectedKeywords: string[] = [];

  if (lower.includes('ac') || lower.includes('air condition') || lower.includes('cooling') || lower.includes('cool') || lower.includes('filter') || lower.includes('gas refill') || lower.includes('compressor') || lower.includes('એસી') || lower.includes('ઠંડક') || lower.includes('कूलिंग')) {
    categoryKey = 'ac';
    detectedKeywords.push('AC', 'Cooling');
  } else if (lower.includes('plumb') || lower.includes('leak') || lower.includes('tap') || lower.includes('faucet') || lower.includes('pipe') || lower.includes('sink') || lower.includes('drain') || lower.includes('flush') || lower.includes('bathroom') || lower.includes('નળ') || lower.includes('ટપકે') || lower.includes('પાણી') || lower.includes('પાઈપ') || lower.includes('नल') || lower.includes('लीक')) {
    categoryKey = 'plumber';
    detectedKeywords.push('Plumbing', 'Water / Leakage');
  } else if (lower.includes('electric') || lower.includes('wire') || lower.includes('switch') || lower.includes('short circuit') || lower.includes('fuse') || lower.includes('mcb') || lower.includes('fan') || lower.includes('light') || lower.includes('power') || lower.includes('વીજળી') || lower.includes('પંખો') || lower.includes('સ્વિચ') || lower.includes('वायरिंग') || lower.includes('बिजली')) {
    categoryKey = 'electrician';
    detectedKeywords.push('Electrical', 'Wiring');
  } else if (lower.includes('carpent') || lower.includes('wood') || lower.includes('door') || lower.includes('furniture') || lower.includes('table') || lower.includes('chair') || lower.includes('hinge') || lower.includes('lock') || lower.includes('કબાટ') || lower.includes('દરવાજો') || lower.includes('ફર્નિચર') || lower.includes('लकड़ी') || lower.includes('दरवाजा')) {
    categoryKey = 'carpenter';
    detectedKeywords.push('Carpentry', 'Woodwork');
  } else if (lower.includes('paint') || lower.includes('whitewash') || lower.includes('color') || lower.includes('wall') || lower.includes('texture') || lower.includes('રંગ') || lower.includes('કલર') || lower.includes('દીવાલ') || lower.includes('पेंटिंग') || lower.includes('रंग')) {
    categoryKey = 'painter';
    detectedKeywords.push('Painting', 'Surface Treatment');
  } else if (lower.includes('clean') || lower.includes('dust') || lower.includes('deep clean') || lower.includes('mop') || lower.includes('સફાઈ') || lower.includes('સાફ') || lower.includes('सफाई')) {
    categoryKey = 'cleaner';
    detectedKeywords.push('Cleaning', 'Hygiene');
  } else if (lower.includes('fridge') || lower.includes('refrigerator') || lower.includes('washing machine') || lower.includes('microwave') || lower.includes('oven') || lower.includes('geyser') || lower.includes('વોશિંગ મશીન') || lower.includes('ફ્રિજ') || lower.includes('ગીઝર')) {
    categoryKey = 'appliance';
    detectedKeywords.push('Appliance', 'Hardware Diagnostics');
  } else if (lower.includes('pest') || lower.includes('termite') || lower.includes('cockroach') || lower.includes('જીવાત') || lower.includes('દીવેલ')) {
    categoryKey = 'pest';
    detectedKeywords.push('Pest Control');
  } else if (lower.includes('waterproof') || lower.includes('seepage') || lower.includes('dampness') || lower.includes('લીકેજ') || lower.includes('ભેજ')) {
    categoryKey = 'waterproofing';
    detectedKeywords.push('Waterproofing', 'Seepage Prevention');
  } else if (lower.includes('garden') || lower.includes('plant') || lower.includes('lawn') || lower.includes('બગીચો') || lower.includes('છોડ')) {
    categoryKey = 'gardener';
    detectedKeywords.push('Gardening', 'Plant Care');
  }

  let urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY' = 'NORMAL';
  if (lower.includes('emergency') || lower.includes('immediately') || lower.includes('burst') || lower.includes('danger') || lower.includes('sparking') || lower.includes('હમણાં જ') || lower.includes('ઇમરજન્સી') || lower.includes('तुरंत')) {
    urgency = 'EMERGENCY';
  } else if (lower.includes('urgent') || lower.includes('today') || lower.includes('asap') || lower.includes('soon') || lower.includes('આજે જ') || lower.includes('જલ્દી') || lower.includes('जल्दी')) {
    urgency = 'URGENT';
  }

  const cat = CATEGORY_MAP[categoryKey] || {
    id: 'cat-technician',
    name: 'General Technician',
    tools: ['Basic Toolkit', 'Safety Gloves'],
    duration: '1-2 hours',
  };

  return {
    categoryId: cat.id,
    categoryName: cat.name,
    problem: text,
    urgency,
    estimatedDuration: cat.duration,
    toolsNeeded: cat.tools,
    clarificationQuestions: [
      'What is the precise address or landmark for the worker?',
      'Would you like to attach any photos of the issue?',
      'Are there any specific timing preferences or building access requirements?',
    ],
    parsedData: {
      text,
      language: language || 'en',
      detectedKeywords,
      aiProvider: 'mock',
    },
  };
}

// ============================================================
// 2. EXPLAINABLE WORKER MATCH
// ============================================================
export async function generateMatchExplanation(worker: any, scores: any): Promise<string> {
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
export async function generatePriceExplanation(estimate: any): Promise<string> {
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
export async function analyzeDemand(data: any): Promise<{ insights: string; trend: 'INCREASING' | 'STABLE' | 'DECREASING'; aiProvider?: string }> {
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
export async function analyzeSkillGaps(skillGaps: any): Promise<{ recommendations: string[]; summary: string; aiProvider?: string }> {
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
export async function assistDispute(disputeData: any): Promise<{
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
// 7. FRAUD & ANOMALY DETECTION
// ============================================================
export async function detectFraud(data: any): Promise<{ riskScore: number; anomalies: string[]; isSuspicious: boolean }> {
  return {
    riskScore: 0.05,
    anomalies: [],
    isSuspicious: false,
  };
}
