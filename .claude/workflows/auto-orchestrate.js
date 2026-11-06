export const meta = {
  name: 'auto-orchestrate',
  description: 'Automatically analyze task and spawn appropriate sub-agents in optimal sequence',
  phases: [
    { title: 'Analyze', detail: 'Analyze task type and complexity' },
    { title: 'Plan', detail: 'Create implementation plan if needed' },
    { title: 'Research', detail: 'Research relevant topics in parallel' },
    { title: 'Implement', detail: 'Implement the solution' },
    { title: 'Test', detail: 'Run tests and verify' },
    { title: 'Review', detail: 'Review code quality' }
  ]
}

// Task analysis patterns
const TASK_PATTERNS = {
  feature: /\b(implement|create|add|build|develop|feature)\b/i,
  bug: /\b(fix|bug|issue|error|broken|debug)\b/i,
  refactor: /\b(refactor|restructure|clean|improve|optimize)\b/i,
  research: /\b(research|investigate|analyze|study|explore)\b/i,
  performance: /\b(performance|optimize|slow|bottleneck|speed)\b/i,
  security: /\b(security|vulnerability|audit|threat|protect)\b/i,
  docs: /\b(document|docs|readme|guide|documentation)\b/i
}

// Analyze task to determine type and complexity
phase('Analyze')
const task = args.task || ''
const detectedTypes = []

for (const [type, pattern] of Object.entries(TASK_PATTERNS)) {
  if (pattern.test(task)) {
    detectedTypes.push(type)
  }
}

// Determine complexity based on keywords
const isComplex = /\b(complex|multi-file|architecture|system|database|api|integration)\b/i.test(task)
const isSimple = /\b(simple|quick|small|minor|typo|single)\b/i.test(task)

// Estimate file count from task description
const estimatedFiles = isComplex ? 5 : isSimple ? 1 : 3

log(`Task analysis: types=${detectedTypes.join(',')}, complexity=${isComplex ? 'complex' : isSimple ? 'simple' : 'moderate'}, files=${estimatedFiles}`)

// Determine agent sequence based on task type
let sequence = []

if (detectedTypes.includes('feature') || detectedTypes.includes('bug') || detectedTypes.includes('refactor')) {
  // Standard development flow
  if (!isSimple && estimatedFiles >= 3) {
    sequence.push({ type: 'planner', phase: 'Plan', reason: 'Complex task needs planning' })
  }

  if (detectedTypes.includes('research') || isComplex) {
    sequence.push({ type: 'researcher', phase: 'Research', reason: 'Research needed', parallel: true })
  }

  sequence.push({ type: 'implementation', phase: 'Implement', reason: 'Implement solution' })
  sequence.push({ type: 'tester', phase: 'Test', reason: 'Verify implementation' })
  sequence.push({ type: 'code-reviewer', phase: 'Review', reason: 'Review code quality' })

  if (detectedTypes.includes('docs') || isComplex) {
    sequence.push({ type: 'docs-manager', phase: 'Review', reason: 'Update documentation', parallel: true })
  }
}

if (detectedTypes.includes('performance')) {
  sequence.push({ type: 'performance-optimizer', phase: 'Analyze', reason: 'Analyze performance bottlenecks' })
  sequence.push({ type: 'implementation', phase: 'Implement', reason: 'Apply optimizations' })
  sequence.push({ type: 'tester', phase: 'Test', reason: 'Verify improvements' })
  sequence.push({ type: 'code-reviewer', phase: 'Review', reason: 'Review changes' })
}

if (detectedTypes.includes('security')) {
  sequence.push({ type: 'security-auditor', phase: 'Analyze', reason: 'Audit security' })
  sequence.push({ type: 'implementation', phase: 'Implement', reason: 'Fix security issues' })
  sequence.push({ type: 'tester', phase: 'Test', reason: 'Verify fixes' })
  sequence.push({ type: 'code-reviewer', phase: 'Review', reason: 'Review security changes' })
}

if (detectedTypes.includes('research') && !detectedTypes.includes('feature')) {
  // Pure research task
  sequence.push({ type: 'researcher', phase: 'Research', reason: 'Research topic', parallel: true })
  if (isComplex) {
    sequence.push({ type: 'planner', phase: 'Plan', reason: 'Create action plan from research' })
  }
}

// Default fallback
if (sequence.length === 0) {
  sequence.push({ type: 'planner', phase: 'Plan', reason: 'Analyze task' })
  sequence.push({ type: 'implementation', phase: 'Implement', reason: 'Implement solution' })
  sequence.push({ type: 'tester', phase: 'Test', reason: 'Verify' })
  sequence.push({ type: 'code-reviewer', phase: 'Review', reason: 'Review' })
}

log(`Orchestration plan: ${sequence.length} agents in ${sequence.filter(s => s.parallel).length > 0 ? 'hybrid' : 'sequential'} pattern`)

// Execute orchestration
const results = []
let context = { task, analysis: { types: detectedTypes, complexity: isComplex ? 'complex' : 'moderate', files: estimatedFiles } }

// Group agents by phase for parallel execution
const phases = {}
for (const step of sequence) {
  if (!phases[step.phase]) {
    phases[step.phase] = []
  }
  phases[step.phase].push(step)
}

// Execute each phase
for (const [phaseName, steps] of Object.entries(phases)) {
  phase(phaseName)

  if (steps.length > 1 && steps.some(s => s.parallel)) {
    // Parallel execution for this phase
    const parallelSteps = steps.filter(s => s.parallel)
    const sequentialSteps = steps.filter(s => !s.parallel)

    // Run parallel agents
    if (parallelSteps.length > 0) {
      const parallelResults = await parallel(parallelSteps.map(step => () =>
        agent(`${step.reason}\n\nTask: ${task}\n\nContext: ${JSON.stringify(context)}`, {
          label: step.type,
          phase: phaseName,
          agentType: step.type === 'implementation' ? 'general-purpose' : step.type
        })
      ))
      results.push(...parallelResults.filter(Boolean))
    }

    // Run sequential agents
    for (const step of sequentialSteps) {
      const result = await agent(`${step.reason}\n\nTask: ${task}\n\nContext: ${JSON.stringify(context)}`, {
        label: step.type,
        phase: phaseName,
        agentType: step.type === 'implementation' ? 'general-purpose' : step.type
      })
      if (result) {
        results.push(result)
        context[step.type] = result
      }
    }
  } else {
    // Sequential execution
    for (const step of steps) {
      const result = await agent(`${step.reason}\n\nTask: ${task}\n\nContext: ${JSON.stringify(context)}`, {
        label: step.type,
        phase: phaseName,
        agentType: step.type === 'implementation' ? 'general-purpose' : step.type
      })
      if (result) {
        results.push(result)
        context[step.type] = result
      }
    }
  }
}

log(`Orchestration complete: ${results.length} agents executed`)

return {
  task,
  analysis: context.analysis,
  agents_spawned: sequence.map(s => s.type),
  results: results.filter(Boolean),
  summary: `Executed ${results.length} agents in ${Object.keys(phases).length} phases`
}
