#!/usr/bin/env node
// SPDX-License-Identifier: LicenseRef-NIA-Proprietary

/**
 * CodexOS.dev Cross-Platform Startup Script
 * Detects the operating system and runs the appropriate startup script
 */

const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper functions
const log = {
  info: (msg) => console.log(`${colors.blue}→${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✗${colors.reset} ${msg}`)
};

// ASCII Art Logo
console.log(colors.blue);
console.log(`   ____          _          ___  ____  `);
console.log(`  / ___|___   __| | _____  / _ \\/ ___| `);
console.log(` | |   / _ \\ / _\` |/ _ \\ \\| | | \\___ \\ `);
console.log(` | |__| (_) | (_| |  __/  X| |_| |___) |`);
console.log(`  \\____\\___/ \\__,_|\\___| /_/ \\___/____/ `);
console.log(`                                        `);
console.log(`      Autonomous Engineering OS`);
console.log(colors.reset);

log.info('Detecting operating system...');

const platform = os.platform();
const scriptDir = __dirname;

let startupScript;
let shell;
let shellArgs;

switch (platform) {
  case 'darwin': // macOS
  case 'linux':
    startupScript = path.join(scriptDir, 'startup.sh');
    shell = '/bin/bash';
    shellArgs = [startupScript];
    
    // Make script executable
    try {
      fs.chmodSync(startupScript, '755');
      log.success(`Running on ${platform === 'darwin' ? 'macOS' : 'Linux'}`);
    } catch (err) {
      log.error(`Failed to make script executable: ${err.message}`);
      process.exit(1);
    }
    break;
    
  case 'win32': // Windows
    startupScript = path.join(scriptDir, 'startup.ps1');
    shell = 'powershell.exe';
    shellArgs = ['-ExecutionPolicy', 'Bypass', '-File', startupScript];
    log.success('Running on Windows');
    break;
    
  default:
    log.error(`Unsupported platform: ${platform}`);
    log.info('Please run the startup script manually.');
    process.exit(1);
}

// Check if startup script exists
if (!fs.existsSync(startupScript)) {
  log.error(`Startup script not found: ${startupScript}`);
  process.exit(1);
}

// Run the appropriate startup script
log.info('Starting CodexOS.dev...\n');

const child = spawn(shell, shellArgs, {
  stdio: 'inherit',
  cwd: scriptDir
});

child.on('error', (err) => {
  log.error(`Failed to start: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    log.error(`Startup script exited with code ${code}`);
    process.exit(code);
  }
});
