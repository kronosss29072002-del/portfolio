#!/usr/bin/env node

/**
 * PostToolUse hook: Suggest modularization when files exceed LOC threshold
 * Triggers on Write/Edit operations for files > 200 lines
 */

const fs = require('fs');
const path = require('path');

const LOC_THRESHOLD = 200;
const DEBUG = process.env.MODULARIZATION_HOOK_DEBUG === 'true';

function debug(...args) {
  if (DEBUG) {
    console.error('[modularization-hook]', ...args);
  }
}

function getLineCount(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      debug('File does not exist:', filePath);
      return 0;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (err) {
    debug('Error reading file:', err.message);
    return 0;
  }
}

function main() {
  let input = '';

  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (chunk) => {
    input += chunk;
  });

  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const toolName = data.tool_name;
      const toolInput = data.tool_input || {};

      debug('Tool:', toolName);
      debug('Input:', JSON.stringify(toolInput, null, 2));

      // Only process Write and Edit tools
      if (!['Write', 'Edit'].includes(toolName)) {
        debug('Skipping non-Write/Edit tool');
        process.exit(0);
      }

      const filePath = toolInput.file_path;
      if (!filePath) {
        debug('No file_path in tool input');
        process.exit(0);
      }

      const lineCount = getLineCount(filePath);
      debug('Line count:', lineCount);

      if (lineCount > LOC_THRESHOLD) {
        const suggestion = {
          hookSpecificOutput: {
            additionalContext: `⚠️ File exceeds ${LOC_THRESHOLD} LOC (${lineCount} lines). Consider modularizing into smaller, focused files for better maintainability.`
          }
        };

        console.log(JSON.stringify(suggestion));
        debug('Suggestion provided');
      } else {
        debug('File under threshold, no suggestion');
      }

      process.exit(0);
    } catch (err) {
      debug('Error processing input:', err.message);
      process.exit(0);
    }
  });
}

main();
