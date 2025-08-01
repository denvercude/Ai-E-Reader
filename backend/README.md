## OCR Language Data (Tesseract)

This project requires Tesseract's English language data for OCR.
1. Download `eng.traineddata` from: [tesseract-ocr/tessdata](https://github.com/tesseract-ocr/tessdata)
2. Place it in a `tessdata` folder at the root of your project:
   Ai-E-Reader/tessdata/eng.traineddata
3. Set the environment variable in your shell or `.env`:
   export TESSDATA_PREFIX=/Users/werk/projects/Ai-E-Reader