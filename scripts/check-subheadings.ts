import fs from 'fs';
import path from 'path';

function checkAllSubheadings() {
  const html = fs.readFileSync(path.join(process.cwd(), 'scripts', 'raw-output.html'), 'utf8');
  const h1Regex = /<h1><a id="[^"]*"><\/a>(.*?)<\/h1>/gi;
  const matches = [...html.matchAll(h1Regex)];

  matches.forEach((m, idx) => {
    const title = m[1].trim();
    const startIndex = m.index! + m[0].length;
    const endIndex = idx < matches.length - 1 ? matches[idx + 1].index! : html.length;
    const storyHtml = html.substring(startIndex, endIndex);

    const paragraphs = storyHtml.match(/<p>[\s\S]*?<\/p>/g) || [];

    paragraphs.forEach((p, pIdx) => {
      const text = p.replace(/<[^>]+>/g, '').trim();
      // Check if text has subheadings like Roman numerals, Part I, bold headings, etc.
      if (text.startsWith('Part ') || text.startsWith('Section ') || text.startsWith('Chapter ') || /^([I|V|X]+)\.\s+/i.test(text)) {
        console.log(`Story ${idx + 1} "${title}" P ${pIdx + 1} possible subheading: "${text}"`);
      }
    });
  });
}

checkAllSubheadings();
