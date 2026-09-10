import {
  parseServiceRequest,
  generateMatchExplanation,
  generatePriceExplanation,
  analyzeDemand,
  analyzeSkillGaps,
  assistDispute,
} from '../src/services/ai';
import { logAiStatus } from '../src/services/gemini';

async function testAIServices() {
  console.log('===============================================================');
  console.log('       TESTING CO-OPCONNECT AI SERVICES & GEMINI PROVIDER       ');
  console.log('===============================================================\n');

  logAiStatus();
  console.log('---------------------------------------------------------------\n');

  // 1. AI Service Concierge Test
  console.log('--- 1. AI Service Concierge (Multi-Language Intent Classification) ---');
  const sampleQuery = 'AC mathi pani tapke che and room ma sub-zero cooling nathi thatu (AC leaking water and not cooling)';
  const conciergeResult = await parseServiceRequest(sampleQuery, 'gu');
  console.log(`   - Detected Category: ${conciergeResult.categoryName} (${conciergeResult.categoryId})`);
  console.log(`   - Urgency: ${conciergeResult.urgency}`);
  console.log(`   - Estimated Duration: ${conciergeResult.estimatedDuration}`);
  console.log(`   - Tools Needed: ${conciergeResult.toolsNeeded.join(', ')}`);
  console.log(`   - Clarification Questions: ${conciergeResult.clarificationQuestions[0]}`);
  console.log(`   - Provider Used: ${conciergeResult.parsedData.aiProvider || 'mock'}\n`);

  // 2. Explainable Worker Match Test
  console.log('--- 2. Explainable Worker Match (FairMatch Natural Language Insight) ---');
  const workerSample = {
    id: 'w1', user: { name: 'Karan Desai' },
    primaryTrade: 'AC Technician',
    averageRating: 4.9,
    punctualityScore: 98,
  };
  const scoresSample = { match_score: 96, distanceKm: 2.1 };
  const matchExplanation = await generateMatchExplanation(workerSample, scoresSample);
  console.log(`   - Match Explanation:\n     "${matchExplanation}"\n`);

  // 3. Price Estimate Explanation Test
  console.log('--- 3. Price Estimate Breakdown Explanation ---');
  const priceEstimateSample = { basePrice: 450, travel: 65 };
  const priceExplanation = await generatePriceExplanation(priceEstimateSample);
  console.log(`   - Price Explanation:\n     "${priceExplanation}"\n`);

  // 4. Demand Forecasting Assistance Test
  console.log('--- 4. Demand Forecasting Assistance ---');
  const demandSample = { area: 'Vastrapur / Satellite, Ahmedabad', category: 'AC Repair', totalVolume: 145 };
  const demandAnalysis = await analyzeDemand(demandSample);
  console.log(`   - Trend: ${demandAnalysis.trend}`);
  console.log(`   - Insights: "${demandAnalysis.insights}"`);
  console.log(`   - Provider Used: ${demandAnalysis.aiProvider || 'mock'}\n`);

  // 5. Skill-Gap Analysis Test
  console.log('--- 5. Skill-Gap Analysis & Vocational Workshop Recommendations ---');
  const skillGapsSample = ['Inverter AC PCB Diagnostics', 'Commercial VRF Chiller Maintenance'];
  const skillGapAnalysis = await analyzeSkillGaps(skillGapsSample);
  console.log(`   - Summary: "${skillGapAnalysis.summary}"`);
  console.log(`   - Recommended Modules:`);
  skillGapAnalysis.recommendations.forEach((r, idx) => console.log(`     ${idx + 1}. ${r}`));
  console.log(`   - Provider Used: ${skillGapAnalysis.aiProvider || 'mock'}\n`);

  // 6. AI Dispute Assistant Test
  console.log('--- 6. AI Dispute Assistant & Mediation Summary ---');
  const disputeSample = {
    customerName: 'Amit Patel',
    workerName: 'Raj Patel',
    category: 'POOR_QUALITY',
    description: 'AC cooling stopped 3 days after gas refilling service.',
  };
  const disputeAnalysis = await assistDispute(disputeSample);
  console.log(`   - Mediation Summary: "${disputeAnalysis.summary}"`);
  console.log(`   - Factual Timeline Steps:`);
  disputeAnalysis.timeline.forEach((step, idx) => console.log(`     Step ${idx + 1}: ${step}`));
  console.log(`   - Possible Resolutions:`);
  disputeAnalysis.possibleResolutions.forEach((res, idx) => console.log(`     Option ${idx + 1}: ${res}`));
  console.log(`   - Provider Used: ${disputeAnalysis.aiProvider || 'mock'}\n`);

  console.log('===============================================================');
  console.log('             ALL AI SERVICES TESTED SUCCESSFULLY!              ');
  console.log('===============================================================');
}

testAIServices().catch((err) => {
  console.error('AI Service Test Error:', err);
  process.exit(1);
});
