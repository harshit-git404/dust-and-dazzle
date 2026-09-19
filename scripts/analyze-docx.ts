import fs from 'fs';
import path from 'path';

function inspectStories() {
  const html = fs.readFileSync(path.join(process.cwd(), 'scripts', 'raw-output.html'), 'utf8');
  
  // Split by <h1>
  const parts = html.split(/<h1>/i);
  console.log(`Total sections: ${parts.length}`);

  // Part 1 is front matter/TOC before first H1.
  for (let i = 1; i < parts.length; i++) {
    const section = '<h1>' + parts[i];
    const titleMatch = section.match(/<h1>(?:<a[^>]*><\/a>)?(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim() : `Story ${i}`;
    
    console.log(`\n=== Story ${i}: ${title} ===`);
    
    // Check for bold standalone paragraphs or subheadings
    const paragraphs = section.match(/<p>.*?<\/p>/gi) || [];
    console.log(`Paragraph count: ${paragraphs.length}`);

    paragraphs.forEach((p, pIdx) => {
      // Check if entire paragraph is strong/bold or short
      const text = p.replace(/<[^>]+>/g, '').trim();
      const isAllStrong = /<p><strong>[^<]+<\/strong><\/p>/i.test(p);
      const isShort = text.length > 0 && text.length < 80;
      if (isAllStrong || (isShort && (title.includes('Fifty') || text.includes('Generation') || text.includes('Pillar')))) {
        console.log(`  [P ${pIdx + 1}] possible subheading: ${p}`);
      }
    });

    if (title.includes('Forgotten Pillar')) {
      console.log('\n--- Checking "The Forgotten Pillar" for "He rarely thought about himself" ---');
      paragraphs.forEach((p, pIdx) => {
        if (p.includes('He rarely thought about himself')) {
          console.log(`  [Match at P ${pIdx + 1} (${p.length} chars)]: ${p.substring(0, 150)}...`);
        }
      });
    }

    if (title.includes('Fifty')) {
      console.log('\n--- Checking "At Fifty: Sandwich Generation" structure ---');
      paragraphs.slice(0, 15).forEach((p, pIdx) => {
        console.log(`  [P ${pIdx + 1}]: ${p.substring(0, 120)}`);
      });
    }
  }
}

inspectStories();
