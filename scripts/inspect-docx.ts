import mammoth from 'mammoth';
import path from 'path';
import fs from 'fs';

async function inspectDocx() {
  const docPath = path.join(process.cwd(), 'docs', 'Dust_and_Dazzle.docx');
  const result = await mammoth.convertToHtml({ path: docPath }, {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Subtitle'] => h3.subtitle:fresh",
    ]
  });

  const html = result.value;
  fs.writeFileSync(path.join(process.cwd(), 'scripts', 'raw-output.html'), html, 'utf8');
  console.log(`Generated raw-output.html (${html.length} chars)`);

  // Print all headings found
  const h1Matches = [...html.matchAll(/<h1>(.*?)<\/h1>/gi)];
  console.log(`\nFound ${h1Matches.length} <h1> elements:`);
  h1Matches.forEach((m, idx) => {
    console.log(`  ${idx + 1}. ${m[1]}`);
  });

  const h2Matches = [...html.matchAll(/<h2>(.*?)<\/h2>/gi)];
  console.log(`\nFound ${h2Matches.length} <h2> elements:`);
  h2Matches.forEach((m, idx) => {
    console.log(`  ${idx + 1}. ${m[1]}`);
  });

  const h3Matches = [...html.matchAll(/<h3>(.*?)<\/h3>/gi)];
  console.log(`\nFound ${h3Matches.length} <h3> elements:`);
  h3Matches.forEach((m, idx) => {
    console.log(`  ${idx + 1}. ${m[1]}`);
  });
}

inspectDocx().catch(console.error);
