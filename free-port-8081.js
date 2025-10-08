#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

console.log('\n🔓 Free Port 8081 Tool\n');

function checkPort() {
  try {
    if (process.platform === 'win32') {
      const output = execSync('netstat -ano | findstr :8081', { encoding: 'utf-8' });
      if (output.trim()) {
        const lines = output.trim().split('\n');
        const pids = new Set();

        lines.forEach(line => {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        });

        return Array.from(pids);
      }
      return [];
    } else {
      const output = execSync('lsof -i :8081 -t', { encoding: 'utf-8' });
      if (output.trim()) {
        return output.trim().split('\n').filter(pid => pid);
      }
      return [];
    }
  } catch (error) {
    return [];
  }
}

function getProcessInfo(pid) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, { encoding: 'utf-8' });
      const parts = output.split(',');
      return parts[0] ? parts[0].replace(/"/g, '') : 'Unknown';
    } else {
      const output = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf-8' });
      return output.trim();
    }
  } catch (error) {
    return 'Unknown';
  }
}

function killProcess(pid) {
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    return true;
  } catch (error) {
    return false;
  }
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

async function main() {
  const pids = checkPort();

  if (pids.length === 0) {
    console.log('✅ Port 8081 is already free!\n');
    console.log('You can now run: npm start\n');
    return;
  }

  console.log(`⚠️  Port 8081 is being used by ${pids.length} process(es):\n`);

  pids.forEach(pid => {
    const processName = getProcessInfo(pid);
    console.log(`   PID ${pid} - ${processName}`);
  });

  console.log('\n');

  const answer = await askQuestion('Do you want to kill these process(es)? (y/n): ');

  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n🔨 Killing processes...\n');

    let success = 0;
    let failed = 0;

    pids.forEach(pid => {
      const processName = getProcessInfo(pid);
      if (killProcess(pid)) {
        console.log(`✅ Killed PID ${pid} (${processName})`);
        success++;
      } else {
        console.log(`❌ Failed to kill PID ${pid} (${processName})`);
        failed++;
      }
    });

    console.log(`\n📊 Result: ${success} killed, ${failed} failed\n`);

    const remainingPids = checkPort();
    if (remainingPids.length === 0) {
      console.log('✅ Port 8081 is now free!\n');
      console.log('You can now run: npm start\n');
    } else {
      console.log('⚠️  Some processes could not be killed.\n');
      console.log('Try running this script with administrator/sudo privileges:\n');
      if (process.platform === 'win32') {
        console.log('   Run as Administrator\n');
      } else {
        console.log('   sudo node free-port-8081.js\n');
      }
    }
  } else {
    console.log('\n❌ Operation cancelled.\n');
    console.log('Port 8081 is still in use. You can:');
    console.log('1. Manually kill the process(es)');
    console.log('2. Use a different port');
    console.log('3. Stop the application using port 8081\n');
  }
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
