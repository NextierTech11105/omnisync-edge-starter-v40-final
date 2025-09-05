# RERP Protection Implementation Guide

## Quick Start

1. **Apply protections**: `make rerp-apply`
2. **Run audit**: `make rerp-audit`
3. **Verify compliance**: Check GitHub branch protection settings

## Protection Components

### Branch Protection Rules
- `.realestate/protection/branch-protect.json`
- Required status checks for compliance and financial audits
- Mandatory code reviews
- Linear history requirements

### Repository Settings
- `.realestate/protection/repo-protect.json`
- Security scanning enabled
- Vulnerability alerts
- Dependency monitoring

### Deal Protection
- `.realestate/protection/deal-protect.json`
- Real estate transaction safeguards
- Financial compliance rules

## Management Commands

### Apply Protection
```bash
make rerp-apply
# or
node scripts/apply-protection.mjs
```

### Remove Protection (Emergency Only)
```bash
make rerp-remove
# or  
node scripts/remove-protection.mjs
```

### Audit Compliance
```bash
make rerp-audit
# or
node scripts/realestate-audit.mjs
```

## Troubleshooting

### Common Issues
1. **Permission denied**: Ensure admin access to repository
2. **API rate limits**: Wait and retry after cooldown
3. **Merge conflicts**: Resolve manually before applying protections

### Support
- Check GitHub repository settings
- Review audit logs
- Contact repository administrators
