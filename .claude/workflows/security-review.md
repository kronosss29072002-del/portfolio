# Security Review Workflow

## Purpose
Systematic security review process to identify vulnerabilities, assess risks, and ensure secure coding practices before deployment.

## When to Use
- Before deploying to production
- After implementing authentication/authorization
- When adding new API endpoints
- After dependency updates
- During code reviews for security-critical code
- Quarterly security audits

## Workflow Steps

### Phase 1: Scope Definition
1. **Identify Systems in Scope**
   - Which components are being reviewed?
   - What data flows through these components?
   - What are the trust boundaries?

2. **Determine Review Depth**
   - Quick scan (automated tools only)
   - Standard review (automated + manual)
   - Deep audit (comprehensive manual review + penetration testing)

3. **Delegate to security-auditor agent**
   - Provide scope and depth requirements
   - Include context about recent changes

### Phase 2: Automated Scanning
1. **Dependency Vulnerability Scan**
   ```bash
   npm audit
   # or
   pip audit
   # or
   snyk test
   ```

2. **Static Analysis**
   ```bash
   # ESLint with security plugins
   npx eslint --plugin security .
   
   # Semgrep for custom rules
   semgrep --config=auto .
   ```

3. **Secret Detection**
   ```bash
   # Check for hardcoded secrets
   git grep -i "password\|secret\|api_key" -- '*.js' '*.ts' '*.py'
   
   # Use trufflehog for git history
   trufflehog git --since-date=2024-01-01 .
   ```

4. **Report Automated Findings**
   - List all vulnerabilities found
   - Categorize by severity (Critical/High/Medium/Low)
   - Note which are false positives

### Phase 3: Manual Code Review
1. **Authentication Review**
   - [ ] Password storage uses bcrypt/Argon2 (cost 12+)
   - [ ] Session management is secure (HTTPOnly, Secure, SameSite)
   - [ ] MFA implemented where required
   - [ ] Password reset flow is secure
   - [ ] Account lockout after failed attempts

2. **Authorization Review**
   - [ ] Every endpoint has authorization checks
   - [ ] RBAC/ABAC properly implemented
   - [ ] No privilege escalation vectors
   - [ ] IDOR vulnerabilities checked
   - [ ] Deny by default, whitelist allowed actions

3. **Input Validation Review**
   - [ ] All user inputs validated server-side
   - [ ] SQL queries use parameterized statements
   - [ ] HTML output is escaped (prevent XSS)
   - [ ] File uploads validated (type, size, content)
   - [ ] API rate limiting implemented

4. **Cryptographic Review**
   - [ ] Strong algorithms used (AES-256, RSA-2048+)
   - [ ] No hardcoded secrets/keys
   - [ ] Proper key management and rotation
   - [ ] TLS 1.3 for all communications
   - [ ] Secure random number generation

5. **Configuration Review**
   - [ ] Debug mode disabled in production
   - [ ] Verbose errors disabled
   - [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
   - [ ] CORS properly configured
   - [ ] Unused features/ports disabled

6. **Logging and Monitoring Review**
   - [ ] Security events logged (auth, access control)
   - [ ] Logs don't contain sensitive data
   - [ ] Real-time alerting configured
   - [ ] Log integrity protected

### Phase 4: Threat Modeling
1. **Identify Assets**
   - What data needs protection?
   - What are the most valuable assets?

2. **Identify Threats** (STRIDE)
   - **S**poofing - Can attackers impersonate users?
   - **T**ampering - Can data be modified?
   - **R**epudiation - Can actions be denied?
   - **I**nformation Disclosure - Can data leak?
   - **D**enial of Service - Can service be disrupted?
   - **E**levation of Privilege - Can users gain unauthorized access?

3. **Assess Risk**
   - Likelihood (Low/Medium/High)
   - Impact (Low/Medium/High/Critical)
   - Risk = Likelihood × Impact

4. **Define Mitigations**
   - For each high-risk threat, define mitigation strategy
   - Prioritize by risk score

### Phase 5: Remediation Planning
1. **Prioritize Findings**
   - Critical: Fix immediately (block deployment)
   - High: Fix before next release
   - Medium: Fix within 30 days
   - Low: Fix within 90 days

2. **Create Remediation Tasks**
   - Each finding becomes a task
   - Include specific fix recommendations
   - Estimate effort for each fix

3. **Assign Owners**
   - Assign each task to a developer
   - Set deadlines based on severity

### Phase 6: Verification
1. **Re-scan After Fixes**
   - Run automated scans again
   - Verify all Critical/High issues resolved

2. **Manual Verification**
   - Review code changes for each fix
   - Test fixes don't break functionality
   - Verify fixes address root cause

3. **Update Documentation**
   - Update security policy if needed
   - Document any accepted risks
   - Update threat model

### Phase 7: Reporting
1. **Generate Security Report**
   ```markdown
   # Security Review Report
   
   ## Executive Summary
   - Overall risk level: [Low/Medium/High/Critical]
   - Total findings: X (Critical: X, High: X, Medium: X, Low: X)
   - Deployment recommendation: [Approve/Block/Conditional]
   
   ## Findings Summary
   [Table of findings with severity, status, owner]
   
   ## Remediation Status
   [Progress on fixing findings]
   
   ## Recommendations
   [Long-term security improvements]
   ```

2. **Communicate Results**
   - Share report with development team
   - Present to management if Critical/High findings
   - Update security dashboard

## Quality Gates

### Must Pass Before Deployment
- [ ] No Critical vulnerabilities
- [ ] No High vulnerabilities (or accepted risk with mitigation plan)
- [ ] All automated scans passing
- [ ] Security report generated and reviewed
- [ ] Remediation tasks created and assigned

## Tools and Resources

### Automated Tools
- **npm audit / pip audit** - Dependency vulnerabilities
- **Snyk** - Continuous dependency monitoring
- **ESLint security plugins** - Static analysis
- **Semgrep** - Custom security rules
- **Trufflehog** - Secret detection
- **OWASP ZAP** - Dynamic analysis
- **Burp Suite** - API testing

### Manual Review Checklists
- OWASP Top 10 checklist
- Authentication checklist
- Authorization checklist
- Input validation checklist
- Cryptographic checklist

## Integration with Other Workflows

- **Primary Workflow**: Security review is Phase 2.5 (after testing, before integration)
- **CI/CD Integration**: Automated security scans in pipeline
- **Code Review**: Security considerations in PR reviews
- **Incident Response**: Security findings feed into incident tracking

## Metrics and KPIs

- Time to fix Critical vulnerabilities: < 24 hours
- Time to fix High vulnerabilities: < 7 days
- Security scan coverage: 100% of codebase
- False positive rate: < 10%
- Security incidents post-deployment: Track trend

## Continuous Improvement

- Review security incidents monthly
- Update checklists based on new threats
- Train team on common vulnerabilities
- Conduct security workshops quarterly
