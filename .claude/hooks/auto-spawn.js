#!/usr/bin/env node

/**
 * Auto-spawn hook - analyzes tasks and suggests agent spawning
 * Runs before tool use to detect when auto-orchestration is needed
 */

const fs = require('fs');
const path = require('path');

// Read input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name;
    const toolInput = data.tool_input || {};

    // Only analyze for Agent tool calls
    if (toolName !== 'Agent') {
      process.exit(0);
    }

    const prompt = toolInput.prompt || '';
    const subagentType = toolInput.subagent_type || '';

    // Detect task patterns
    const patterns = {
      planning: /\b(plan|design|architect|strategy)\b/i,
      research: /\b(research|investigate|analyze|study)\b/i,
      implementation: /\b(implement|create|build|develop|add feature)\b/i,
      debugging: /\b(debug|fix|bug|issue|error|broken)\b/i,
      testing: /\b(test|verify|validate|check)\b/i,
      review: /\b(review|audit|inspect|examine)\b/i,
      documentation: /\b(document|docs|readme|guide)\b/i,
      performance: /\b(optimize|performance|slow|bottleneck)\b/i,
      security: /\b(security|vulnerability|audit|threat)\b/i
    };

    const detected = [];
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(prompt)) {
        detected.push(type);
      }
    }

    // Determine if auto-orchestration is suggested
    const shouldOrchestrate = detected.length >= 2 ||
                             /\b(complex|multi-file|architecture|system)\b/i.test(prompt);

    if (shouldOrchestrate && !subagentType.includes('orchestrator')) {
      // Output suggestion for Claude to see
      console.log(JSON.stringify({
        suggestion: 'auto-orchestrate',
        detected_patterns: detected,
        recommended_agent: 'auto-orchestrator',
        message: `Detected complex task with patterns: ${detected.join(', ')}. Consider using auto-orchestrator agent for intelligent multi-agent coordination.`
      }));
    }

  } catch (error) {
    // Silent failure
    process.exit(0);
  }
});
