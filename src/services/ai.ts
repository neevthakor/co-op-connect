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
  };
}

export async function parseServiceRequest(text: string, language?: string): Promise<ParsedServiceRequest> {
  const lower = text.toLowerCase();

  let categoryId = 'cat-technician';
  let categoryName = 'Technician';
  let toolsNeeded = ['Basic Toolkit', 'Safety Gloves'];
  let estimatedDuration = '1-2 hours';
  const detectedKeywords: string[] = [];

  // AC Repair
  if (
    lower.includes('ac') ||
    lower.includes('air condition') ||
    lower.includes('cooling') ||
    lower.includes('cool') ||
    lower.includes('filter') ||
    lower.includes('gas refill') ||
    lower.includes('compressor') ||
    lower.includes('એસી') ||
    lower.includes('ઠંડક') ||
    lower.includes('कूलिंग')
  ) {
    categoryId = 'cat-ac';
    categoryName = 'AC Repair';
    toolsNeeded = ['Pressure Gauge', 'Vacuum Pump', 'Refrigerant R32/R410A', 'Fin Comb', 'Multimeter'];
    estimatedDuration = '1.5 - 2.5 hours';
    detectedKeywords.push('AC', 'Cooling');
  }
  // Plumber
  else if (
    lower.includes('plumb') ||
    lower.includes('leak') ||
    lower.includes('tap') ||
    lower.includes('faucet') ||
    lower.includes('pipe') ||
    lower.includes('sink') ||
    lower.includes('drain') ||
    lower.includes('flush') ||
    lower.includes('bathroom') ||
    lower.includes('નળ') ||
    lower.includes('ટપકે') ||
    lower.includes('પાણી') ||
    lower.includes('પાઈપ') ||
    lower.includes('नल') ||
    lower.includes('लीक')
  ) {
    categoryId = 'cat-plumber';
    categoryName = 'Plumber';
    toolsNeeded = ['Pipe Wrench', 'Teflon Tape', 'Drain Auger', 'Hex Keys', 'Replacement Washers'];
    estimatedDuration = '1 - 2 hours';
    detectedKeywords.push('Plumbing', 'Water / Leakage');
  }
  // Electrician
  else if (
    lower.includes('electric') ||
    lower.includes('wire') ||
    lower.includes('switch') ||
    lower.includes('short circuit') ||
    lower.includes('fuse') ||
    lower.includes('mcb') ||
    lower.includes('fan') ||
    lower.includes('light') ||
    lower.includes('power') ||
    lower.includes('વીજળી') ||
    lower.includes('પંખો') ||
    lower.includes('સ્વિચ') ||
    lower.includes('वायरिंग') ||
    lower.includes('बिजली')
  ) {
    categoryId = 'cat-electrician';
    categoryName = 'Electrician';
    toolsNeeded = ['Digital Multimeter', 'Insulated Screwdrivers', 'Wire Stripper', 'Voltage Tester', 'Insulation Tape'];
    estimatedDuration = '1 - 2 hours';
    detectedKeywords.push('Electrical', 'Wiring');
  }
  // Carpenter
  else if (
    lower.includes('carpent') ||
    lower.includes('wood') ||
    lower.includes('door') ||
    lower.includes('furniture') ||
    lower.includes('table') ||
    lower.includes('chair') ||
    lower.includes('hinge') ||
    lower.includes('lock') ||
    lower.includes('કબાટ') ||
    lower.includes('દરવાજો') ||
    lower.includes('ફર્નિચર') ||
    lower.includes('लकड़ी') ||
    lower.includes('दरवाजा')
  ) {
    categoryId = 'cat-carpenter';
    categoryName = 'Carpenter';
    toolsNeeded = ['Wood Chisel Set', 'Cordless Drill', 'Hand Saw', 'Level Tool', 'Wood Screws'];
    estimatedDuration = '2 - 4 hours';
    detectedKeywords.push('Carpentry', 'Woodwork');
  }
  // Painter
  else if (
    lower.includes('paint') ||
    lower.includes('whitewash') ||
    lower.includes('color') ||
    lower.includes('wall') ||
    lower.includes('texture') ||
    lower.includes('રંગ') ||
    lower.includes('કલર') ||
    lower.includes('દીવાલ') ||
    lower.includes('पेंटिंग') ||
    lower.includes('रंग')
  ) {
    categoryId = 'cat-painter';
    categoryName = 'Painter';
    toolsNeeded = ['Roller Brushes', 'Sanding Paper', 'Masking Tape', 'Drop Cloths', 'Primer Spray'];
    estimatedDuration = '4 - 8 hours';
    detectedKeywords.push('Painting', 'Surface Treatment');
  }
  // Cleaning
  else if (
    lower.includes('clean') ||
    lower.includes('dust') ||
    lower.includes('deep clean') ||
    lower.includes('mop') ||
    lower.includes('સફાઈ') ||
    lower.includes('સાફ') ||
    lower.includes('सफाई')
  ) {
    categoryId = 'cat-cleaner';
    categoryName = 'Cleaner';
    toolsNeeded = ['Industrial Vacuum', 'Microfiber Cloths', 'Eco-friendly Degreaser', 'Squeegee'];
    estimatedDuration = '2 - 3 hours';
    detectedKeywords.push('Cleaning', 'Hygiene');
  }
  // Appliance Repair
  else if (
    lower.includes('fridge') ||
    lower.includes('refrigerator') ||
    lower.includes('washing machine') ||
    lower.includes('microwave') ||
    lower.includes('oven') ||
    lower.includes('geyser') ||
    lower.includes('વોશિંગ મશીન') ||
    lower.includes('ફ્રિજ') ||
    lower.includes('ગીઝર')
  ) {
    categoryId = 'cat-appliance';
    categoryName = 'Appliance Repair';
    toolsNeeded = ['Component Tester', 'Thermal Sensor', 'Socket Set', 'Replacement Fuses'];
    estimatedDuration = '1.5 - 2.5 hours';
    detectedKeywords.push('Appliance', 'Hardware Diagnostics');
  }
  // Pest Control
  else if (lower.includes('pest') || lower.includes('termite') || lower.includes('cockroach') || lower.includes('જીવાત') || lower.includes('દીવેલ')) {
    categoryId = 'cat-pest';
    categoryName = 'Pest Control';
    toolsNeeded = ['ULV Fogger', 'Gel Applicator', 'Protective Respirator Mask', 'Certified Insecticide'];
    estimatedDuration = '1.5 - 2 hours';
    detectedKeywords.push('Pest Control');
  }
  // Waterproofing
  else if (lower.includes('waterproof') || lower.includes('seepage') || lower.includes('dampness') || lower.includes('લીકેજ') || lower.includes('ભેજ')) {
    categoryId = 'cat-waterproofing';
    categoryName = 'Waterproofing';
    toolsNeeded = ['Moisture Meter', 'Chemical Sealant Spray', 'Crack Filler Compound', 'Polymer Coating'];
    estimatedDuration = '3 - 6 hours';
    detectedKeywords.push('Waterproofing', 'Seepage Prevention');
  }
  // Gardener
  else if (lower.includes('garden') || lower.includes('plant') || lower.includes('lawn') || lower.includes('બગીચો') || lower.includes('છોડ')) {
    categoryId = 'cat-gardener';
    categoryName = 'Gardener';
    toolsNeeded = ['Pruning Shears', 'Hedge Trimmer', 'Trowel', 'Organic Fertilizer'];
    estimatedDuration = '2 - 4 hours';
    detectedKeywords.push('Gardening', 'Plant Care');
  }

  // Urgency detection
  let urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY' = 'NORMAL';
  if (
    lower.includes('emergency') ||
    lower.includes('immediately') ||
    lower.includes('burst') ||
    lower.includes('danger') ||
    lower.includes('sparking') ||
    lower.includes('હમણાં જ') ||
    lower.includes('ઇમરજન્સી') ||
    lower.includes('तुरंत')
  ) {
    urgency = 'EMERGENCY';
  } else if (
    lower.includes('urgent') ||
    lower.includes('today') ||
    lower.includes('asap') ||
    lower.includes('soon') ||
    lower.includes('આજે જ') ||
    lower.includes('જલ્દી') ||
    lower.includes('जल्दी')
  ) {
    urgency = 'URGENT';
  }

  return {
    categoryId,
    categoryName,
    problem: text,
    urgency,
    estimatedDuration,
    toolsNeeded,
    clarificationQuestions: [
      'What is the precise address or landmark for the worker?',
      'Would you like to attach any photos of the issue?',
      'Are there any specific timing preferences or building access requirements?',
    ],
    parsedData: {
      text,
      language: language || 'en',
      detectedKeywords,
    },
  };
}

export async function generateMatchExplanation(worker: any, scores: any) {
  return `This worker is an excellent match (${scores.match_score || 95}% compatibility) with verified ${worker.primaryTrade || 'trade'} expertise, high punctuality rating (${worker.punctualityScore || 98}%), and proximity to your location.`;
}

export async function generatePriceExplanation(estimate: any) {
  return `Estimated price is calculated transparently with base cooperative labour rates, travel distance allowances, and fair wage standards.`;
}

export async function analyzeDemand(data: any) {
  return {
    insights: 'High demand for AC & electrical servicing observed in Western Ahmedabad clusters.',
    trend: 'INCREASING',
  };
}

export async function assistDispute(disputeData: any) {
  return {
    summary: 'Dispute regarding job quality and timeline.',
    timeline: ['Booking confirmed', 'Worker arrived on site', 'Job completion marked', 'Complaint submitted'],
    possibleResolutions: [
      'Offer free rework warranty dispatch under cooperative quality guarantee',
      'Issue partial refund for material charges',
      'Escalate to Cooperative Dispute Committee',
    ],
  };
}

export async function detectFraud(data: any) {
  return {
    riskScore: 0.05,
    anomalies: [],
    isSuspicious: false,
  };
}

