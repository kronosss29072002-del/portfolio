---
description: Run comprehensive security audit on the codebase
argument-hint: [scope: full|auth|api|deps]
---

Think hard to plan & start working on this security audit:
<tasks>$ARGUMENTS</tasks>

**IMPORTANT**: Activate `security-and-hardening` skills.
**IMPORTANT**: Analyze the list of skills at `.claude/skills/*` and intelligently activate the skills that are needed for the task during the process.
**Ensure token efficiency while maintaining high quality.**

## Workflow:
1. Use `security-auditor` subagent to conduct comprehensive security audit
2. Scope the audit based on user input (full codebase, auth system, API endpoints, or dependencies)
3. Check for OWASP Top 10 vulnerabilities
4. Scan dependencies for known CVEs
5. Review authentication and authorization patterns
6. Check for hardcoded secrets and sensitive data
7. Review input validation and sanitization
8. Assess cryptographic implementations
9. Generate prioritized security report with remediation steps
10. Report findings to user with severity ratings

## Output Format:
- Executive summary with overall risk level
- Findings categorized by severity (Critical/High/Medium/Low)
- Specific file:line locations for each issue
- Remediation recommendations with code examples
- Compliance notes (if applicable)

## Important Notes:
- **ALWAYS REMEMBER that security is critical - don't skip edge cases.**
- Verify findings with proof of concept when possible
- Prioritize by impact and exploitability
- Include both automated scan results and manual review findings
- Provide actionable remediation steps, not just problem descriptions
