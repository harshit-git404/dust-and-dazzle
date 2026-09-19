import AdmZip from 'adm-zip';
import path from 'path';

function inspectRawIndices() {
  const docPath = path.join(process.cwd(), 'docs', 'Dust_and_Dazzle.docx');
  const zip = new AdmZip(docPath);
  const documentXml = zip.readAsText('word/document.xml');

  let pos = 0;
  while ((pos = documentXml.indexOf('Sandwich Generation', pos)) !== -1) {
    console.log(`Found "Sandwich Generation" at pos ${pos}`);
    console.log(documentXml.substring(pos - 200, pos + 400));
    pos += 19;
  }
}

inspectRawIndices();
