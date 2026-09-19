import fs from 'fs';
import path from 'path';

function inspectFiftyDetails() {
  const html = fs.readFileSync(path.join(process.cwd(), 'scripts', 'raw-output.html'), 'utf8');
  const fiftyStart = html.indexOf('<h1><a id="_TOC_250003"></a>At Fifty: Sandwich Generation</h1>');
  const houseStart = html.indexOf('<h1><a id="_TOC_250002"></a>The House That Time Forgot</h1>');
  const fiftyHtml = html.substring(fiftyStart, houseStart);

  const paragraphs = fiftyHtml.match(/<p>[\s\S]*?<\/p>/g) || [];
  console.log(`At Fifty has ${paragraphs.length} paragraphs:\n`);
  paragraphs.forEach((p, idx) => {
    console.log(`[P ${idx + 1}]: ${p}\n`);
  });
}

inspectFiftyDetails();
