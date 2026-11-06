---
description: Plan and execute framework/database/API migrations safely
argument-hint: [migration: react17-to-18|db-schema|api-v1-to-v2]
---

Think hard to plan & start working on this migration:
<tasks>$ARGUMENTS</tasks>

**IMPORTANT**: Activate `backend-development` and `databases` skills if applicable.
**IMPORTANT**: Analyze the list of skills at `.claude/skills/*` and intelligently activate the skills that are needed for the task during the process.
**Ensure token efficiency while maintaining high quality.**

## Workflow:
1. Use `migration-specialist` subagent to handle migration
2. Assess current state and dependencies
3. Design migration strategy (big bang / gradual / parallel)
4. Create migration plan with phases and checkpoints
5. Implement backward compatibility layers
6. Write migration scripts
7. Test extensively (unit, integration, E2E, data integrity)
8. Execute migration with monitoring
9. Validate post-migration state
10. Clean up deprecated code

## Migration Types:
- **Framework upgrade**: React, Next.js, Node.js, Python version upgrades
- **Database schema**: Column additions, renames, type changes, table splits
- **API versioning**: v1 → v2 transitions with backward compatibility
- **Library migration**: Replace one library with another (e.g., moment → date-fns)
- **Architecture migration**: Monolith → microservices, REST → GraphQL

## Zero-Downtime Patterns:
- **Expand-Contract**: Add new, migrate data, remove old
- **Shadow mode**: Run new alongside old, compare results
- **Feature flags**: Gradually roll out new behavior
- **Dual writes**: Write to both old and new systems

## Output Format:
- Migration scope and risk assessment
- Pre-migration checklist
- Step-by-step migration plan with verification points
- Rollback procedure
- Post-migration validation steps
- Success criteria

## Important Notes:
- **ALWAYS REMEMBER to backup before any migration.**
- Test with production-like data volumes
- Have rollback plan ready and tested
- Monitor during and after migration
- Document all changes for team reference
