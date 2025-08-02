## OCR Language Data (Tesseract)

This project requires Tesseract's English language data for OCR.

- **You do NOT need to manually download or configure language files.**
- When you run the service, `tesseract.js` will automatically download `eng.traineddata` to your project root if it does not already exist.
- To ensure consistent results for all developers and CI, `eng.traineddata` is tracked in the repository using Git LFS.

No additional setup is required. If you remove the file, it will be re-downloaded as needed.