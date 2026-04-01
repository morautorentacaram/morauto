const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generateFinalProposal() {
    const htmlPath = path.join(__dirname, 'proposta.html');
    const imgMobilePath = 'C:\\Users\\zilda\\.gemini\\antigravity\\brain\\f6d944f2-fb0f-4cd7-aba1-91a8cd369551\\app_mockup_mobile_1774820528132.png';
    const imgDashPath = 'C:\\Users\\zilda\\.gemini\\antigravity\\brain\\f6d944f2-fb0f-4cd7-aba1-91a8cd369551\\admin_dashboard_mockup_1774820544060.png';

    let html = fs.readFileSync(htmlPath, 'utf8');

    // Convert images to Base64
    function toBase64(filePath) {
        const file = fs.readFileSync(filePath);
        return `data:image/png;base64,${file.toString('base64')}`;
    }

    console.log('Converting images to Base64...');
    const dashBase64 = toBase64(imgDashPath);
    const mobileBase64 = toBase64(imgMobilePath);

    // Replace in HTML
    html = html.replace(
        'src="file:///C:/Users/zilda/.gemini/antigravity/brain/f6d944f2-fb0f-4cd7-aba1-91a8cd369551/admin_dashboard_mockup_1774820544060.png"',
        `src="${dashBase64}"`
    );
    html = html.replace(
        'src="file:///C:/Users/zilda/.gemini/antigravity/brain/f6d944f2-fb0f-4cd7-aba1-91a8cd369551/app_mockup_mobile_1774820528132.png"',
        `src="${mobileBase64}"`
    );

    const tempHtmlPath = path.join(__dirname, 'proposta_standalone.html');
    fs.writeFileSync(tempHtmlPath, html);

    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(__dirname, 'MS_TECH_GROUP_Proposta_Morauto_FINAL.pdf');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    await browser.close();
    console.log(`PDF successfully generated: ${pdfPath}`);
}

generateFinalProposal().catch(err => {
    console.error('Error generating PDF:', err);
    process.exit(1);
});
