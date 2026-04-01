const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Read local HTML file and set content
    const htmlContent = fs.readFileSync(path.join(__dirname, 'proposta.html'), 'utf8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF (A4 format)
    const pdfPath = path.join(__dirname, 'MS_TECH_GROUP_Proposta_Morauto_v4_1.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });
    
    console.log(`PDF successfully generated: ${pdfPath}`);
    await browser.close();
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
})();
