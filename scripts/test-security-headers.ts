async function verifySecurityHeaders() {
  console.log('🛡️ Starting Security Headers & Hardening Verification...\n');

  const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

  console.log(`Connecting to server at ${baseUrl}...`);
  try {
    const res = await fetch(`${baseUrl}/`);
    console.log(`Response status: ${res.status}`);

    const headers = res.headers;

    const csp = headers.get('content-security-policy');
    const xContentType = headers.get('x-content-type-options');
    const xFrameOptions = headers.get('x-frame-options');
    const referrerPolicy = headers.get('referrer-policy');
    const permissionsPolicy = headers.get('permissions-policy');
    const hsts = headers.get('strict-transport-security');

    console.log('\n--- Received Security Headers ---');
    console.log(`Content-Security-Policy: ${csp || '❌ MISSING'}`);
    console.log(`X-Content-Type-Options:  ${xContentType || '❌ MISSING'}`);
    console.log(`X-Frame-Options:         ${xFrameOptions || '❌ MISSING'}`);
    console.log(`Referrer-Policy:         ${referrerPolicy || '❌ MISSING'}`);
    console.log(`Permissions-Policy:      ${permissionsPolicy || '❌ MISSING'}`);
    console.log(`Strict-Transport-Sec:    ${hsts || '❌ MISSING'}`);

    if (!csp || !csp.includes("default-src 'self'")) {
      throw new Error('Content-Security-Policy header is missing or malformed!');
    }
    if (xContentType !== 'nosniff') {
      throw new Error(`X-Content-Type-Options expected "nosniff", got "${xContentType}"`);
    }
    if (xFrameOptions !== 'DENY') {
      throw new Error(`X-Frame-Options expected "DENY", got "${xFrameOptions}"`);
    }
    if (referrerPolicy !== 'strict-origin-when-cross-origin') {
      throw new Error(`Referrer-Policy expected "strict-origin-when-cross-origin", got "${referrerPolicy}"`);
    }

    console.log('\n✅ All HTTP Security Headers Verified Successfully!');

    // Test robots.txt route
    console.log('\nTesting /robots.txt dynamic route...');
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    const robotsText = await robotsRes.text();
    console.log(`Robots.txt content:\n${robotsText}`);

    if (!robotsText.includes('Disallow: /')) {
      throw new Error('Default robots.txt should disallow all search engines when SITE_INDEXABLE is false!');
    }
    console.log('✅ Robots.txt correctly blocks search engines by default (controlled via SITE_INDEXABLE).');

    console.log('\n✨ ALL SECURITY HARDENING TESTS PASSED! ✨\n');
  } catch (err: unknown) {
    console.error('❌ Security verification failed:', err);
    process.exit(1);
  }
}

verifySecurityHeaders();
