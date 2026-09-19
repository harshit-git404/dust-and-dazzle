import fs from 'fs';
import path from 'path';

function inspectAllStoriesStructure() {
  const html = fs.readFileSync(path.join(process.cwd(), 'scripts', 'raw-output.html'), 'utf8');
  
  // Split by H1
  const h1Regex = /<h1><a id="[^"]*"><\/a>(.*?)<\/h1>/gi;
  const matches = [...html.matchAll(h1Regex)];
  
  console.log(`Analyzing ${matches.length} stories...`);

  matches.forEach((m, idx) => {
    const title = m[1].trim();
    const startIndex = m.index! + m[0].length;
    const endIndex = idx < matches.length - 1 ? matches[idx + 1].index! : html.length;
    const storyHtml = html.substring(startIndex, endIndex);

    const paragraphs = storyHtml.match(/<p>[\s\S]*?<\/p>/g) || [];
    console.log(`\n======================================================`);
    console.log(`Story ${idx + 1}: "${title}" (${paragraphs.length} raw paragraphs)`);
    console.log(`======================================================`);

    // Check for mid-sentence splits:
    // Paragraph ends without sentence-ending punctuation [. ! ? ” " ’ '] and next paragraph starts with lowercase letter
    for (let i = 0; i < paragraphs.length - 1; i++) {
      const p1 = paragraphs[i];
      const p2 = paragraphs[i + 1];

      const text1 = p1.replace(/<[^>]+>/g, '').trim();
      const text2 = p2.replace(/<[^>]+>/g, '').trim();

      const lastChar = text1.slice(-1);
      const firstChar = text2.charAt(0);

      const hasSentenceEnding = /[.!?…"”’']/.test(lastChar);
      const isNextLowercase = /[a-z]/.test(firstChar);

      if (!hasSentenceEnding && isNextLowercase) {
        console.log(`  [REJOIN DETECTED at P ${i + 1} -> P ${i + 2}]`);
        console.log(`    P1 end: "...${text1.slice(-40)}"`);
        console.log(`    P2 start: "${text2.slice(0, 40)}..."`);
      }
    }

    // Check for subheadings (e.g. in At Fifty)
    paragraphs.forEach((p, pIdx) => {
      const text = p.replace(/<[^>]+>/g, '').trim();
      // Check if it looks like a subheading (e.g. bold, or specific short section markers)
      if (title.includes('Fifty')) {
        // Let's print candidate subheadings in At Fifty
        const candidates = [
          'We came from a different world',
          'We became the generation in the middle',
          'And somewhere in between is us',
          'When I look back'
        ];
        candidates.forEach(c => {
          if (text.includes(c)) {
            console.log(`  [SUBHEADING in At Fifty at P ${pIdx + 1}]: "${text}"`);
          }
        });
      }
    });
  });
}

inspectAllStoriesStructure();
