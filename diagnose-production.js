const BASE_URL = 'https://v4.poornasreecloud.com';

async function diagnose() {
  console.log('🔍 Diagnosing Production Deployment\n');
  console.log('━'.repeat(70));
  
  const tests = [
    { name: 'Home Page', url: '/', expectedStatus: 200 },
    { name: 'Login Page', url: '/login', expectedStatus: 200 },
    { name: 'API Root (should redirect or 404)', url: '/api', expectedStatus: [404, 301, 302] },
    { name: 'External Auth Send OTP', url: '/api/external/auth/send-otp', method: 'POST', expectedStatus: 400 },
    { name: 'Debug Admin Lookup', url: '/api/debug/admin-lookup', expectedStatus: 200 },
  ];

  for (const test of tests) {
    try {
      const options = { method: test.method || 'GET' };
      if (test.method === 'POST') {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify({});
      }
      
      const res = await fetch(BASE_URL + test.url, options);
      const contentType = res.headers.get('content-type');
      const isJson = contentType?.includes('application/json');
      const isHtml = contentType?.includes('text/html');
      
      const expected = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus 
        : [test.expectedStatus];
      
      const pass = expected.includes(res.status);
      const status = pass ? '✓' : '✗';
      const color = pass ? '\x1b[32m' : '\x1b[31m';
      
      console.log(`${color}${status}\x1b[0m ${test.name}`);
      console.log(`  Status: ${res.status} ${res.statusText}`);
      console.log(`  Type: ${isJson ? 'JSON ✓' : isHtml ? 'HTML ✗' : contentType}`);
      
      if (!pass || isHtml) {
        const text = await res.text();
        if (text.includes('404') && text.includes('could not be found')) {
          console.log(`  ⚠️  Next.js 404 page detected - API route not found`);
        }
        if (text.includes('_next')) {
          console.log(`  ⚠️  Returning Next.js page instead of API response`);
        }
      }
      
      console.log('━'.repeat(70));
    } catch (error) {
      console.log(`\x1b[31m✗\x1b[0m ${test.name}: ${error.message}`);
      console.log('━'.repeat(70));
    }
  }

  console.log('\n📋 Diagnosis Summary:\n');
  console.log('If all API endpoints return HTML instead of JSON:');
  console.log('  1. Check if Next.js is running: pm2 list');
  console.log('  2. Check server logs: pm2 logs psr-v4');
  console.log('  3. Verify proxy configuration (nginx/apache)');
  console.log('  4. Ensure .next folder is deployed');
  console.log('  5. Check if port 3000 is accessible internally\n');
  
  console.log('Common fixes:');
  console.log('  • Restart: pm2 restart psr-v4');
  console.log('  • Rebuild: npm run build && pm2 restart psr-v4');
  console.log('  • Check nginx: sudo nginx -t && sudo systemctl restart nginx\n');
}

diagnose();
