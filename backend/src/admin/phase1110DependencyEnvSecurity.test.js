import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '../../');

console.log('=================================================================');
console.log('  INTERVIEWIQ AI - PHASE 11.10 DEPENDENCY & ENV SECURITY TEST');
console.log('=================================================================\n');

async function runPhase1110DependencyEnvSecurityTests() {
  let passedCount = 0;
  let failedCount = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      passedCount++;
      console.log(`[PASS] ${testName}`);
    } else {
      failedCount++;
      console.error(`[FAIL] ${testName} - ${detail}`);
    }
  };

  try {
    // =========================================================================
    // 1. GITIGNORE SECURITY CHECK
    // =========================================================================

    const gitignorePath = path.join(rootDir, '.gitignore');
    const gitignoreContent = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';

    assert(
      gitignoreContent.includes('.env') && gitignoreContent.includes('node_modules/'),
      '1.1 .gitignore properly includes .env and node_modules/ entries to prevent secret commits'
    );

    // =========================================================================
    // 2. ENV EXAMPLE PLACEHOLDER AUDIT
    // =========================================================================

    const envExamplePath = path.join(rootDir, '.env.example');
    const envExampleContent = fs.existsSync(envExamplePath) ? fs.readFileSync(envExamplePath, 'utf8') : '';

    const hasRealSecrets =
      envExampleContent.includes('AIzaSy') || // Typical Google Gemini Key prefix
      envExampleContent.includes('mongodb+srv://') ||
      envExampleContent.includes('CLOUDINARY_API_SECRET=1234567890');

    assert(
      !hasRealSecrets && envExampleContent.includes('GEMINI_API_KEY') && envExampleContent.includes('JWT_SECRET'),
      '2.1 .env.example contains structured environment variable keys with safe placeholder values only'
    );

    // =========================================================================
    // 3. PACKAGE DEPENDENCY SECURITY AUDIT
    // =========================================================================

    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const requiredSecPackages = ['helmet', 'cors', 'express-mongo-sanitize', 'hpp', 'express-rate-limit'];
    const installed = Object.keys(packageJson.dependencies || {});

    const allSecInstalled = requiredSecPackages.every((pkg) => installed.includes(pkg));

    assert(
      allSecInstalled,
      '3.1 Core security packages (helmet, cors, express-mongo-sanitize, hpp, express-rate-limit) are declared in package.json'
    );

  } catch (err) {
    assert(false, 'Unexpected execution exception in Phase 11.10 Dependency Security Suite', err.stack);
  }

  console.log('\n=================================================================');
  console.log(` SUMMARY: Passed ${passedCount} / ${passedCount + failedCount} Tests`);
  console.log('=================================================================\n');

  return { passedCount, failedCount };
}

runPhase1110DependencyEnvSecurityTests();
