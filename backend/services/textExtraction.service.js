import fs from 'fs';
import path from 'path';
import os from 'os';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fromPath } from 'pdf2pic';
import Tesseract from 'tesseract.js';

// Utility function to save a PDF buffer to a temporary file
const writeTempFile = (buffer, filename) => {
    // Sanitize filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    // Use OS temp directory for storing temporary files
    const tmpDir = os.tmpdir();
    // Build full path for temp file
    const filePath = path.join(tmpDir, sanitizedFilename);
    // Write buffer content to the temp file synchronously
    fs.writeFileSync(filePath, buffer);
    return filePath;
};

// Main function to extract text from PDF, OCR fallback if necessary
export async function extractTextFromPdf(buffer) {
    // Initialize result object to hold extraction outcomes and metadata
    const result = {
        success: false,
        text: [],
        totalPages: 0,
        requiresOCR: false,
        method: '',
    };

    // Validate input type: must be a Buffer containing PDF binary data
    if (!Buffer.isBuffer(buffer)) {
        throw new Error('extractTextFromPdf expects a Buffer. Got type: ' + typeof buffer);
    }
    // Security/validation: limit PDF size to prevent excessive memory usage or DoS
    const maxPDFSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxPDFSize) {
        throw new Error(
            `PDF size (${(buffer.length / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of ${(maxPDFSize / 1024 / 1024).toFixed(2)} MB`
        );
    }

    // Attempt direct text extraction using pdfjsLib
    try {
        // Load PDF document from buffer using pdfjsLib
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pages = [];

        // Iterate through each page to extract text content
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            // Concatenate text strings from page items
            const pageText = textContent.items.map(item => item.str).join(' ');
            pages.push({ page: i, text: pageText.trim() });
        }

        // Combine all page texts to check overall content length
        const combinedText = pages.map(p => p.text).join(' ').trim();

        // If extracted text is sufficiently long, consider extraction successful
        const minTextLength = 20; // Minimum length for valid text extraction
        if (combinedText.length > minTextLength) {
            result.success = true;
            result.text = pages;
            result.totalPages = numPages;
            result.requiresOCR = false;
            result.method = 'Direct extraction';
            return result; // Return early since direct extraction succeeded
        }
    } catch (err) {
        // Log warning but do not throw; fallback to OCR if direct extraction fails
        console.warn('Direct text extraction failed:', err.message);
    }

    // If direct extraction failed or text was too short, proceed to OCR fallback
    try {
        result.requiresOCR = true;
        result.method = 'OCR';

        // Write PDF buffer to a temporary file for conversion to images
        const tempFile = writeTempFile(buffer, `ocr-temp-${Date.now()}.pdf`);
        const tempImages = [];

        try {
            // Convert PDF pages to images using pdf2pic
            const convert = fromPath(tempFile, {
                density: 150, // Image resolution for better OCR accuracy
                saveFilename: 'ocr-image',
                savePath: os.tmpdir(), // Save images in OS temp directory
                format: 'png' // Use PNG format for lossless images
            });
            // Convert all pages (-1) to images asynchronously
            const pages = await convert.bulk(-1);
            tempImages.push(...pages);
            result.totalPages = pages.length;

            // Tesseract.js will auto-download/manage language data in the project root
            // No manual path setup is required.

            // Perform OCR on each image page sequentially
            for (const [i, page] of pages.entries()) {
                try {
                    // Recognize text from image using Tesseract
                    const ocrResult = await Tesseract.recognize(page.path, 'eng');
                    // Store recognized text along with page number
                    result.text.push({
                        page: i + 1,
                        text: ocrResult.data.text.trim(),
                    });
                } catch (err) {
                    // If OCR fails on a page, log warning and mark page text accordingly
                    console.warn(`OCR failed on page ${i + 1}:`, err.message);
                    result.text.push({
                        page: i + 1,
                        text: '[OCR failed]',
                    });
                }
            }
            result.success = true; // Mark overall OCR process as successful
        } finally {
            // Cleanup temporary files to avoid disk space leaks
            // Remove temp PDF file
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            // Remove all generated temp images
            tempImages.forEach(p => {
                if (fs.existsSync(p.path)) {
                    fs.unlinkSync(p.path);
                }
            });
        }
    } catch (ocrErr) {
        // Log any errors encountered during OCR processing
        console.error('OCR failed:', ocrErr.message);
    }

    // Return the result object, indicating success or failure and any extracted text
    return result;
}
