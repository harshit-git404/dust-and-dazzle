import AdmZip from 'adm-zip';
import path from 'path';

function analyzeAllParagraphs() {
  const docPath = path.join(process.cwd(), 'docs', 'Dust_and_Dazzle.docx');
  const zip = new AdmZip(docPath);
  const documentXml = zip.readAsText('word/document.xml');

  // Let's parse all <w:p>
  const pMatches = documentXml.match(/<w:p[ >].*?<\/w:p>/gs) || [];
  console.log(`Total paragraphs in document: ${pMatches.length}`);

  let currentStory = '';
  let storyIndex = 0;

  pMatches.forEach((p, idx) => {
    // Check if Heading 1
    const isH1 = p.includes('w:val="Heading1"');
    const text = [...p.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)].map(t => t[1]).join('').trim();
    if (!text) return;

    if (isH1) {
      storyIndex++;
      currentStory = text;
      console.log(`\n========================================`);
      console.log(`Story ${storyIndex}: ${currentStory}`);
      console.log(`========================================`);
      return;
    }

    if (storyIndex === 0) return; // Before first story (TOC etc)

    // Check formatting of runs in this paragraph
    const runs = [...p.matchAll(/<w:r[ >].*?<\/w:r>/gs)].map(rMatch => {
      const r = rMatch[0];
      const rText = [...r.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)].map(t => t[1]).join('');
      const isBold = r.includes('<w:b/>') || r.includes('<w:b ');
      const isItalic = r.includes('<w:i/>') || r.includes('<w:i ');
      const szMatch = r.match(/<w:sz w:val="(\d+)"\/>/);
      const sz = szMatch ? parseInt(szMatch[1]) : 24; // default 12pt = 24 half-pts
      return { text: rText, isBold, isItalic, sz };
    });

    const hasBold = runs.some(r => r.isBold && r.text.trim().length > 0);
    const allBold = runs.length > 0 && runs.every(r => (r.isBold || !r.text.trim()));
    const isShort = text.length < 80;

    if (hasBold || allBold) {
      console.log(`  [P ${idx}] BOLD RUNS: allBold=${allBold}, short=${isShort} -> "${text}"`);
      runs.forEach(r => {
        if (r.text.trim()) console.log(`      run: bold=${r.isBold}, italic=${r.isItalic}, sz=${r.sz}, txt="${r.text}"`);
      });
    }
  });
}

analyzeAllParagraphs();
