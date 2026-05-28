/**
 * Patches tmp@0.2.3 -> tmp@0.2.6 inside @forge/cli's shrinkwrapped node_modules.
 * Required because @forge/cli ships with npm-shrinkwrap.json which locks tmp@0.2.3.
 * CVE-2026-44705 / GHSA-ph9p-34f9-6g65: Path Traversal via unsanitized prefix/postfix.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const tmpDir = path.join(__dirname, '..', 'node_modules', '@forge', 'cli', 'node_modules', 'tmp');

if (!fs.existsSync(tmpDir)) process.exit(0);

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'package.json'), 'utf8'));
  if (pkg.version === '0.2.3') {
    execSync('npm pack tmp@0.2.6 --pack-destination /tmp', { stdio: 'pipe' });
    execSync(`rm -rf "${tmpDir}" && mkdir -p "${tmpDir}" && tar -xzf /tmp/tmp-0.2.6.tgz -C "${tmpDir}" --strip-components=1`, { stdio: 'pipe' });
    console.log('✅ Patched tmp@0.2.3 → tmp@0.2.6 in @forge/cli (CVE-2026-44705)');
  }
} catch (e) {
  console.warn('⚠️  Failed to patch tmp:', e.message);
}
