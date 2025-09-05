# RERP Compliance Guide

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
- Regular compliance audits using `make rerp-audit`
- Financial audit workflows for transaction validation
- Protection configuration reviews

## Implementation

Run the following commands to apply RERP protections:

```bash
make rerp-apply    # Apply all protections
make rerp-audit    # Run compliance audit
make rerp-remove   # Remove protections (emergency only)
```

## Monitoring

Monitor compliance status through:
- GitHub Actions workflows
- Regular audit reports
- Protection status checks

## Support

For RERP compliance support, contact the repository maintainers.
