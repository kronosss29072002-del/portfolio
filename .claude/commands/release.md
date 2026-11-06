---
description: Automate release process with versioning, changelog, and tagging
argument-hint: [version: major|minor|patch|auto]
---

Think hard to plan & start working on this release:
<tasks>$ARGUMENTS</tasks>

**IMPORTANT**: Activate `git-manager` and `docs-manager` subagents.
**IMPORTANT**: Analyze the list of skills at `.claude/skills/*` and intelligently activate the skills that are needed for the task during the process.
**Ensure token efficiency while maintaining high quality.**

## Workflow:
1. Determine version bump type (major/minor/patch) based on changes
2. Run full test suite to ensure stability
3. Generate changelog from commit history (conventional commits)
4. Update version in package.json / pyproject.toml / etc.
5. Commit version bump changes
6. Create git tag (vX.Y.Z)
7. Build release artifacts
8. Create GitHub Release with changelog
9. Publish to package registry (npm, PyPI, etc.) if applicable
10. Notify team of successful release

## Version Bump Rules (Semantic Versioning):
- **MAJOR**: Breaking changes, incompatible API changes
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, backward compatible

## Changelog Format:
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature description

### Changed
- Changed behavior description

### Fixed
- Bug fix description

### Removed
- Removed feature description
```

## Pre-Release Checklist:
- [ ] All tests passing
- [ ] No unresolved TODOs for this release
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in all relevant files
- [ ] Git tag created
- [ ] Release notes written

## Important Notes:
- **ALWAYS REMEMBER to follow semantic versioning strictly.**
- Never release without running full test suite
- Include migration guide for breaking changes
- Tag releases with annotated tags (git tag -a)
- Keep changelog user-friendly, not just commit messages
