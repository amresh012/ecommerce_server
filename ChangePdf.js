const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const express = require('express');
const path = require('path');

(async () => {
  const app = express();

  // Path to your local PDF file
  const pdfPath =('invoice.pdf'); // Adjust path as needed
  // const pdfPath = 'C:/Users/Yatish Sharma/Desktop/NEWCLONE/MegaMenu-main/server/invoice.pdf';

  

  app.get('/download-pdf', async (req, res) => {
    try {
      // Read the local PDF file
      const existingPdfBytes = fs.readFileSync(pdfPath);

      // Load the PDF using pdf-lib
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Modify the PDF - e.g., add text to the first page
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Define square properties
      const x = 450;
      const y = 670;
      const size = 100; // Square side length
      const backgroundColor = rgb(1, 1, 1);

      // Draw a square on the first page with white background and no border
      firstPage.drawRectangle({
        x: x,
        y: y,
        width: size,
        height: size,
        color: backgroundColor, // Set background color to white
      });


      // Serialize the document to bytes
      const pdfBytes = await pdfDoc.save();

      // Send the modified PDF as a response
      res.contentType('application/pdf');
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error('Error processing PDF:', error.message);
      res.status(500).send('An error occurred while processing the PDF.');
    }
  });

  app.listen(3000, () => {
    
  });
})();

