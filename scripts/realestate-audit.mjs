#!/usr/bin/env node

/**
 * RERP Real Estate Audit Script
 * Validates repository compliance with real estate protection standards
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// RERP Compliance Requirements
const REQUIRED_PROTECTION_FILES = [
  '.realestate/protection/deal-protect.json',
  '.realestate/protection/branch-protect.json',
  '.realestate/protection/repo-protect.json'
];

const REQUIRED_WORKFLOWS = [
  '.github/workflows/ci.yml',
  '.github/workflows/rerp-compliance.yml',
  '.github/workflows/rerp-financial-audit.yml'
];

const REQUIRED_DOCS = [
  'docs/RERP_COMPLIANCE.md',
  'docs/RERP_FINANCIAL_AUDIT.md',
  'docs/RERP_PROTECTION_GUIDE.md'
];

class RERPAuditor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    
    if (level === 'error') {
      this.errors.push(message);
    } else if (level === 'warn') {
      this.warnings.push(message);
    } else {
      this.passed.push(message);
    }
  }

  checkFileExists(filePath) {
    const fullPath = join(ROOT_DIR, filePath);
    const exists = existsSync(fullPath);
    
    if (exists) {
      this.log('info', `✅ Required file exists: ${filePath}`);
      return true;
    } else {
      this.log('error', `❌ Missing required file: ${filePath}`);
      return false;
    }
  }

  validateProtectionConfig(filePath) {
    try {
      const fullPath = join(ROOT_DIR, filePath);
      if (!existsSync(fullPath)) {
        return false;
      }

      const content = readFileSync(fullPath, 'utf8');
      const config = JSON.parse(content);

      // Different validation based on file type
      if (filePath.includes('branch-protect.json') || filePath.includes('deal-protect.json')) {
        // Branch/deal protection needs status checks and admin enforcement
        if (config.required_status_checks && config.enforce_admins !== undefined) {
          this.log('info', `✅ Protection config valid: ${filePath}`);
          return true;
        } else {
          this.log('warn', `⚠️  Protection config incomplete: ${filePath}`);
          return false;
        }
      } else if (filePath.includes('repo-protect.json')) {
        // Repository protection needs security settings
        if (config.security_and_analysis && config.has_vulnerability_alerts !== undefined) {
          this.log('info', `✅ Protection config valid: ${filePath}`);
          return true;
        } else {
          this.log('warn', `⚠️  Repository protection config incomplete: ${filePath}`);
          return false;
        }
      } else {
        // Generic validation for other protection files
        this.log('info', `✅ Protection config exists: ${filePath}`);
        return true;
      }
    } catch (error) {
      this.log('error', `❌ Invalid JSON in protection config: ${filePath} - ${error.message}`);
      return false;
    }
  }

  async runCompleteAudit() {
    this.log('info', '🔍 Starting RERP Real Estate Audit...');
    
    // Check protection files
    this.log('info', '📋 Checking protection configurations...');
    for (const file of REQUIRED_PROTECTION_FILES) {
      this.checkFileExists(file);
      this.validateProtectionConfig(file);
    }

    // Check workflows
    this.log('info', '⚙️  Checking GitHub workflows...');
    for (const workflow of REQUIRED_WORKFLOWS) {
      this.checkFileExists(workflow);
    }

    // Check documentation
    this.log('info', '📚 Checking documentation...');
    for (const doc of REQUIRED_DOCS) {
      this.checkFileExists(doc);
    }

    // Check Makefile targets
    this.log('info', '🔨 Checking Makefile RERP targets...');
    this.checkMakefileTargets();

    // Generate report
    this.generateReport();
  }

  checkMakefileTargets() {
    const makefilePath = join(ROOT_DIR, 'Makefile');
    if (!existsSync(makefilePath)) {
      this.log('error', '❌ Makefile not found');
      return;
    }

    const makefileContent = readFileSync(makefilePath, 'utf8');
    const requiredTargets = ['rerp-audit', 'rerp-apply', 'rerp-remove'];
    
    for (const target of requiredTargets) {
      if (makefileContent.includes(`${target}:`)) {
        this.log('info', `✅ Makefile target exists: ${target}`);
      } else {
        this.log('warn', `⚠️  Missing Makefile target: ${target}`);
      }
    }
  }

  generateReport() {
    this.log('info', '\n📊 RERP AUDIT REPORT');
    this.log('info', '==================');
    this.log('info', `✅ Passed: ${this.passed.length}`);
    this.log('info', `⚠️  Warnings: ${this.warnings.length}`);
    this.log('info', `❌ Errors: ${this.errors.length}`);

    if (this.errors.length > 0) {
      this.log('info', '\n🚨 CRITICAL ISSUES:');
      this.errors.forEach(error => this.log('info', `  - ${error}`));
    }

    if (this.warnings.length > 0) {
      this.log('info', '\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => this.log('info', `  - ${warning}`));
    }

    const complianceScore = Math.round(
      (this.passed.length / (this.passed.length + this.warnings.length + this.errors.length)) * 100
    );

    this.log('info', `\n📈 COMPLIANCE SCORE: ${complianceScore}%`);

    if (this.errors.length > 0) {
      this.log('error', '🚫 AUDIT FAILED - Critical issues must be resolved');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('warn', '⚠️  AUDIT PASSED WITH WARNINGS');
      process.exit(0);
    } else {
      this.log('info', '✅ AUDIT PASSED - Full RERP compliance');
      process.exit(0);
    }
  }
}

// Run audit if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const auditor = new RERPAuditor();
  auditor.runCompleteAudit().catch(error => {
    console.error('Audit failed:', error);
    process.exit(1);
  });
}

export default RERPAuditor;