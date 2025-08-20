// Load environment variables from .env for consistent test behavior
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromPdf } from '../backend/services/textExtraction.service.js';

dotenv.config(); // Ensure env variables are available to service

// Force local extraction behavior for unit tests (no Textract path)
beforeAll(() => {
  process.env.OCR_PROVIDER = '';
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Jest test suite for text extraction service
describe('Text Extraction Service', () => {

  // Test 1: Direct extraction on text-based PDF
  test('Text-based PDF (direct extraction)', async () => {
    // Load the sample text-based PDF into a buffer
    const buffer = fs.readFileSync(path.join(__dirname, '../backend/test-files/test-text-document.pdf'));
    // Run the extraction service
    const result = await extractTextFromPdf(buffer);

    // Assert correct extraction behavior
    expect(result.success).toBe(true);
    expect(result.requiresOCR).toBe(false);
    expect(result.method).toBe('Direct extraction');
    expect(result.totalPages).toBeGreaterThan(0);
    // Check that the first page's text has meaningful content
    expect(result.text[0].text.length).toBeGreaterThan(20);
  });

  // Test 2: Fallback to OCR on image-based PDF
  test('Image-based PDF (OCR fallback)', async () => {
    // Load the scanned/image-based PDF
    const buffer = fs.readFileSync(path.join(__dirname, '../backend/test-files/test-scanned-document.pdf'));
    const result = await extractTextFromPdf(buffer);

    // Assert OCR fallback was triggered and succeeded
    expect(result.success).toBe(true);
    expect(result.requiresOCR).toBe(true);
    expect(result.method).toBe('OCR');
    expect(result.totalPages).toBeGreaterThan(0);
    // OCR output might be shorter/less predictable
    expect(result.text[0].text.length).toBeGreaterThan(0);
  });

  // Test 3: Corrupted input (should fail gracefully)
  test('Corrupted PDF (should fail gracefully)', async () => {
    // Pass a non-PDF buffer
    const buffer = Buffer.from('This is not a PDF file');
    const result = await extractTextFromPdf(buffer);

    // Assert extraction fails gracefully
    expect(result.success).toBe(false);
    expect(result.method).toBe('OCR'); // Method falls back to OCR attempt
    expect(result.text.length).toBe(0);
  });
});