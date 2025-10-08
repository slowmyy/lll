#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('\n🏥 Health Check - Genly App Services\n');
console.log('='.repeat(60));

const checks = [];

function makeRequest(url, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'timeout', ok: false });
    });

    req.on('error', (err) => {
      resolve({ status: 'error', ok: false, error: err.message });
    });
  });
}

async function checkMetroServer() {
  console.log('📦 Checking Metro Bundler...');
  const result = await makeRequest('http://localhost:8081/status', 3000);

  if (result.ok) {
    console.log('✅ Metro Bundler: Running on port 8081');
    checks.push({ name: 'Metro Bundler', status: 'ok' });
  } else if (result.status === 'timeout') {
    console.log('❌ Metro Bundler: Not responding (timeout)');
    console.log('   💡 Fix: npm start');
    checks.push({ name: 'Metro Bundler', status: 'error' });
  } else {
    console.log('❌ Metro Bundler: Not running');
    console.log('   💡 Fix: npm start');
    checks.push({ name: 'Metro Bundler', status: 'error' });
  }
}

async function checkSupabase() {
  console.log('\n🔐 Checking Supabase...');

  const envFile = require('fs').readFileSync('.env', 'utf-8');
  const supabaseUrl = envFile.match(/EXPO_PUBLIC_SUPABASE_URL=(.*)/)?.[1];

  if (!supabaseUrl) {
    console.log('❌ Supabase: URL not configured in .env');
    checks.push({ name: 'Supabase', status: 'error' });
    return;
  }

  const result = await makeRequest(supabaseUrl + '/rest/v1/', 5000);

  if (result.status === 401 || result.status === 403 || result.ok) {
    console.log('✅ Supabase: Connected');
    console.log(`   URL: ${supabaseUrl}`);
    checks.push({ name: 'Supabase', status: 'ok' });
  } else {
    console.log('⚠️  Supabase: Connection issue');
    console.log(`   Status: ${result.status}`);
    checks.push({ name: 'Supabase', status: 'warn' });
  }
}

async function checkRunware() {
  console.log('\n🎨 Checking Runware API...');

  const envFile = require('fs').readFileSync('.env', 'utf-8');
  const runwareUrl = envFile.match(/EXPO_PUBLIC_RUNWARE_API_URL=(.*)/)?.[1];
  const runwareKey = envFile.match(/EXPO_PUBLIC_RUNWARE_API_KEY=(.*)/)?.[1];

  if (!runwareUrl || !runwareKey) {
    console.log('❌ Runware: Configuration missing in .env');
    checks.push({ name: 'Runware API', status: 'error' });
    return;
  }

  console.log('✅ Runware: Configured');
  console.log(`   URL: ${runwareUrl}`);
  checks.push({ name: 'Runware API', status: 'ok' });
}

async function checkFAL() {
  console.log('\n🖼️  Checking FAL.ai...');

  const envFile = require('fs').readFileSync('.env', 'utf-8');
  const falKey = envFile.match(/FAL_KEY=(.*)/)?.[1];

  if (!falKey) {
    console.log('❌ FAL.ai: API Key missing in .env');
    checks.push({ name: 'FAL.ai', status: 'error' });
    return;
  }

  console.log('✅ FAL.ai: Configured');
  checks.push({ name: 'FAL.ai', status: 'ok' });
}

async function runHealthCheck() {
  await checkMetroServer();
  await checkSupabase();
  await checkRunware();
  await checkFAL();

  console.log('\n' + '='.repeat(60));

  const errors = checks.filter(c => c.status === 'error').length;
  const warnings = checks.filter(c => c.status === 'warn').length;
  const success = checks.filter(c => c.status === 'ok').length;

  console.log(`\n📊 Summary: ${success} OK | ${warnings} Warnings | ${errors} Errors\n`);

  if (errors === 0 && warnings === 0) {
    console.log('✅ All systems operational!\n');
    return 0;
  } else if (errors > 0) {
    console.log('❌ Some services need attention.\n');
    console.log('💡 Common fixes:');
    console.log('   - Metro not running: npm start');
    console.log('   - Missing .env variables: Check .env.example');
    console.log('   - API issues: Verify your API keys\n');
    return 1;
  } else {
    console.log('⚠️  Some services have warnings but app should work.\n');
    return 0;
  }
}

runHealthCheck().then(code => {
  process.exit(code);
}).catch(err => {
  console.error('\n❌ Health check failed:', err.message);
  process.exit(1);
});
