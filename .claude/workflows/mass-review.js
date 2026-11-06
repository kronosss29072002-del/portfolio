export const meta = {
  name: 'mass-review',
  description: 'Review and enrich all .claude content with parallel agents',
  phases: [
    { title: 'Scan', detail: 'Scan all files and categorize' },
    { title: 'Review', detail: 'Parallel review agents' },
    { title: 'Enrich', detail: 'Enrich content with findings' },
    { title: 'Synthesize', detail: 'Synthesize all findings' }
  ]
}

const task = args.task || 'Review and enrich all content'
const targetCount = args.agentCount || 200

// Phase: Scan - use pre-scanned file list
phase('Scan')
log('Using pre-scanned file list from session context...')

// File list from earlier in conversation
const allFiles = [
  {path: '.claude/agents/auto-orchestrator.md', name: 'auto-orchestrator.md', category: 'agent'},
  {path: '.claude/agents/refactor-cleaner.md', name: 'refactor-cleaner.md', category: 'agent'},
  {path: '.claude/agents/e2e-runner.md', name: 'e2e-runner.md', category: 'agent'},
  {path: '.claude/agents/brainstormer.md', name: 'brainstormer.md', category: 'agent'},
  {path: '.claude/agents/memory-context-manager.md', name: 'memory-context-manager.md', category: 'agent'},
  {path: '.claude/agents/adversarial-reviewer.md', name: 'adversarial-reviewer.md', category: 'agent'},
  {path: '.claude/agents/scout-external.md', name: 'scout-external.md', category: 'agent'},
  {path: '.claude/agents/mcp-manager.md', name: 'mcp-manager.md', category: 'agent'},
  {path: '.claude/agents/data-scientist.md', name: 'data-scientist.md', category: 'agent'},
  {path: '.claude/agents/migration-specialist.md', name: 'migration-specialist.md', category: 'agent'},
  {path: '.claude/agents/debugger.md', name: 'debugger.md', category: 'agent'},
  {path: '.claude/agents/docs-manager.md', name: 'docs-manager.md', category: 'agent'},
  {path: '.claude/agents/copywriter.md', name: 'copywriter.md', category: 'agent'},
  {path: '.claude/agents/build-error-resolver.md', name: 'build-error-resolver.md', category: 'agent'},
  {path: '.claude/agents/planner.md', name: 'planner.md', category: 'agent'},
  {path: '.claude/agents/database-admin.md', name: 'database-admin.md', category: 'agent'},
  {path: '.claude/agents/performance-optimizer.md', name: 'performance-optimizer.md', category: 'agent'},
  {path: '.claude/agents/devops-engineer.md', name: 'devops-engineer.md', category: 'agent'},
  {path: '.claude/agents/git-manager.md', name: 'git-manager.md', category: 'agent'},
  {path: '.claude/agents/security-auditor.md', name: 'security-auditor.md', category: 'agent'},
  {path: '.claude/agents/journal-writer.md', name: 'journal-writer.md', category: 'agent'},
  {path: '.claude/agents/scout.md', name: 'scout.md', category: 'agent'},
  {path: '.claude/agents/tester.md', name: 'tester.md', category: 'agent'},
  {path: '.claude/agents/project-manager.md', name: 'project-manager.md', category: 'agent'},
  {path: '.claude/agents/code-reviewer.md', name: 'code-reviewer.md', category: 'agent'},
  {path: '.claude/agents/researcher.md', name: 'researcher.md', category: 'agent'},
  {path: '.claude/agents/api-designer.md', name: 'api-designer.md', category: 'agent'},
  {path: '.claude/agents/ui-ux-designer.md', name: 'ui-ux-designer.md', category: 'agent'},
  {path: '.claude/workflows/auto-orchestrate.js', name: 'auto-orchestrate.js', category: 'workflow'},
  {path: '.claude/workflows/mass-review.js', name: 'mass-review.js', category: 'workflow'},
  {path: '.claude/workflows/design-review.md', name: 'design-review.md', category: 'workflow'},
  {path: '.claude/workflows/development-rules.md', name: 'development-rules.md', category: 'workflow'},
  {path: '.claude/workflows/primary-workflow.md', name: 'primary-workflow.md', category: 'workflow'},
  {path: '.claude/workflows/documentation-management.md', name: 'documentation-management.md', category: 'workflow'},
  {path: '.claude/workflows/security-review.md', name: 'security-review.md', category: 'workflow'},
  {path: '.claude/workflows/performance-optimization.md', name: 'performance-optimization.md', category: 'workflow'},
  {path: '.claude/workflows/orchestration-protocol.md', name: 'orchestration-protocol.md', category: 'workflow'},
  {path: '.claude/workflows/cicd-integration.md', name: 'cicd-integration.md', category: 'workflow'},
  {path: '.claude/commands/auto-orchestrate.md', name: 'auto-orchestrate.md', category: 'command'},
  {path: '.claude/commands/bootstrap.md', name: 'bootstrap.md', category: 'command'},
  {path: '.claude/commands/debug.md', name: 'debug.md', category: 'command'},
  {path: '.claude/commands/deploy.md', name: 'deploy.md', category: 'command'},
  {path: '.claude/commands/perf.md', name: 'perf.md', category: 'command'},
  {path: '.claude/commands/migrate.md', name: 'migrate.md', category: 'command'},
  {path: '.claude/commands/ask.md', name: 'ask.md', category: 'command'},
  {path: '.claude/commands/security.md', name: 'security.md', category: 'command'},
  {path: '.claude/commands/fix.md', name: 'fix.md', category: 'command'},
  {path: '.claude/commands/cook.md', name: 'cook.md', category: 'command'},
  {path: '.claude/commands/brainstorm.md', name: 'brainstorm.md', category: 'command'},
  {path: '.claude/commands/watzup.md', name: 'watzup.md', category: 'command'},
  {path: '.claude/commands/scout.md', name: 'scout.md', category: 'command'},
  {path: '.claude/commands/release.md', name: 'release.md', category: 'command'},
  {path: '.claude/commands/journal.md', name: 'journal.md', category: 'command'},
  {path: '.claude/commands/plan.md', name: 'plan.md', category: 'command'},
  {path: '.claude/commands/code.md', name: 'code.md', category: 'command'},
  {path: '.claude/commands/test.md', name: 'test.md', category: 'command'},
  {path: '.claude/commands/use-mcp.md', name: 'use-mcp.md', category: 'command'},
  {path: '.claude/hooks/auto-spawn.js', name: 'auto-spawn.js', category: 'hook'},
  {path: '.claude/hooks/send-discord.sh', name: 'send-discord.sh', category: 'hook'},
  {path: '.claude/hooks/auto-format.js', name: 'auto-format.js', category: 'hook'},
  {path: '.claude/hooks/telegram-hook-setup.md', name: 'telegram-hook-setup.md', category: 'hook'},
  {path: '.claude/hooks/discord-hook-setup.md', name: 'discord-hook-setup.md', category: 'hook'},
  {path: '.claude/hooks/session-cleanup.js', name: 'session-cleanup.js', category: 'hook'},
  {path: '.claude/hooks/modularization-hook.js', name: 'modularization-hook.js', category: 'hook'},
  {path: '.claude/hooks/README.md', name: 'README.md', category: 'hook'},
  {path: '.claude/hooks/scout-block.ps1', name: 'scout-block.ps1', category: 'hook'},
  {path: '.claude/hooks/scout-block.sh', name: 'scout-block.sh', category: 'hook'},
  {path: '.claude/hooks/.env.example', name: '.env.example', category: 'hook'},
  {path: '.claude/hooks/telegram_notify.sh', name: 'telegram_notify.sh', category: 'hook'},
  {path: '.claude/hooks/discord_notify.sh', name: 'discord_notify.sh', category: 'hook'},
  {path: '.claude/hooks/scout-block.js', name: 'scout-block.js', category: 'hook'},
  {path: '.claude/hooks/session-init.js', name: 'session-init.js', category: 'hook'},
  {path: '.claude/settings.json', name: 'settings.json', category: 'other'},
  {path: '.claude/memory.json', name: 'memory.json', category: 'other'},
  {path: '.claude/session-context.json', name: 'session-context.json', category: 'other'},
  {path: '.claude/metadata.json', name: 'metadata.json', category: 'other'},
  {path: '.claude/statusline.js', name: 'statusline.js', category: 'other'},
  {path: '.claude/statusline.sh', name: 'statusline.sh', category: 'other'},
  {path: '.claude/statusline.ps1', name: 'statusline.ps1', category: 'other'}
]

