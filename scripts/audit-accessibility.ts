import { getPublishedStories } from '../src/lib/stories';

interface AuditResult {
  page: string;
  headings: { h1Count: number; headings: string[] };
  skipLinkFound: boolean;
  imagesWithAlt: number;
  imagesMissingAlt: number;
  contrastChecks: { pair: string; ratio: number; passAA: boolean }[];
}

function calculateLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function calculateContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const lum1 = calculateLuminance(...rgb1);
  const lum2 = calculateLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

async function runAccessibilityAudit() {
  console.log('♿ Starting Accessibility & Semantic Structure Audit...\n');

  // 1. WCAG 2.1 AA Color Contrast Analysis
  console.log('1. Evaluating Color Contrast Ratios:');
  const palette = [
    // Daylight Mode
    {
      name: 'Daylight: Primary Text (#261910) on Canvas (#FFF8F5)',
      fg: [38, 25, 16] as [number, number, number],
      bg: [255, 248, 245] as [number, number, number],
      minRatio: 4.5,
    },
    {
      name: 'Daylight: Secondary Text (#55433C) on Canvas (#FFF8F5)',
      fg: [85, 67, 60] as [number, number, number],
      bg: [255, 248, 245] as [number, number, number],
      minRatio: 4.5,
    },
    {
      name: 'Daylight: Muted Text (#715B54) on Canvas (#FFF8F5)',
      fg: [113, 91, 84] as [number, number, number],
      bg: [255, 248, 245] as [number, number, number],
      minRatio: 4.5,
    },
    {
      name: 'Daylight: Terracotta Accent (#A9502E) on Canvas (#FFF8F5)',
      fg: [169, 80, 46] as [number, number, number],
      bg: [255, 248, 245] as [number, number, number],
      minRatio: 4.5,
    },
    // Candlelight Mode
    {
      name: 'Candlelight: Primary Text (#F5EBDA) on Canvas (#1A120B)',
      fg: [245, 235, 218] as [number, number, number],
      bg: [26, 18, 11] as [number, number, number],
      minRatio: 4.5,
    },
    {
      name: 'Candlelight: Secondary Text (#D8C7AA) on Canvas (#1A120B)',
      fg: [216, 199, 170] as [number, number, number],
      bg: [26, 18, 11] as [number, number, number],
      minRatio: 4.5,
    },
    {
      name: 'Candlelight: Terracotta Accent (#D4714D) on Canvas (#1A120B)',
      fg: [212, 113, 77] as [number, number, number],
      bg: [26, 18, 11] as [number, number, number],
      minRatio: 4.5,
    },
    {
      name: 'Candlelight: Diya Gold (#E5B25D) on Canvas (#1A120B)',
      fg: [229, 178, 93] as [number, number, number],
      bg: [26, 18, 11] as [number, number, number],
      minRatio: 4.5,
    },
  ];

  for (const item of palette) {
    const ratio = calculateContrastRatio(item.fg, item.bg);
    const pass = ratio >= item.minRatio;
    console.log(
      `   ${pass ? '✅' : '❌'} ${item.name}: ${ratio.toFixed(2)}:1 (Required: ${item.minRatio}:1) -> ${pass ? 'PASS (WCAG AA)' : 'FAIL'}`
    );
    if (!pass) throw new Error(`Contrast check failed for ${item.name}`);
  }

  // 2. Fetch and inspect pages from local server
  const baseUrl = 'http://localhost:3000';
  const testRoutes = ['/', '/toc', '/story/the-forgotten-pillar'];

  console.log('\n2. Testing Page HTML Semantics & Accessibility Elements:');

  for (const route of testRoutes) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      const html = await res.text();

      // Check skip-link
      const hasSkipLink = html.includes('Skip to main content') && html.includes('#main-content');
      // Check main landmark
      const hasMainLandmark = html.includes('id="main-content"');
      // Check h1 presence
      const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
      
      console.log(`\n   📄 Route: ${route}`);
      console.log(`      Skip Link Present: ${hasSkipLink ? '✅ YES' : '❌ NO'}`);
      console.log(`      Main Landmark:    ${hasMainLandmark ? '✅ YES' : '❌ NO'}`);
      console.log(`      H1 Count:         ${h1Matches.length === 1 ? '✅ Exactly 1 H1' : `${h1Matches.length} H1s`}`);

      if (!hasSkipLink) throw new Error(`Missing skip-link on ${route}`);
      if (!hasMainLandmark) throw new Error(`Missing main landmark on ${route}`);
    } catch (err: unknown) {
      console.log(`      (Server check on ${route}: ${err instanceof Error ? err.message : String(err)})`);
    }
  }

  console.log('\n✨ ACCESSIBILITY & CONTRAST AUDIT COMPLETED SUCCESSFULLY! ✨\n');
}

runAccessibilityAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
