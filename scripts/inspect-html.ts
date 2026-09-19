import fs from 'fs';
import path from 'path';

function inspectRawHtml() {
  const html = fs.readFileSync(path.join(process.cwd(), 'scripts', 'raw-output.html'), 'utf8');
  
  // Split by <h1>
  const h1Regex = /<h1>(.*?)<\/h1>/gi;
  const sections: { title: string; html: string }[] = [];
  
  let match;
  let lastIndex = 0;
  let currentTitle = '';
  
  // Find all H1 positions
  const h1s: { title: string; index: number }[] = [];
  while ((match = h1Regex.exec(html)) !== null) {
    const rawTitle = match[1].replace(/<a[^>]*><\/a>/g, '').trim();
    h1s.push({ title: rawTitle, index: match.index });
  }

  console.log(`Found ${h1s.length} stories (H1):`);
  h1s.forEach((h, i) => {
    const nextIndex = i < h1s.length - 1 ? h1s[i + 1].index : html.length;
    const storyContent = html.substring(h.index, nextIndex);
    // remove <h1>...</h1>
    const bodyOnly = storyContent.replace(/<h1>.*?<\/h1>/i, '').trim();
    
    // Split into paragraphs
    const pMatches = bodyOnly.match(/<p>.*?<\/p>/gi) || [];
    
    console.log(`\nStory ${i + 1}: "${h.title}" -> ${pMatches.length} paragraphs`);
    
    // Look at first 3 paragraphs and last paragraph
    pMatches.slice(0, 3).forEach((p, pi) => {
      console.log(`   [P ${pi + 1}]: ${p.substring(0, 100)}...`);
    });
  });
}

inspectRawHtml();
