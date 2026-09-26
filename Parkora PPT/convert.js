const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const PptxGenJS = require('pptxgenjs');

async function convert() {
  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
  if (files.length === 0) {
    console.log('No HTML files found.');
    return;
  }

  console.log(`Found ${files.length} HTML files. Starting conversion...`);

  // Try to sort them based on names if possible or just process them
  // We'll just sort alphabetically for now
  files.sort();

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  const browser = await puppeteer.launch({ headless: 'new' });
  
  for (const file of files) {
    const filePath = `file://${path.join(__dirname, file)}`;
    console.log(`Processing ${file}...`);
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Add slide
    const slide = pptx.addSlide();
    
    // Take screenshot as base64
    const screenshot = await page.screenshot({ encoding: 'base64', type: 'png' });
    
    slide.addImage({
      data: `image/png;base64,${screenshot}`,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%'
    });
    
    await page.close();
  }
  
  await browser.close();
  
  const outputPath = path.join(__dirname, 'Parkora_Presentation.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Successfully created ${outputPath}`);
}

convert().catch(console.error);
