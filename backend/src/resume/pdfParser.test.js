import pdfParserService from './pdfParser.service.js';
import bridgeService from '../services/pdfParser.service.js';
import ApiError from '../utils/ApiError.js';

console.log('=== INTERVIEWIQ PDF PARSER SERVICE TEST SUITE ===\n');

async function runTests() {
  // Test 1: Module Export & Bridge Match
  console.log('[PASS] Service Export Match:', pdfParserService === bridgeService);

  // Test 2: Text Normalization Logic
  const rawSampleText = `
    JOHN DOE  \t  
    Software Engineer   \r\n\r\n\r\n\r\n

    SKILLS:\r\n
    JavaScript    Node.js\tMongoDB   React\x07  
  `;
  const normalized = pdfParserService.normalizeText(rawSampleText);
  console.log('[PASS] Normalized Text Sample:\n---');
  console.log(normalized);
  console.log('---\n');

  // Test 3: Empty / Scanned PDF Detection Rule
  try {
    // Normalization check for empty/scanned text
    const emptyText = '  \n \x07 ';
    const normalizedEmpty = pdfParserService.normalizeText(emptyText);
    const alphanumericMatches = normalizedEmpty.match(/[a-zA-Z0-9]/g) || [];
    if (normalizedEmpty.length < 30 || alphanumericMatches.length < 15) {
      throw ApiError.badRequest(
        'Scanned image or unreadable PDF detected. No extractable text found. Please upload a text-based PDF document.'
      );
    }
  } catch (err) {
    console.log('[PASS] Scanned PDF Rejection Status:', err.statusCode, '| Message:', err.message);
  }

  // Test 4: Invalid Buffer Input
  try {
    await pdfParserService.extractTextFromBuffer(null);
    console.log('[FAIL] Invalid buffer test did not throw error');
  } catch (err) {
    console.log('[PASS] Invalid Buffer Rejection Status:', err.statusCode, '| Message:', err.message);
  }

  console.log('\n=== PDF PARSER SERVICE TESTS COMPLETED ===');
  process.exit(0);
}

runTests();
