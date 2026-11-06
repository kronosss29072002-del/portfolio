---
description: Analyze and optimize application performance
argument-hint: [target: frontend|backend|database|bundle]
---

Think hard to plan & start working on this performance optimization:
<tasks>$ARGUMENTS</tasks>

**IMPORTANT**: Activate `performance-optimization` and `observability-and-instrumentation` skills.
**IMPORTANT**: Analyze the list of skills at `.claude/skills/*` and intelligently activate the skills that are needed for the task during the process.
**Ensure token efficiency while maintaining high quality.**

## Workflow:
1. Use `performance-optimizer` subagent to analyze performance
2. Identify performance target (frontend, backend, database, or bundle size)
3. Measure baseline metrics
4. Profile to identify bottlenecks
5. Implement optimizations
6. Measure improvements
7. Set up monitoring to prevent regressions
8. Report results with before/after metrics

## Optimization Areas:

### Frontend
- Bundle size analysis and reduction
- Code splitting and lazy loading
- Image optimization
- Critical rendering path
- React/component re-render optimization

### Backend
- API response time optimization
- Database query optimization
- Caching strategies
- Connection pooling
- Async operation optimization

### Database
- Query optimization with EXPLAIN ANALYZE
- Index strategy review
- N+1 query prevention
- Connection pool tuning
- Materialized views for complex queries

### Bundle Size
- Tree shaking and dead code elimination
- Dependency analysis
- Code splitting strategies
- Asset optimization

## Output Format:
- Baseline metrics table
- Bottlenecks identified with impact ratings
- Optimizations applied with expected improvements
- Before/after metrics comparison
- Monitoring setup recommendations

## Important Notes:
- **ALWAYS REMEMBER to measure before and after every optimization.**
- Focus on optimizations with highest impact first
- Don't sacrifice correctness for performance
- Set up monitoring to catch future regressions
- Document performance budgets
