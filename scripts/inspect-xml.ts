import AdmZip from 'adm-zip';
import path from 'path';

function inspectXml() {
  const docPath = path.join(process.cwd(), 'docs', 'Dust_and_Dazzle.docx');
  const zip = new AdmZip(docPath);
  const documentXml = zip.readAsText('word/document.xml');
  const stylesXml = zip.readAsText('word/styles.xml');

  console.log(`Document XML length: ${documentXml.length}`);
  console.log(`Styles XML length: ${stylesXml.length}`);

  // Let's find all style names in styles.xml
  const styleMatches = [...stylesXml.matchAll(/<w:style[^>]*w:styleId="([^"]+)"[^>]*>[\s\S]*?<w:name w:val="([^"]+)"/g)];
  console.log('\nStyles in styles.xml:');
  styleMatches.forEach((m) => {
    console.log(`  ID: ${m[1]} -> Name: ${m[2]}`);
  });

  // Let's inspect paragraphs in document.xml for "At Fifty: Sandwich Generation"
  const fiftyIndex = documentXml.indexOf('At Fifty: Sandwich Generation');
  if (fiftyIndex !== -1) {
    const fiftyChunk = documentXml.substring(fiftyIndex, fiftyIndex + 20000);
    // Find all <w:p> in this chunk
    const pMatches = fiftyChunk.match(/<w:p.*?>[\s\S]*?<\/w:p>/g) || [];
    console.log(`\nFound ${pMatches.length} <w:p> tags in "At Fifty" section:`);
    pMatches.slice(0, 20).forEach((p, idx) => {
      // Extract text and style
      const textMatch = [...p.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)].map(t => t[1]).join('');
      const pStyleMatch = p.match(/<w:pStyle w:val="([^"]+)"\/>/);
      const isBold = p.includes('<w:b/>') || p.includes('<w:b ');
      const pStyle = pStyleMatch ? pStyleMatch[1] : 'normal';
      console.log(`  [P ${idx + 1}] style: ${pStyle}, bold: ${isBold} -> "${textMatch}"`);
    });
  }
}

inspectXml();
