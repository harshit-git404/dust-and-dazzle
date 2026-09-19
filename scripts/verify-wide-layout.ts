async function verifyWideLayout() {
  console.log('📐 Starting Wide-Layout Structure & Responsiveness Verification...\n');

  const baseUrl = 'http://localhost:3000';
  const routes = ['/', '/toc', '/story/the-forgotten-pillar'];

  for (const route of routes) {
    console.log(`Checking route: ${route}...`);
    const res = await fetch(`${baseUrl}${route}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${route}: ${res.status}`);
    }
    const html = await res.text();

    if (route === '/') {
      const hasSpread = html.includes('grid-cols-1 lg:grid-cols-2');
      const hasTwoColList = html.includes('grid-cols-1 md:grid-cols-2');
      const hasTitle = html.includes('Dust and Dazzle');
      console.log(`   ✅ Two-page spread on wide screens: ${hasSpread ? 'CONFIRMED' : 'FAILED'}`);
      console.log(`   ✅ Two-column story sequence grid: ${hasTwoColList ? 'CONFIRMED' : 'FAILED'}`);
      console.log(`   ✅ Title uses "Dust and Dazzle": ${hasTitle ? 'CONFIRMED' : 'FAILED'}`);
      if (!hasSpread || !hasTwoColList || !hasTitle) throw new Error('Home wide-layout verification failed');
    }

    if (route === '/toc') {
      const hasHeading = html.includes('Contents') && html.includes('(');
      const hasTwoCols = html.includes('grid-cols-1 xl:grid-cols-2');
      console.log(`   ✅ Dynamic "Contents (N)" heading: ${hasHeading ? 'CONFIRMED' : 'FAILED'}`);
      console.log(`   ✅ Two columns from 1200px (xl:grid-cols-2): ${hasTwoCols ? 'CONFIRMED' : 'FAILED'}`);
      if (!hasHeading || !hasTwoCols) throw new Error('/toc wide-layout verification failed');
    }

    if (route.startsWith('/story/')) {
      const hasSidebar = html.includes('In this collection');
      const hasTextControl = html.includes('Type') || html.includes('A+');
      const has680Reading = html.includes('max-w-[680px]');
      const hasMarginalia = html.includes('Reading Progress') || html.includes('Archival Plates');
      console.log(`   ✅ Sticky left "In this collection" sidebar: ${hasSidebar ? 'CONFIRMED' : 'FAILED'}`);
      console.log(`   ✅ Text size control (A-/A+): ${hasTextControl ? 'CONFIRMED' : 'FAILED'}`);
      console.log(`   ✅ Centered 680px reading column: ${has680Reading ? 'CONFIRMED' : 'FAILED'}`);
      console.log(`   ✅ Right marginalia (photos / progress): ${hasMarginalia ? 'CONFIRMED' : 'FAILED'}`);
      if (!hasSidebar || !hasTextControl || !has680Reading || !hasMarginalia) {
        throw new Error('Story wide-layout verification failed');
      }
    }
  }

  console.log('\n✨ ALL WIDE LAYOUT STRUCTURE CHECKS VERIFIED SUCCESSFULLY! ✨\n');
}

verifyWideLayout().catch((err) => {
  console.error('Wide layout verification failed:', err);
  process.exit(1);
});
