#!/usr/bin/env node

/**
 * RERP Apply Protection Script
 * Applies real estate repository protection configurations
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Protection configurations
const PROTECTION_CONFIGS = {
  'branch-protect.json': {
    "required_status_checks": {
      "strict": true,
      "contexts": ["RERP / compliance-audit", "RERP / financial-audit", "CI"]
    },
    "enforce_admins": true,
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_last_push_approval": true,
    "require_conversation_resolution": true,
    "block_force_pushes": true,
    "require_linear_history": true,
    "restrictions": {
      "users": [],
      "teams": [],
      "apps": []
    }
  },
  'repo-protect.json': {
    "allow_squash_merge": true,
    "allow_merge_commit": false,
    "allow_rebase_merge": true,
    "delete_branch_on_merge": true,
    "has_vulnerability_alerts": true,
    "security_and_analysis": {
      "secret_scanning": { "status": "enabled" },
      "secret_scanning_push_protection": { "status": "enabled" },
      "dependency_graph": { "status": "enabled" },
      "dependabot_security_updates": { "status": "enabled" }
    },
    "private": false,
    "archived": false,
    "disabled": false
  }
};

class RERPProtectionApplier {
  constructor() {
    this.applied = [];
    this.errors = [];
    this.skipped = [];
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
  }

  ensureDirectoryExists(dirPath) {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      this.log('info', `📁 Created directory: ${dirPath}`);
    }
  }

  createProtectionFile(filename, config) {
    const protectionDir = join(ROOT_DIR, '.realestate', 'protection');
    this.ensureDirectoryExists(protectionDir);
    
    const filePath = join(protectionDir, filename);
    
    try {
      // Check if file already exists
      if (existsSync(filePath)) {
        const existingContent = readFileSync(filePath, 'utf8');
        const existingConfig = JSON.parse(existingContent);
        
        // Merge configurations instead of overwriting
        const mergedConfig = { ...existingConfig, ...config };
        writeFileSync(filePath, JSON.stringify(mergedConfig, null, 2) + '\n');
        this.log('info', `🔄 Updated protection config: ${filename}`);
        this.applied.push(`Updated ${filename}`);
      } else {
        writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n');
        this.log('info', `✅ Created protection config: ${filename}`);
        this.applied.push(`Created ${filename}`);
      }
    } catch (error) {
      this.log('error', `❌ Failed to create ${filename}: ${error.message}`);
      this.errors.push(`Failed to create ${filename}: ${error.message}`);
    }
  }

  createDocumentationPlaceholders() {
    const docsDir = join(ROOT_DIR, 'docs');
    this.ensureDirectoryExists(docsDir);

    const docs = {
      'RERP_COMPLIANCE.md': `# RERP Compliance Guide

## Overview
This document outlines the Real Estate Repository Protection (RERP) compliance requirements and implementation guidelines.

## Compliance Requirements

### Branch Protection
- Require status checks before merging
- Require branches to be up to date before merging
- Require review from code owners
- Dismiss stale reviews when new commits are pushed
- Require signed commits

### Repository Security
- Enable vulnerability alerts
- Enable secret scanning
- Enable dependency security updates
- Configure security advisories

### Audit Requirements
- Regular compliance audits using \`make rerp-audit\`
- Financial audit workflows for transaction validation
- Protection configuration reviews

## Implementation

Run the following commands to apply RERP protections:

\`\`\`bash
make rerp-apply    # Apply all protections
make rerp-audit    # Run compliance audit
make rerp-remove   # Remove protections (emergency only)
\`\`\`

## Monitoring

Monitor compliance status through:
- GitHub Actions workflows
- Regular audit reports
- Protection status checks

## Support

For RERP compliance support, contact the repository maintainers.
`,
      'RERP_FINANCIAL_AUDIT.md': `# RERP Financial Audit Documentation

## Overview
Financial audit procedures for real estate repository protection compliance.

## Audit Procedures

### Transaction Validation
- Review all financial transactions in commits
- Validate real estate deal documentation
- Ensure compliance with regulatory requirements

### Automated Checks
- Pre-commit hooks for financial data validation
- CI/CD pipeline financial audit steps
- Post-merge financial compliance verification

### Manual Review Process
- Quarterly financial audit reviews
- Deal-specific compliance checks
- Regulatory compliance verification

## Audit Trail

All financial audits are logged and tracked through:
- GitHub Actions audit workflows
- Compliance reporting dashboard
- Audit trail documentation

## Compliance Reporting

Generate compliance reports using:
\`\`\`bash
node scripts/realestate-audit.mjs --financial-report
\`\`\`

## Emergency Procedures

In case of compliance violations:
1. Immediately run \`make rerp-remove\` to disable protections
2. Contact compliance team
3. Perform manual audit review
4. Re-apply protections after resolution
`,
      'RERP_PROTECTION_GUIDE.md': `# RERP Protection Implementation Guide

## Quick Start

1. **Apply protections**: \`make rerp-apply\`
2. **Run audit**: \`make rerp-audit\`
3. **Verify compliance**: Check GitHub branch protection settings

## Protection Components

### Branch Protection Rules
- \`.realestate/protection/branch-protect.json\`
- Required status checks for compliance and financial audits
- Mandatory code reviews
- Linear history requirements

### Repository Settings
- \`.realestate/protection/repo-protect.json\`
- Security scanning enabled
- Vulnerability alerts
- Dependency monitoring

### Deal Protection
- \`.realestate/protection/deal-protect.json\`
- Real estate transaction safeguards
- Financial compliance rules

## Management Commands

### Apply Protection
\`\`\`bash
make rerp-apply
# or
node scripts/apply-protection.mjs
\`\`\`

### Remove Protection (Emergency Only)
\`\`\`bash
make rerp-remove
# or  
node scripts/remove-protection.mjs
\`\`\`

### Audit Compliance
\`\`\`bash
make rerp-audit
# or
node scripts/realestate-audit.mjs
\`\`\`

## Troubleshooting

### Common Issues
1. **Permission denied**: Ensure admin access to repository
2. **API rate limits**: Wait and retry after cooldown
3. **Merge conflicts**: Resolve manually before applying protections

### Support
- Check GitHub repository settings
- Review audit logs
- Contact repository administrators
`
    };

    for (const [filename, content] of Object.entries(docs)) {
      const filePath = join(docsDir, filename);
      
      if (!existsSync(filePath)) {
        try {
          writeFileSync(filePath, content);
          this.log('info', `📚 Created documentation: ${filename}`);
          this.applied.push(`Created docs/${filename}`);
        } catch (error) {
          this.log('error', `❌ Failed to create ${filename}: ${error.message}`);
          this.errors.push(`Failed to create docs/${filename}: ${error.message}`);
        }
      } else {
        this.log('info', `📚 Documentation already exists: ${filename}`);
        this.skipped.push(`docs/${filename} already exists`);
      }
    }
  }

  applyGitHooks() {
    const hooksDir = join(ROOT_DIR, '.git', 'hooks');
    
    if (!existsSync(hooksDir)) {
      this.log('warn', '⚠️  Git hooks directory not found, skipping hook installation');
      return;
    }

    const preCommitHook = `#!/bin/sh
# RERP Pre-commit Hook
echo "🔍 Running RERP compliance check..."
node scripts/realestate-audit.mjs --pre-commit
if [ $? -ne 0 ]; then
  echo "❌ RERP compliance check failed"
  exit 1
fi
echo "✅ RERP compliance check passed"
`;

    const preCommitPath = join(hooksDir, 'pre-commit');
    
    try {
      writeFileSync(preCommitPath, preCommitHook);
      execSync(`chmod +x "${preCommitPath}"`);
      this.log('info', '🪝 Installed RERP pre-commit hook');
      this.applied.push('Installed pre-commit hook');
    } catch (error) {
      this.log('warn', `⚠️  Failed to install pre-commit hook: ${error.message}`);
      this.errors.push(`Failed to install pre-commit hook: ${error.message}`);
    }
  }

  async applyAllProtections() {
    this.log('info', '🛡️  Starting RERP protection application...');

    // Create protection configuration files
    this.log('info', '📋 Creating protection configurations...');
    for (const [filename, config] of Object.entries(PROTECTION_CONFIGS)) {
      this.createProtectionFile(filename, config);
    }

    // Create documentation
    this.log('info', '📚 Creating documentation placeholders...');
    this.createDocumentationPlaceholders();

    // Apply git hooks
    this.log('info', '🪝 Applying git hooks...');
    this.applyGitHooks();

    // Generate summary report
    this.generateReport();
  }

  generateReport() {
    this.log('info', '\n📊 RERP PROTECTION APPLICATION REPORT');
    this.log('info', '====================================');
    this.log('info', `✅ Applied: ${this.applied.length}`);
    this.log('info', `⚠️  Skipped: ${this.skipped.length}`);
    this.log('info', `❌ Errors: ${this.errors.length}`);

    if (this.applied.length > 0) {
      this.log('info', '\n✅ APPLIED:');
      this.applied.forEach(item => this.log('info', `  - ${item}`));
    }

    if (this.skipped.length > 0) {
      this.log('info', '\n⚠️  SKIPPED:');
      this.skipped.forEach(item => this.log('info', `  - ${item}`));
    }

    if (this.errors.length > 0) {
      this.log('info', '\n❌ ERRORS:');
      this.errors.forEach(error => this.log('info', `  - ${error}`));
    }

    if (this.errors.length > 0) {
      this.log('error', '\n🚫 PROTECTION APPLICATION FAILED');
      process.exit(1);
    } else {
      this.log('info', '\n✅ PROTECTION APPLICATION COMPLETED SUCCESSFULLY');
      this.log('info', '\n📋 Next steps:');
      this.log('info', '  1. Run `make rerp-audit` to verify compliance');
      this.log('info', '  2. Review GitHub repository settings');
      this.log('info', '  3. Configure GitHub Actions secrets if needed');
      process.exit(0);
    }
  }
}

// Run protection application if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const applier = new RERPProtectionApplier();
  applier.applyAllProtections().catch(error => {
    console.error('Protection application failed:', error);
    process.exit(1);
  });
}

export default RERPProtectionApplier;