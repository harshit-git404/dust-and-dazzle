import fs from 'fs';
import path from 'path';

function inspectPillar() {
  const html = fs.readFileSync(path.join(process.cwd(), 'scripts', 'raw-output.html'), 'utf8');
  const h1Pillar = html.indexOf('<h1><a id="_TOC_250015"></a>The Forgotten Pillar</h1>');
  const h1Teacup = html.indexOf('<h1><a id="_TOC_250014"></a>The Weight of a Teacup</h1>');
  const pillarHtml = html.substring(h1Pillar, h1Teacup);

  const paragraphs = pillarHtml.match(/<p>[\s\S]*?<\/p>/g) || [];
  console.log(`The Forgotten Pillar has ${paragraphs.length} paragraphs:\n`);
  paragraphs.forEach((p, idx) => {
    console.log(`[P ${idx + 1}] (${p.length} chars): ${p}\n`);
  });
}

inspectPillar();