log(`Found ${allFiles.length} files in .claude directory`)

if (allFiles.length === 0) {
  log('No files found, aborting')
  return { error: 'No files found' }
}

// Group files by category
const filesByCategory = {}
allFiles.forEach(file => {
  const cat = file.category || 'other'
  if (!filesByCategory[cat]) {
    filesByCategory[cat] = []
  }
  filesByCategory[cat].push(file)
})

const categories = Object.keys(filesByCategory)
log(`Categories: ${categories.join(', ')}`)

// Calculate agents per category
const agentsPerCategory = Math.max(1, Math.floor(targetCount / categories.length))

// Create review tasks - distribute files across agents
const reviewTasks = []

categories.forEach(category => {
  const files = filesByCategory[category]
  const agentCount = Math.min(agentsPerCategory, Math.max(1, Math.floor(files.length / 2)))
  const filesPerAgent = Math.ceil(files.length / agentCount)

  for (let i = 0; i < agentCount; i++) {
    const startIdx = i * filesPerAgent
    const endIdx = Math.min(startIdx + filesPerAgent, files.length)
    const agentFiles = files.slice(startIdx, endIdx)

    if (agentFiles.length > 0) {
      reviewTasks.push({
        category,
        files: agentFiles,
        agentId: `${category}-${i}`
      })
    }
  }
})

