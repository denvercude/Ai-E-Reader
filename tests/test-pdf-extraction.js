import pdfParse from "pdf-parse";
import fs from "fs";

//Define the async test function
async function testPDFExtraction() {
  try {
    //Read local PDF file into a buffer
    const pdfBuffer = fs.readFileSync('./tests/test-document.pdf')

    //Extract text and metadata from the PDF
    const data = await pdfParse(pdfBuffer)

    //log key information
    console.log('✅ PDF Text Extraction Successful')
    console.log(`Total Pages: ${data.numpages}`)
    console.log(`Text Length: ${data.text.length}`)
    console.log(`First 500 Characters: \n${data.text.substring(0, 500)}`)
  } catch (error) {
    console.error('❌ PDF Extraction Failed:', error.message);
  
  }}

  //Invoke the test function
  testPDFExtraction();

  // This code reads a PDF file, extracts its text and metadata, and logs the results to the console.
  // it uses the pdf-parse library to handle the PDF parsing.
  // gets the pdf file from the local filesystem, so ensure the path is correct.
  // Make sure to have the pdf-parse library installed in your project.