import mammoth from 'mammoth';
import path from 'path';

async function inspectDocxDetails() {
  const docPath = path.join(process.cwd(), 'docs', 'Dust_and_Dazzle.docx');
  
  // Use custom transformDocument to inspect all element types and styles
  const transformDocument = (element: any): any => {
    return element;
  };

  const result = await mammoth.convertToHtml(
    { path: docPath },
    {
      includeDefaultStyleMap: true,
      transformDocument: (document: any) => {
        // Let's inspect headings / styles
        return document;
      }
    }
  );

  const docResult = await mammoth.extractRawText({ path: docPath });
  console.log(`Extracted raw text length: ${docResult.value.length}`);
}

inspectDocxDetails().catch(console.error);
