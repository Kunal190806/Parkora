const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const PptxGenJS = require('pptxgenjs');

// PPTXGenJS LAYOUT_16x9 is 10 x 5.625 inches
const WIDTH_PX = 1920;
const HEIGHT_PX = 1080;
const WIDTH_IN = 10;
const HEIGHT_IN = 5.625;

function pxToIn(px, axis) {
  if (!px) return 0;
  if (axis === 'x') return (parseFloat(px) / WIDTH_PX) * WIDTH_IN;
  if (axis === 'y') return (parseFloat(px) / HEIGHT_PX) * HEIGHT_IN;
  return 0;
}

// Convert px font size to PPT points, scaling properly to the 10x5.625 layout
function pxToPt(px) {
  if (!px) return 14;
  return parseFloat(px) * (WIDTH_IN / WIDTH_PX) * 72;
}

function extractStyle(styleStr, prop) {
  if (!styleStr) return null;
  const regex = new RegExp(`${prop}\\s*:\\s*([^;]+)`);
  const match = styleStr.match(regex);
  return match ? match[1].trim() : null;
}

function cssColorToHex(color) {
  if (!color) return '000000';
  if (color.startsWith('var(')) {
    const varMap = {
      '--bg-page': 'ECE7D8',
      '--bg-card': 'F4F0E2',
      '--bg-soft': 'FAF7EB',
      '--ink': '14253F',
      '--ink-2': '1B2330',
      '--ink-3': '4D5663',
      '--ink-4': '8E96A0',
      '--rule': '14253F', 
      '--accent': 'F2C300',
      '--accent-2': 'E0AE00',
      '--pos': '117373',
      '--warn': 'B8655F',
    };
    const varName = color.match(/var\(([^)]+)\)/)[1];
    return varMap[varName] || '000000';
  }
  if (color.startsWith('#')) return color.replace('#', '');
  return '000000';
}

async function convert() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  // Read manifest to get correct order
  const manifestPath = path.join(__dirname, 'Parkora Smart Parking Manifest.json');
  let playlist = [];
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    playlist = manifest.playlist || [];
  }

  // The actual files have names like "Parkora Smart Parking Cover.html" or "Smart Parking Dashboard.html"
  // Let's create a mapping or just process sequentially if we can't map
  const allFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
  
  // Try to sort intelligently or just alphabetical
  allFiles.sort((a, b) => {
    // If they have numbers in parens like (1), sort by that
    const numA = a.match(/\((\d+)\)/);
    const numB = b.match(/\((\d+)\)/);
    if (numA && numB) return parseInt(numA[1]) - parseInt(numB[1]);
    return a.localeCompare(b);
  });

  for (const file of allFiles) {
    console.log(`Parsing ${file}...`);
    const filePath = path.join(__dirname, file);
    const html = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(html);

    const slide = pptx.addSlide();
    
    // Background color
    const slideContainer = $('.slide-container');
    if (slideContainer.length > 0) {
      const bg = extractStyle(slideContainer.attr('style'), 'background');
      if (bg) {
        slide.background = { color: cssColorToHex(bg) };
      } else {
        slide.background = { color: 'ECE7D8' };
      }
    }

    $('[data-object="true"]').each((i, el) => {
      const type = $(el).attr('data-object-type');
      const style = $(el).attr('style');
      
      let leftPx = extractStyle(style, 'left') || '0';
      let topPx = extractStyle(style, 'top') || '0';
      let widthPx = extractStyle(style, 'width') || '0';
      let heightPx = extractStyle(style, 'height') || '0';
      
      const x = pxToIn(leftPx, 'x');
      const y = pxToIn(topPx, 'y');
      let w = pxToIn(widthPx, 'x');
      let h = pxToIn(heightPx, 'y');

      if (type === 'shape') {
        const bg = extractStyle(style, 'background');
        if (bg) {
          slide.addShape(pptx.ShapeType.rect, {
            x, y, w: w || 1, h: h || 1,
            fill: { color: cssColorToHex(bg) },
            line: { type: 'none' }
          });
        }
      } else if (type === 'textbox') {
        let colorPx = extractStyle(style, 'color');
        let fontSizePx = extractStyle(style, 'font-size');
        let alignPx = extractStyle(style, 'text-align') || 'left';
        
        // Search children for styles if not on container
        const innerStyled = $(el).find('[style]');
        innerStyled.each((_, child) => {
          const childStyle = $(child).attr('style');
          if (!fontSizePx) fontSizePx = extractStyle(childStyle, 'font-size');
          if (!colorPx) colorPx = extractStyle(childStyle, 'color');
        });

        if (!colorPx) colorPx = 'var(--ink)';
        
        const ptSize = pxToPt(fontSizePx);
        let text = $(el).text().replace(/\s+/g, ' ').trim();
        
        if (w === 0) w = WIDTH_IN - x - 0.5; // expand to right margin if width=0
        if (h === 0) h = 1.5;

        slide.addText(text, {
          x, y, w, h,
          fontSize: ptSize,
          color: cssColorToHex(colorPx),
          valign: 'top',
          align: alignPx,
          margin: 0,
          wrap: true
        });
      }
    });
  }

  const outputPath = path.join(__dirname, 'Parkora_Editable.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Successfully created ${outputPath}`);
}

convert().catch(console.error);
