#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🔍 Diagnostic de l\'environnement Genly App\n');
console.log('='.repeat(60));

const checks = [];

function addCheck(name, status, message, fix = null) {
  checks.push({ name, status, message, fix });
  const icon = status === 'ok' ? '✅' : status === 'warn' ? '⚠️' : '❌';
  console.log(`${icon} ${name}: ${message}`);
  if (fix) {
    console.log(`   💡 Fix: ${fix}`);
  }
}

try {
  const nodeVersion = execSync('node -v', { encoding: 'utf-8' }).trim();
  const nodeMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);

  if (nodeMajor >= 20) {
    const nodeMinor = parseInt(nodeVersion.replace('v', '').split('.')[1]);
    if (nodeMajor === 20 && nodeMinor >= 19) {
      addCheck('Node.js Version', 'ok', `${nodeVersion} (>= 20.19.4)`);
    } else if (nodeMajor > 20) {
      addCheck('Node.js Version', 'ok', `${nodeVersion} (>= 20.19.4)`);
    } else {
      addCheck('Node.js Version', 'error', `${nodeVersion} (requis: >= 20.19.4)`, 'nvm use 20.19.4 ou installez Node.js 20.19.4+');
    }
  } else {
    addCheck('Node.js Version', 'error', `${nodeVersion} (requis: >= 20.19.4)`, 'nvm use 20.19.4 ou installez Node.js 20.19.4+');
  }
} catch (error) {
  addCheck('Node.js Version', 'error', 'Node.js non détecté', 'Installez Node.js >= 20.19.4');
}

try {
  const npmVersion = execSync('npm -v', { encoding: 'utf-8' }).trim();
  const npmMajor = parseInt(npmVersion.split('.')[0]);

  if (npmMajor >= 10) {
    addCheck('npm Version', 'ok', `${npmVersion} (>= 10.0.0)`);
  } else {
    addCheck('npm Version', 'warn', `${npmVersion} (recommandé: >= 10.0.0)`, 'npm install -g npm@latest');
  }
} catch (error) {
  addCheck('npm Version', 'error', 'npm non détecté', 'Installez npm');
}

if (fs.existsSync('.nvmrc')) {
  addCheck('.nvmrc', 'ok', 'Fichier présent (Node 20.19.4)');
} else {
  addCheck('.nvmrc', 'warn', 'Fichier manquant', 'Créé automatiquement avec Node 20.19.4');
}

if (fs.existsSync('.npmrc')) {
  const npmrcContent = fs.readFileSync('.npmrc', 'utf-8');
  if (npmrcContent.includes('legacy-peer-deps')) {
    addCheck('.npmrc', 'ok', 'Configuration legacy-peer-deps active');
  } else {
    addCheck('.npmrc', 'warn', 'legacy-peer-deps manquant', 'Ajoutez "legacy-peer-deps=true" dans .npmrc');
  }
} else {
  addCheck('.npmrc', 'error', 'Fichier manquant', 'Créez un fichier .npmrc avec "legacy-peer-deps=true"');
}

if (fs.existsSync('metro.config.js')) {
  const metroContent = fs.readFileSync('metro.config.js', 'utf-8');
  if (metroContent.includes('withNativeWind')) {
    addCheck('Metro Config', 'ok', 'NativeWind configuré');
  } else {
    addCheck('Metro Config', 'warn', 'NativeWind non configuré', 'Vérifiez metro.config.js');
  }
} else {
  addCheck('Metro Config', 'error', 'metro.config.js manquant', 'Créez metro.config.js avec NativeWind');
}

if (fs.existsSync('global.css')) {
  addCheck('global.css', 'ok', 'Fichier CSS Tailwind présent');
} else {
  addCheck('global.css', 'error', 'global.css manquant', 'Créez global.css avec les directives Tailwind');
}

if (fs.existsSync('app/_layout.tsx')) {
  const layoutContent = fs.readFileSync('app/_layout.tsx', 'utf-8');
  if (layoutContent.includes('global.css')) {
    addCheck('CSS Import', 'ok', 'global.css importé dans _layout.tsx');
  } else {
    addCheck('CSS Import', 'error', 'global.css non importé', 'Ajoutez "import \'../global.css\'" en haut de app/_layout.tsx');
  }
} else {
  addCheck('CSS Import', 'warn', 'app/_layout.tsx introuvable');
}

if (fs.existsSync('node_modules')) {
  addCheck('Dependencies', 'ok', 'node_modules présent');
} else {
  addCheck('Dependencies', 'error', 'node_modules manquant', 'Lancez "npm install"');
}

try {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    const portCheck = execSync('lsof -i :8081 2>/dev/null || echo "FREE"', { encoding: 'utf-8' });
    if (portCheck.includes('FREE') || portCheck.trim() === '') {
      addCheck('Port 8081', 'ok', 'Port libre');
    } else {
      const lines = portCheck.trim().split('\n');
      if (lines.length > 1) {
        const processLine = lines[1];
        const parts = processLine.split(/\s+/);
        const pid = parts[1];
        addCheck('Port 8081', 'error', `Port occupé par PID ${pid}`, `kill -9 ${pid}`);
      } else {
        addCheck('Port 8081', 'warn', 'Port potentiellement occupé', 'lsof -i :8081 puis kill -9 [PID]');
      }
    }
  } else {
    addCheck('Port 8081', 'warn', 'Vérification non disponible sur Windows', 'Utilisez: netstat -ano | findstr :8081');
  }
} catch (error) {
  addCheck('Port 8081', 'warn', 'Impossible de vérifier', 'Vérifiez manuellement avec lsof -i :8081');
}

console.log('='.repeat(60));

const errors = checks.filter(c => c.status === 'error').length;
const warnings = checks.filter(c => c.status === 'warn').length;
const success = checks.filter(c => c.status === 'ok').length;

console.log(`\n📊 Résumé: ${success} OK | ${warnings} Avertissements | ${errors} Erreurs\n`);

if (errors > 0) {
  console.log('❌ Votre environnement nécessite des corrections avant de démarrer.\n');
  console.log('📖 Consultez TROUBLESHOOTING.md pour plus de détails.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Votre environnement fonctionne mais peut être optimisé.\n');
  console.log('📖 Consultez TROUBLESHOOTING.md pour les optimisations recommandées.\n');
  process.exit(0);
} else {
  console.log('✅ Votre environnement est correctement configuré!\n');
  console.log('🚀 Vous pouvez lancer: npm start\n');
  process.exit(0);
}
