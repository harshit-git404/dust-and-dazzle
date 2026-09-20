import AdmZip from 'adm-zip';
import path from 'path';

function inspectFiftyXml() {
  const docPath = path.join(process.cwd(), 'docs', 'Dust_and_Dazzle.docx');
  const zip = new AdmZip(docPath);
  const documentXml = zip.readAsText('word/document.xml');

  const fiftyIdx = documentXml.indexOf('At Fifty: Sandwich Generation');
  const houseIdx = documentXml.indexOf('The House That Time Forgot');
  const fiftySection = documentXml.substring(fiftyIdx, houseIdx);

  const pMatches = fiftySection.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [];
  console.log(`Paragraphs in At Fifty: ${pMatches.length}`);

  pMatches.forEach((p, idx) => {
    const text = [...p.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)].map(t => t[1]).join('').trim();
    // print pPr tags if any
    const pPr = p.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
    const rPrs = [...p.matchAll(/<w:rPr>[\s\S]*?<\/w:rPr>/g)].map(m => m[0]);
    console.log(`\n[P ${idx + 1}] "${text}"`);
    if (pPr) console.log(`  pPr: ${pPr[0]}`);
    if (rPrs.length) console.log(`  rPrs: ${rPrs.join(' | ')}`);
  });
}

inspectFiftyXml();
