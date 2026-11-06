---
description: Automatically analyze task and spawn appropriate sub-agents using workflow orchestration
---

# Auto-Orchestrate Command

Automatically analyze the task and spawn appropriate sub-agents using the `auto-orchestrate` workflow.

## How It Works

When you invoke `/auto-orchestrate <your task>`, I will:

1. **Invoke the workflow** with your task description
2. **Workflow automatically analyzes**:
   - Task type (feature, bug fix, refactoring, research, performance, security)
   - Complexity level (simple, moderate, complex)
   - Required agents and execution pattern
3. **Spawn agents in optimal sequence**:
   - Sequential when tasks have dependencies
   - Parallel when tasks are independent
   - Hybrid mix for complex workflows

## Usage

```bash
/auto-orchestrate Implement a new user authentication system with OAuth2
```

```bash
/auto-orchestrate Fix the checkout flow bug
```

```bash
/auto-orchestrate Optimize database queries for the product listing page
```

## What Happens

The workflow will:

1. **Analyze phase**: Detect task patterns and complexity
2. **Plan phase**: Spawn `planner` agent if task is complex (3+ files)
3. **Research phase**: Spawn multiple `researcher` agents in parallel if needed
4. **Implement phase**: Execute implementation
5. **Test phase**: Spawn `tester` agent to verify
6. **Review phase**: Spawn `code-reviewer` agent (and `docs-manager` if needed)

## Agent Selection Logic

**Feature Development**:
- planner → researcher (parallel) → implementation → tester → code-reviewer → docs-manager

**Bug Fix**:
- debugger → implementation → tester → code-reviewer

**Performance Optimization**:
- performance-optimizer → implementation → tester → code-reviewer

**Security Review**:
- security-auditor → implementation → tester → code-reviewer

**Research Task**:
- researcher (parallel) → planner (if action plan needed)

## Complexity Thresholds

**Simple** (single file, < 50 lines):
- Skip planner, direct implementation
- Still run tester and code-reviewer

**Moderate** (2-5 files, 50-200 lines):
- Quick plan with planner
- Spawn tester and code-reviewer

**Complex** (5+ files, 200+ lines, architectural changes):
- Full orchestration with planner and multiple researchers
- Sequential chain: plan → implement → test → review → document

---

**Please describe your task:**
