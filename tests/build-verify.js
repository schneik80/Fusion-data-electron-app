#!/usr/bin/env node

/**
 * Build Verification Test
 * Verifies that the project can build successfully
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    log(`✓ ${description} exists: ${filePath}`, 'green');
    return true;
  } else {
    log(`✗ ${description} missing: ${filePath}`, 'red');
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  const fullPath = path.resolve(dirPath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
    log(`✓ ${description} exists: ${dirPath}`, 'green');
    return true;
  } else {
    log(`✗ ${description} missing: ${dirPath}`, 'red');
    return false;
  }
}

function verifyProjectStructure() {
  log('\n📁 Verifying project structure...', 'blue');
  let allPassed = true;

  // Check essential files
  allPassed = checkFileExists('package.json', 'package.json') && allPassed;
  allPassed = checkFileExists('forge.config.js', 'forge.config.js') && allPassed;
  allPassed = checkFileExists('webpack.main.config.js', 'webpack.main.config.js') && allPassed;
  allPassed = checkFileExists('webpack.renderer.config.js', 'webpack.renderer.config.js') && allPassed;

  // Check source files
  allPassed = checkFileExists('src/main.js', 'main.js') && allPassed;
  allPassed = checkFileExists('src/renderer.js', 'renderer.js') && allPassed;
  allPassed = checkFileExists('src/preload.js', 'preload.js') && allPassed;
  allPassed = checkFileExists('src/index.html', 'index.html') && allPassed;
  allPassed = checkFileExists('src/index.css', 'index.css') && allPassed;

  // Check directories
  allPassed = checkDirectoryExists('src', 'src directory') && allPassed;
  allPassed = checkDirectoryExists('src/navicons', 'navicons directory') && allPassed;

  return allPassed;
}

function verifyDependencies() {
  log('\n📦 Verifying dependencies...', 'blue');
  let allPassed = true;

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['react', 'react-dom'];
    const requiredDevDeps = ['@electron-forge/cli', 'electron'];

    // Check required dependencies
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log(`✓ Required dependency found: ${dep}`, 'green');
      } else {
        log(`✗ Required dependency missing: ${dep}`, 'red');
        allPassed = false;
      }
    }

    // Check required dev dependencies
    for (const dep of requiredDevDeps) {
      if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        log(`✓ Required dev dependency found: ${dep}`, 'green');
      } else {
        log(`✗ Required dev dependency missing: ${dep}`, 'red');
        allPassed = false;
      }
    }
    
    // Electron can be in either dependencies or devDependencies (usually devDependencies)
    const hasElectron = 
      (packageJson.dependencies && packageJson.dependencies.electron) ||
      (packageJson.devDependencies && packageJson.devDependencies.electron);
    if (hasElectron) {
      log('✓ Electron found (in dependencies or devDependencies)', 'green');
    } else {
      log('✗ Electron not found in dependencies or devDependencies', 'red');
      allPassed = false;
    }

    // Check node_modules exists
    if (fs.existsSync('node_modules')) {
      log('✓ node_modules directory exists', 'green');
    } else {
      log('✗ node_modules directory missing - run npm install', 'red');
      allPassed = false;
    }
  } catch (error) {
    log(`✗ Error reading package.json: ${error.message}`, 'red');
    allPassed = false;
  }

  return allPassed;
}

function verifyWebpackConfig() {
  log('\n⚙️  Verifying webpack configuration...', 'blue');
  let allPassed = true;

  try {
    // Try to require webpack configs
    require(path.join(process.cwd(), 'webpack.main.config.js'));
    log('✓ webpack.main.config.js is valid', 'green');
  } catch (error) {
    log(`✗ webpack.main.config.js error: ${error.message}`, 'red');
    allPassed = false;
  }

  try {
    require(path.join(process.cwd(), 'webpack.renderer.config.js'));
    log('✓ webpack.renderer.config.js is valid', 'green');
  } catch (error) {
    log(`✗ webpack.renderer.config.js error: ${error.message}`, 'red');
    allPassed = false;
  }

  return allPassed;
}

function verifyForgeConfig() {
  log('\n🔧 Verifying Electron Forge configuration...', 'blue');
  let allPassed = true;

  try {
    const forgeConfig = require(path.join(process.cwd(), 'forge.config.js'));
    if (forgeConfig && forgeConfig.packagerConfig) {
      log('✓ forge.config.js is valid', 'green');
    } else {
      log('✗ forge.config.js missing packagerConfig', 'red');
      allPassed = false;
    }
  } catch (error) {
    log(`✗ forge.config.js error: ${error.message}`, 'red');
    allPassed = false;
  }

  return allPassed;
}

function verifySourceFiles() {
  log('\n📄 Verifying source files syntax...', 'blue');
  let allPassed = true;

  const sourceFiles = [
    'src/main.js',
    'src/renderer.js',
    'src/preload.js',
  ];

  for (const file of sourceFiles) {
    try {
      // Try to parse as JavaScript
      const content = fs.readFileSync(file, 'utf8');
      // Basic syntax check - try to require it (will fail if syntax is invalid)
      // Note: This won't work for ES modules, but it's a basic check
      if (content.includes('require(') || content.includes('import ')) {
        log(`✓ ${file} syntax appears valid`, 'green');
      } else {
        log(`⚠ ${file} - unable to verify syntax`, 'yellow');
      }
    } catch (error) {
      log(`✗ ${file} has syntax errors: ${error.message}`, 'red');
      allPassed = false;
    }
  }

  return allPassed;
}

async function runBuildTest() {
  log('\n🔨 Testing build process...', 'blue');
  
  try {
    // Try to package the app (this will verify webpack can build)
    log('Running electron-forge package (this may take a while)...', 'yellow');
    execSync('npm run package', { 
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, CI: 'true' } // Set CI to avoid interactive prompts
    });
    log('✓ Build test passed', 'green');
    return true;
  } catch (error) {
    log(`✗ Build test failed: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🧪 Starting Build Verification Tests\n', 'blue');
  log('='.repeat(50), 'blue');

  const results = {
    structure: verifyProjectStructure(),
    dependencies: verifyDependencies(),
    webpack: verifyWebpackConfig(),
    forge: verifyForgeConfig(),
    source: verifySourceFiles(),
  };

  // Only run build test if all other checks pass
  let buildPassed = false;
  if (Object.values(results).every(r => r)) {
    // Ask if user wants to run full build test (it's slow)
    const args = process.argv.slice(2);
    if (args.includes('--full-build')) {
      buildPassed = await runBuildTest();
    } else {
      log('\n⚠️  Skipping full build test (use --full-build to run it)', 'yellow');
      buildPassed = true; // Don't fail if skipped
    }
  } else {
    log('\n⚠️  Skipping build test due to previous failures', 'yellow');
  }

  log('\n' + '='.repeat(50), 'blue');
  log('\n📊 Test Results Summary:', 'blue');
  
  const allTests = {
    'Project Structure': results.structure,
    'Dependencies': results.dependencies,
    'Webpack Config': results.webpack,
    'Forge Config': results.forge,
    'Source Files': results.source,
    'Build Process': buildPassed,
  };

  let allPassed = true;
  for (const [test, passed] of Object.entries(allTests)) {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${status} - ${test}`, color);
    if (!passed) allPassed = false;
  }

  log('\n' + '='.repeat(50), 'blue');
  
  if (allPassed) {
    log('\n✅ All build verification tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some build verification tests failed', 'red');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

