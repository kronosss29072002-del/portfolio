---
description: Deploy application to specified environment
argument-hint: [environment: staging|production]
---

Think hard to plan & start working on this deployment:
<tasks>$ARGUMENTS</tasks>

**IMPORTANT**: Activate `devops` and `ci-cd-and-automation` skills.
**IMPORTANT**: Analyze the list of skills at `.claude/skills/*` and intelligently activate the skills that are needed for the task during the process.
**Ensure token efficiency while maintaining high quality.**

## Workflow:
1. Use `devops-engineer` subagent to handle deployment
2. Determine deployment target (staging/production)
3. Run pre-deployment checks (tests, linting, security scan)
4. Build application artifacts
5. Deploy using appropriate strategy (blue-green, canary, rolling)
6. Run post-deployment health checks
7. Monitor for errors and performance issues
8. Report deployment status to user

## Pre-Deployment Checklist:
- [ ] All tests passing
- [ ] Linting checks passed
- [ ] Security scan completed
- [ ] Database migrations ready (if applicable)
- [ ] Environment variables configured
- [ ] Rollback plan prepared

## Deployment Strategies:
- **Staging**: Direct deployment for testing
- **Production**: Blue-green or canary deployment with monitoring

## Important Notes:
- **ALWAYS REMEMBER to verify deployment with health checks.**
- Monitor error rates and performance metrics after deployment
- Have rollback procedure ready
- Document deployment in changelog
- Notify team of successful deployment
