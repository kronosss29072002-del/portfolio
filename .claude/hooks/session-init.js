#!/usr/bin/env node

/**
 * Session initialization hook
 * Runs at the start of each Claude Code session
 * Sets up environment, loads context, initializes resources
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const claudeDir = path.join(projectDir, '.claude');

// Ensure .claude directory exists
if (!fs.existsSync(claudeDir)) {
  fs.mkdirSync(claudeDir, { recursive: true });
}

// Initialize memory file if it doesn't exist
const memoryFile = path.join(claudeDir, 'memory.json');
if (!fs.existsSync(memoryFile)) {
  fs.writeFileSync(memoryFile, JSON.stringify({
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    sessions: [],
    context: {}
  }, null, 2));
}

// Load session context if available
const contextFile = path.join(claudeDir, 'session-context.json');
if (fs.existsSync(contextFile)) {
  try {
    const context = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
    // Output context for Claude to read
    console.log(JSON.stringify({
      status: 'initialized',
      previousSession: context.lastSession || null,
      projectInfo: context.projectInfo || {}
    }));
  } catch (e) {
    // Invalid context file, ignore
  }
}

// Set environment variables for the session
const envVars = {
  CLAUDE_SESSION_START: new Date().toISOString(),
  CLAUDE_PROJECT_DIR: projectDir
};

// Output environment setup
console.log(JSON.stringify({
  status: 'ready',
  env: envVars,
  timestamp: new Date().toISOString()
}));
