import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { extractTextFromPdf } from '../backend/services/textExtraction.service.js';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buffer = fs.readFileSync(path.join(__dirname, '../backend/test-files/test-text-document.pdf'));


// Main test runner
async function testTextExtraction() {
  console.log('\n=== Testing Text Extraction Service ===\n');

  // --- Test 1: Text-based PDF ---
  try {
    console.log('Test 1: Text-based PDF (direct extraction)');
    const buffer = fs.readFileSync(path.join(__dirname, '../backend/test-files/test-text-document.pdf'));
    const result = await extractTextFromPdf(buffer);

    console.log({
      success: result.success,
      method: result.requiresOCR ? 'OCR' : 'Direct extraction',
      pages: result.totalPages,
      firstPagePreview: result.text[0]?.text?.slice(0, 80) + '...'
    });
  } catch (err) {
    console.error('Test 1 failed:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // --- Test 2: Image-based PDF ---
  try {
    console.log('Test 2: Image-based PDF (OCR fallback)');
    const buffer = fs.readFileSync(path.join(__dirname, '../backend/test-files/test-scanned-document.pdf'));
    const result = await extractTextFromPdf(buffer);

    console.log({
      success: result.success,
      method: result.requiresOCR ? 'OCR' : 'Direct extraction',
      pages: result.totalPages,
      firstPagePreview: result.text[0]?.text?.slice(0, 80) + '...'
    });
  } catch (err) {
    console.error('Test 2 failed:', err.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // --- Test 3: Corrupted PDF ---
  try {
    console.log('Test 3: Corrupted PDF (should fail gracefully)');
    const buffer = Buffer.from('This is not a PDF file');
    const result = await extractTextFromPdf(buffer);

    console.log({
      success: result.success,
      method: result.requiresOCR ? 'OCR' : 'Direct extraction',
      error: result.success ? null : 'Expected failure for invalid input'
    });
  } catch (err) {
    console.error('Test 3 failed:', err.message);
  }

  console.log('\n=== Testing Complete ===\n');
  process.exit(0);
}

testTextExtraction();