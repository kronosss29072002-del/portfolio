#!/usr/bin/env node

/**
 * Session cleanup hook
 * Runs at the end of each Claude Code session
 * Saves context, cleans up resources, updates memory
 */

const fs = require('fs');
const path = require('path');

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const claudeDir = path.join(projectDir, '.claude');

// Save session context for next session
const contextFile = path.join(claudeDir, 'session-context.json');
const sessionData = {
  lastSession: {
    endedAt: new Date().toISOString(),
    duration: process.env.CLAUDE_SESSION_DURATION || 'unknown'
  },
  projectInfo: {
    name: path.basename(projectDir),
    path: projectDir
  }
};

try {
  fs.writeFileSync(contextFile, JSON.stringify(sessionData, null, 2));
} catch (e) {
  // Failed to save context, continue
}

// Update memory file with session end
const memoryFile = path.join(claudeDir, 'memory.json');
if (fs.existsSync(memoryFile)) {
  try {
    const memory = JSON.parse(fs.readFileSync(memoryFile, 'utf8'));

    // Add session record
    if (!memory.sessions) {
      memory.sessions = [];
    }

    memory.sessions.push({
      startedAt: process.env.CLAUDE_SESSION_START || new Date().toISOString(),
      endedAt: new Date().toISOString(),
      status: 'completed'
    });

    // Keep only last 10 sessions
    if (memory.sessions.length > 10) {
      memory.sessions = memory.sessions.slice(-10);
    }

    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
  } catch (e) {
    // Failed to update memory, continue
  }
}

// Clean up temporary files
const tempDir = path.join(claudeDir, 'temp');
if (fs.existsSync(tempDir)) {
  try {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
      }
    });
  } catch (e) {
    // Cleanup failed, continue
  }
}

console.log(JSON.stringify({
  status: 'cleanup_complete',
  timestamp: new Date().toISOString()
}));
