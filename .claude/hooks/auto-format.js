#!/usr/bin/env node

/**
 * Auto-format hook - runs after Write/Edit operations
 * Formats code based on file type using available formatters
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Read input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.file_path;

    if (!filePath || !fs.existsSync(filePath)) {
      process.exit(0);
    }

    const ext = path.extname(filePath).toLowerCase();
    const dir = path.dirname(filePath);

    // Try to format based on file type
    let formatted = false;

    // JavaScript/TypeScript - try Prettier
    if (['.js', '.jsx', '.ts', '.tsx', '.json', '.md'].includes(ext)) {
      try {
        // Check if prettier is available
        execFileSync('npx', ['--no-install', 'prettier', '--version'], { stdio: 'ignore' });
        execFileSync('npx', ['prettier', '--write', filePath], {
          cwd: dir,
          stdio: 'ignore',
          timeout: 5000
        });
        formatted = true;
      } catch (e) {
        // Prettier not available or failed, continue
      }
    }

    // Python - try Black
    if (ext === '.py') {
      try {
        execFileSync('black', ['--version'], { stdio: 'ignore' });
        execFileSync('black', [filePath], {
          cwd: dir,
          stdio: 'ignore',
          timeout: 5000
        });
        formatted = true;
      } catch (e) {
        // Black not available or failed
      }
    }

    // Go - try gofmt
    if (ext === '.go') {
      try {
        execFileSync('gofmt', ['-w', filePath], {
          stdio: 'ignore',
          timeout: 5000
        });
        formatted = true;
      } catch (e) {
        // gofmt failed
      }
    }

    // Rust - try rustfmt
    if (ext === '.rs') {
      try {
        execFileSync('rustfmt', [filePath], {
          stdio: 'ignore',
          timeout: 5000
        });
        formatted = true;
      } catch (e) {
        // rustfmt failed
      }
    }

    if (formatted) {
      console.log(JSON.stringify({
        status: 'formatted',
        file: filePath
      }));
    }

  } catch (error) {
    // Silent failure - don't block the workflow
    process.exit(0);
  }
});
