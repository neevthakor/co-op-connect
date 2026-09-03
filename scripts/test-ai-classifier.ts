import { parseServiceRequest } from '../src/services/ai';

async function testClassifier() {
  const tests = [
    { input: 'AC thanda nahi kar raha', expectedIntent: 'SERVICE_REQUEST', expectedCat: 'cat-ac' },
    { input: 'tap se pani leak ho raha hai', expectedIntent: 'SERVICE_REQUEST', expectedCat: 'cat-plumber' },
    { input: 'fan nahi chal raha', expectedIntent: 'SERVICE_REQUEST', expectedCat: 'cat-electrician' },
    { input: 'fridge cooling nahi kar raha', expectedIntent: 'SERVICE_REQUEST', expectedCat: 'cat-appliance' },
    { input: 'accident hua hai', expectedIntent: ['EMERGENCY', 'MEDICAL_EMERGENCY'], expectedCat: null },
    { input: 'mummy gir gayi hain aur chot lagi hai', expectedIntent: ['EMERGENCY', 'MEDICAL_EMERGENCY'], expectedCat: null },
    { input: 'ghar mein aag lag gayi', expectedIntent: ['EMERGENCY', 'MEDICAL_EMERGENCY'], expectedCat: null },
    { input: 'ambulance chahiye', expectedIntent: ['EMERGENCY', 'MEDICAL_EMERGENCY'], expectedCat: null },
    { input: 'mujhe lawyer chahiye', expectedIntent: 'OUT_OF_SCOPE', expectedCat: null },
    { input: 'restaurant suggest karo', expectedIntent: 'OUT_OF_SCOPE', expectedCat: null },
    { input: 'train ticket book karni hai', expectedIntent: 'OUT_OF_SCOPE', expectedCat: null },
    { input: 'help chahiye', expectedIntent: 'CLARIFICATION_REQUIRED', expectedCat: null },
    { input: 'problem hai', expectedIntent: 'CLARIFICATION_REQUIRED', expectedCat: null },
    { input: 'worker chahiye', expectedIntent: 'CLARIFICATION_REQUIRED', expectedCat: null },
    { input: 'AC mein problem hai but ghar mein accident bhi hua hai', expectedIntent: ['EMERGENCY', 'MEDICAL_EMERGENCY'], expectedCat: null },
    { input: 'police chahiye aur bathroom ka tap bhi leak hai', expectedIntent: ['EMERGENCY', 'MEDICAL_EMERGENCY'], expectedCat: null },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const result = await parseServiceRequest(t.input);
      const intentMatches = Array.isArray(t.expectedIntent) 
        ? t.expectedIntent.includes(result.intent)
        : result.intent === t.expectedIntent;
      const catMatches = result.categoryId === t.expectedCat;

      if (intentMatches && catMatches) {
        console.log('PASS: ' + t.input + ' -> ' + result.intent);
        passed++;
      } else {
        console.log('FAIL: ' + t.input);
        console.log('  Expected Intent: ' + t.expectedIntent + ', Got: ' + result.intent);
        console.log('  Expected Cat: ' + t.expectedCat + ', Got: ' + result.categoryId);
      }
    } catch (e) {
      console.log('ERROR on ' + t.input + ': ' + e);
    }
  }
  console.log('RESULTS: ' + passed + '/' + tests.length + ' PASSED');
}
testClassifier();
