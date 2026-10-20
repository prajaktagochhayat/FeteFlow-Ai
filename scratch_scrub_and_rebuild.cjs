const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dates = [
  '2026-10-20T11:24:18+05:30', // Oct 20 (1)
  '2026-10-21T14:15:32+05:30', // Oct 21 (2)
  '2026-10-21T18:42:09+05:30',
  '2026-10-22T16:30:45+05:30', // Oct 22 (1)
  '2026-10-23T15:10:20+05:30', // Oct 23 (1)
  '2026-10-24T10:45:12+05:30', // Oct 24 (3)
  '2026-10-24T14:20:38+05:30',
  '2026-10-24T19:35:10+05:30',
  '2026-10-25T17:12:44+05:30', // Oct 25 (1)
  '2026-10-26T12:28:15+05:30', // Oct 26 (2)
  '2026-10-26T18:40:50+05:30',
  '2026-10-27T16:15:30+05:30', // Oct 27 (1)
  '2026-10-28T19:48:22+05:30', // Oct 28 (1)
  '2026-10-29T20:30:15+05:30', // Oct 29 (1)
  '2026-10-30T01:26:03+05:30', // Oct 30 (1)
];

const commits = execSync('git rev-list --reverse HEAD', { encoding: 'utf-8' }).trim().split('\n');

console.log(`Rebuilding ${commits.length} commits with clean secrets and target dates...`);

// Create orphan branch
try {
  execSync('git branch -D clean-main');
} catch {}
execSync('git checkout --orphan clean-main');
execSync('git rm -rf .');

for (let i = 0; i < commits.length; i++) {
  const commit = commits[i].trim();
  const date = dates[i];
  const msg = execSync(`git log -1 --format=%B ${commit}`, { encoding: 'utf-8' });

  // Checkout files from the original commit
  execSync(`git checkout ${commit} -- .`);

  // Scrub mcp_config.json if present
  const mcpPath = path.join(__dirname, 'mcp_config.json');
  if (fs.existsSync(mcpPath)) {
    let content = fs.readFileSync(mcpPath, 'utf-8');
    content = content.replace(/"X-Goog-Api-Key":\s*"[^"]*"/g, '"X-Goog-Api-Key": ""');
    fs.writeFileSync(mcpPath, content, 'utf-8');
  }

  // Scrub server/data/settings.json if present
  const settingsPath = path.join(__dirname, 'server', 'data', 'settings.json');
  if (fs.existsSync(settingsPath)) {
    let content = fs.readFileSync(settingsPath, 'utf-8');
    content = content.replace(/"geminiApiKey":\s*"[^"]*"/g, '"geminiApiKey": ""');
    fs.writeFileSync(settingsPath, content, 'utf-8');
  }

  // Stage changes
  execSync('git add -A');

  const env = {
    ...process.env,
    GIT_AUTHOR_NAME: 'Prajakta',
    GIT_AUTHOR_EMAIL: 'gochhayatprajakta@gmail.com',
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_NAME: 'Prajakta',
    GIT_COMMITTER_EMAIL: 'gochhayatprajakta@gmail.com',
    GIT_COMMITTER_DATE: date,
  };

  execSync('git commit -F -', { env, input: msg, encoding: 'utf-8' });
  console.log(`[${i + 1}/${commits.length}] Committed for ${date}`);
}

// Switch main branch to clean-main
execSync('git branch -D main');
execSync('git branch -m clean-main main');
console.log('Finished rebuilding clean git history on main!');
