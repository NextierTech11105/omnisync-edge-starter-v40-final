#!/usr/bin/env node

/**
 * RERP Remove Protection Script
 * Removes real estate repository protection configurations (emergency use only)
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

class RERPProtectionRemover {
  constructor() {
    this.removed = [];
    this.errors = [];
    this.notFound = [];
    this.confirmationRequired = false;
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  }

  async promptConfirmation() {
    // For non-interactive environments, check for --force flag
    const args = process.argv.slice(2);
    if (args.includes('--force')) {
      this.log('warn', '⚠️  FORCE flag detected - skipping confirmation');
      return true;
    }

    // In interactive environments, we'd prompt the user
    // For now, require --force for safety
    this.log('error', '🚫 SAFETY CHECK: This operation will remove all RERP protections');
    this.log('error', '🚫 This should only be used in emergency situations');
    this.log('error', '🚫 To proceed, add --force flag: node scripts/remove-protection.mjs --force');
    return false;
  }

  removeProtectionFiles() {
    const protectionDir = join(ROOT_DIR, '.realestate', 'protection');
    const protectionFiles = [
      'branch-protect.json',
      'repo-protect.json'
      // Note: keeping deal-protect.json as it contains deal-specific protections
    ];

    this.log('info', '🗑️  Removing protection configuration files...');

    for (const filename of protectionFiles) {
      const filePath = join(protectionDir, filename);
      
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
          this.log('warn', `🗑️  Removed protection file: ${filename}`);
          this.removed.push(`Removed ${filename}`);
        } catch (error) {
          this.log('error', `❌ Failed to remove ${filename}: ${error.message}`);
          this.errors.push(`Failed to remove ${filename}: ${error.message}`);
        }
      } else {
        this.log('info', `ℹ️  Protection file not found: ${filename}`);
        this.notFound.push(`${filename} not found`);
      }
    }
  }

  removeGitHooks() {
    const hooksDir = join(ROOT_DIR, '.git', 'hooks');
    const preCommitPath = join(hooksDir, 'pre-commit');

    this.log('info', '🪝 Removing RERP git hooks...');

    if (existsSync(preCommitPath)) {
      try {
        // Check if it's our RERP hook before removing
        const hookContent = readFileSync(preCommitPath, 'utf8');
        if (hookContent.includes('RERP compliance check')) {
          unlinkSync(preCommitPath);
          this.log('warn', '🗑️  Removed RERP pre-commit hook');
          this.removed.push('Removed pre-commit hook');
        } else {
          this.log('info', 'ℹ️  Pre-commit hook exists but is not RERP-managed, skipping');
          this.notFound.push('Non-RERP pre-commit hook found, skipped');
        }
      } catch (error) {
        this.log('error', `❌ Failed to remove pre-commit hook: ${error.message}`);
        this.errors.push(`Failed to remove pre-commit hook: ${error.message}`);
      }
    } else {
      this.log('info', 'ℹ️  No pre-commit hook found');
      this.notFound.push('Pre-commit hook not found');
    }
  }

  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = join(ROOT_DIR, '.realestate', 'backups', `protection-backup-${timestamp}`);

    this.log('info', '💾 Creating protection backup...');

    try {
      const protectionDir = join(ROOT_DIR, '.realestate', 'protection');
      if (existsSync(protectionDir)) {
        execSync(`mkdir -p "${backupDir}"`);
        execSync(`cp -r "${protectionDir}"/* "${backupDir}/" 2>/dev/null || true`);
        this.log('info', `💾 Protection backup created: ${backupDir}`);
        this.removed.push(`Created backup in ${backupDir}`);
      }
    } catch (error) {
      this.log('warn', `⚠️  Failed to create backup: ${error.message}`);
      this.errors.push(`Failed to create backup: ${error.message}`);
    }
  }

  disableWorkflows() {
    const workflowsDir = join(ROOT_DIR, '.github', 'workflows');
    const rerpWorkflows = [
      'rerp-compliance.yml',
      'rerp-financial-audit.yml'
    ];

    this.log('info', '⚙️  Disabling RERP workflows...');

    for (const workflow of rerpWorkflows) {
      const workflowPath = join(workflowsDir, workflow);
      const disabledPath = join(workflowsDir, `${workflow}.disabled`);

      if (existsSync(workflowPath)) {
        try {
          execSync(`mv "${workflowPath}" "${disabledPath}"`);
          this.log('warn', `⚙️  Disabled workflow: ${workflow}`);
          this.removed.push(`Disabled workflow ${workflow}`);
        } catch (error) {
          this.log('error', `❌ Failed to disable workflow ${workflow}: ${error.message}`);
          this.errors.push(`Failed to disable workflow ${workflow}: ${error.message}`);
        }
      } else {
        this.log('info', `ℹ️  Workflow not found: ${workflow}`);
        this.notFound.push(`Workflow ${workflow} not found`);
      }
    }
  }

  updateMakefile() {
    const makefilePath = join(ROOT_DIR, 'Makefile');
    
    if (!existsSync(makefilePath)) {
      this.log('info', 'ℹ️  Makefile not found, skipping RERP target removal');
      return;
    }

    try {
      let makefileContent = readFileSync(makefilePath, 'utf8');
      const originalContent = makefileContent;

      // Comment out RERP targets instead of removing them completely
      const rerpTargets = ['rerp-audit', 'rerp-apply', 'rerp-remove'];
      
      for (const target of rerpTargets) {
        const targetRegex = new RegExp(`^(${target}:.*)$`, 'gm');
        makefileContent = makefileContent.replace(targetRegex, '# DISABLED: $1');
      }

      if (makefileContent !== originalContent) {
        writeFileSync(makefilePath, makefileContent);
        this.log('warn', '🔨 Disabled RERP targets in Makefile');
        this.removed.push('Disabled RERP Makefile targets');
      } else {
        this.log('info', 'ℹ️  No RERP targets found in Makefile');
        this.notFound.push('No RERP Makefile targets found');
      }
    } catch (error) {
      this.log('error', `❌ Failed to update Makefile: ${error.message}`);
      this.errors.push(`Failed to update Makefile: ${error.message}`);
    }
  }

  async removeAllProtections() {
    this.log('warn', '🚨 EMERGENCY RERP PROTECTION REMOVAL');
    this.log('warn', '===================================');

    // Safety confirmation
    const confirmed = await this.promptConfirmation();
    if (!confirmed) {
      this.log('error', '🚫 Operation cancelled - confirmation required');
      process.exit(1);
    }

    // Create backup first
    this.createBackup();

    // Remove components
    this.removeProtectionFiles();
    this.removeGitHooks();
    this.disableWorkflows();
    this.updateMakefile();

    // Generate report
    this.generateReport();
  }

  generateReport() {
    this.log('info', '\n📊 RERP PROTECTION REMOVAL REPORT');
    this.log('info', '=================================');
    this.log('info', `🗑️  Removed: ${this.removed.length}`);
    this.log('info', `ℹ️  Not Found: ${this.notFound.length}`);
    this.log('info', `❌ Errors: ${this.errors.length}`);

    if (this.removed.length > 0) {
      this.log('info', '\n🗑️  REMOVED:');
      this.removed.forEach(item => this.log('info', `  - ${item}`));
    }

    if (this.notFound.length > 0) {
      this.log('info', '\nℹ️  NOT FOUND:');
      this.notFound.forEach(item => this.log('info', `  - ${item}`));
    }

    if (this.errors.length > 0) {
      this.log('info', '\n❌ ERRORS:');
      this.errors.forEach(error => this.log('info', `  - ${error}`));
    }

    this.log('warn', '\n⚠️  IMPORTANT NOTES:');
    this.log('warn', '  - Repository protections have been removed');
    this.log('warn', '  - Manual GitHub settings may need to be updated');
    this.log('warn', '  - To restore protections, run `make rerp-apply`');
    this.log('warn', '  - Review security implications of this action');

    if (this.errors.length > 0) {
      this.log('error', '\n🚫 PROTECTION REMOVAL COMPLETED WITH ERRORS');
      process.exit(1);
    } else {
      this.log('warn', '\n✅ PROTECTION REMOVAL COMPLETED');
      this.log('warn', '⚠️  SECURITY WARNING: Repository is no longer protected by RERP');
      process.exit(0);
    }
  }
}

// Run protection removal if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const remover = new RERPProtectionRemover();
  remover.removeAllProtections().catch(error => {
    console.error('Protection removal failed:', error);
    process.exit(1);
  });
}

export default RERPProtectionRemover;