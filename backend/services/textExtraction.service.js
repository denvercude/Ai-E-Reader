import fs from 'fs';
import path from 'path';
import os from 'os';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { fromPath } from 'pdf2pic';
import Tesseract from 'tesseract.js';

// utility function to save a PDF buffer to a temporary file
const writeTempFile = (buffer, filename) => {
    const sanitizedFilename = path.basename(filename);
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, sanitizedFilename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
};

// main function to extract text from PDF, OCR fallback if necessary
export async function extractTextFromPdf(buffer) {
    const result = {
        success: false,
        text: [],
        totalPages: 0,
        requiresOCR: false,
        method: '',
    };

    if (!Buffer.isBuffer(buffer)) {
        throw new Error('extractTextFromPdf expects a Buffer. Got type: ' + typeof buffer);
    }
    // limit PDF size to prevent memory issues
    const maxPDFSize = 50 * 1024 * 1024; // 50MB
    if (buffer.length > maxPDFSize) {
        throw new Error(
            `PDF size (${(buffer.length / 1024 / 1024).toFixed(2)} MB) exceeds maximum allowed size of ${(maxPDFSize / 1024 / 1024).toFixed(2)} MB`
        );
    }

    try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pages = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            pages.push({ page: i, text: pageText.trim() });
        }

        const combinedText = pages.map(p => p.text).join(' ').trim();

        if (combinedText.length > 20) {
            result.success = true;
            result.text = pages;
            result.totalPages = numPages;
            result.requiresOCR = false;
            result.method = 'Direct extraction';
            return result;
        }
    } catch (err) {
        console.warn('Direct text extraction failed:', err.message);
    }

    try {
        result.requiresOCR = true;
        result.method = 'OCR';
        const tempFile = writeTempFile(buffer, `ocr-temp-${Date.now()}.pdf`);
        const tempImages = [];
        try {
            const convert = fromPath(tempFile, {
                density: 150,
                saveFilename: 'ocr-image',
                savePath: os.tmpdir(),
                format: 'png'
            });
            const pages = await convert.bulk(-1);
            tempImages.push(...pages);
            result.totalPages = pages.length;

            // Check that Tesseract 'eng' language data exists
            const tessdataPrefix = process.env.TESSDATA_PREFIX || '';
            const langDataPath = path.join(tessdataPrefix, 'tessdata', 'eng.traineddata');
            if (!fs.existsSync(langDataPath)) {
                throw new Error(`Tesseract language data not found at ${langDataPath}. Please install 'eng.traineddata'.`);
            }

            for (const [i, page] of pages.entries()) {
                try {
                    const ocrResult = await Tesseract.recognize(page.path, 'eng', {
                        langPath: path.join(process.env.TESSDATA_PREFIX, 'tessdata')
                    });
                    result.text.push({
                        page: i + 1,
                        text: ocrResult.data.text.trim(),
                    });
                } catch (err) {
                    console.warn(`OCR failed on page ${i + 1}:`, err.message);
                    result.text.push({
                        page: i + 1,
                        text: '[OCR failed]',
                    });
                }
            }
            result.success = true;
        } finally {
            // Cleanup temp files
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            tempImages.forEach(p => {
                if (fs.existsSync(p.path)) {
                    fs.unlinkSync(p.path);
                }
            });
        }
    } catch (ocrErr) {
        console.error('OCR failed:', ocrErr.message);
    }

    return result;
}
