import { mkdir, cp, chmod } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { buildElectron, root, releases, smokeEnvironment } from './electron-package.mjs';

const { output, work } = await buildElectron('darwin');
const appPath = path.join(output, 'Flip Clock.app');
// Ad-hoc signing only: no Developer ID credentials or notarization.
execFileSync('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' });
execFileSync('/usr/bin/codesign', ['--verify', '--deep', '--strict', appPath], { stdio: 'inherit' });
execFileSync(path.join(appPath, 'Contents/MacOS/Flip Clock'), ['--smoke-test'], {
  stdio: 'inherit', timeout: 60000, env: smokeEnvironment()
});
const payload = path.join(work, 'Flip Clock macOS');
await mkdir(payload);
execFileSync('/usr/bin/ditto', [appPath, path.join(payload, 'Flip Clock.app')]);
for (const file of ['Install macOS.command', 'README.md']) {
  await cp(path.join(root, 'macOS', file), path.join(payload, file));
}
await chmod(path.join(payload, 'Install macOS.command'), 0o755);
const archive = path.join(releases, 'Flip-Clock-macOS.zip');
execFileSync('/usr/bin/ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', payload, archive]);
console.log(`Built ${archive} (Intel + Apple Silicon).`);