log(`Created ${reviewTasks.length} review tasks`)

// Phase: Review - spawn parallel review agents
phase('Review')
log(`Spawning ${reviewTasks.length} review agents...`)

const reviewResults = await parallel(reviewTasks.map(task => () => {
  const fileList = task.files.map(f => f.path).join('\n')
  const prompt = `
You are reviewing ${task.category} files in the .claude directory.

Files to review:
${fileList}

Your tasks:
1. Read each file thoroughly using Read tool
2. Analyze content quality, completeness, and effectiveness
3. Identify gaps, missing information, or areas for improvement
4. Suggest enrichments (additional details, examples, best practices)
5. Rate each file 1-10 on: clarity, completeness, usefulness

Return a JSON array with structured report for each file:
[
  {
    "file_path": "...",
    "summary": "what it does",
    "quality_score": 1-10,
    "strengths": ["what's good"],
    "gaps": ["what's missing"],
    "enrichments": ["specific suggestions to improve"],
    "priority": "high|medium|low"
  }
]

Be thorough and critical. Focus on actionable improvements.
`

  return agent(prompt, {
    label: `review:${task.agentId}`,
    phase: 'Review',
    agentType: 'researcher'
  })
}))

const validResults = reviewResults.filter(Boolean)
log(`Received ${validResults.length}/${reviewTasks.length} review results`)

// Parse and collect all reviews
const allReviews = []
validResults.forEach(result => {
  try {
    if (typeof result === 'string') {
      const parsed = JSON.parse(result)
      if (Array.isArray(parsed)) {
        allReviews.push(...parsed)
      } else {
        allReviews.push(parsed)
      }
    } else if (result && typeof result === 'object') {
      if (Array.isArray(result.reviews)) {
        allReviews.push(...result.reviews)
      } else {
        allReviews.push(result)
      }
    }
  } catch (e) {
    log(`Failed to parse review result: ${e.message}`)
  }
})

log(`Collected ${allReviews.length} file reviews`)

// Phase: Enrich - spawn agents to implement enrichments
phase('Enrich')

// Filter high-priority enrichments
const highPriorityReviews = allReviews.filter(r => r.priority === 'high' && r.enrichments && r.enrichments.length > 0)

log(`Found ${highPriorityReviews.length} high-priority enrichment opportunities`)

if (highPriorityReviews.length > 0) {
  log(`Spawning ${highPriorityReviews.length} enrichment agents...`)

  const enrichmentResults = await parallel(highPriorityReviews.map(review => () => {
    const prompt = `
You are enriching content based on review findings.

File: ${review.file_path}
Current summary: ${review.summary}
Gaps identified: ${review.gaps.join(', ')}
Enrichments to apply:
${review.enrichments.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Your tasks:
1. Read the current file using Read tool
2. Apply the suggested enrichments using Edit tool
3. Add missing information, examples, or details
4. Improve clarity and completeness
5. Ensure consistency with similar files

Make the file more valuable and useful. Focus on high-impact improvements.
Do NOT break existing functionality - only enhance content.
`

    return agent(prompt, {
      label: `enrich:${review.file_path.split('/').pop()}`,
      phase: 'Enrich',
      agentType: 'general-purpose'
    })
  }))

  const completedEnrichments = enrichmentResults.filter(Boolean).length
  log(`Completed ${completedEnrichments} enrichments`)
} else {
  log('No high-priority enrichments, skipping enrichment phase')
}

// Phase: Synthesize
phase('Synthesize')
log('Synthesizing findings...')

const synthesisPrompt = `
You are synthesizing findings from a mass review of the .claude directory.

Review statistics:
- Files scanned: ${allFiles.length}
- Review agents: ${reviewTasks.length}
- Reviews completed: ${allReviews.length}
- High-priority enrichments: ${highPriorityReviews.length}

Categories reviewed: ${categories.join(', ')}

Sample reviews:
${JSON.stringify(allReviews.slice(0, 10), null, 2)}

Create a comprehensive summary:
1. Overall quality assessment (average scores by category)
2. Top strengths across all files
3. Common gaps and weaknesses
4. Key enrichments applied
5. Recommendations for future improvements
6. Files that need the most attention

Be concise but thorough. Focus on actionable insights.
`

const synthesis = await agent(synthesisPrompt, {
  label: 'synthesis',
  phase: 'Synthesize',
  agentType: 'researcher'
})

log('Mass review and enrichment complete')

return {
  task,
  files_scanned: allFiles.length,
  review_agents: reviewTasks.length,
  reviews_completed: allReviews.length,
  enrichments_applied: highPriorityReviews.length,
  categories_reviewed: categories,
  synthesis
}
