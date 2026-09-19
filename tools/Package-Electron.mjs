import { mkdir, cp, chmod, readdir, writeFile, rename } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { buildElectron, root, releases, clockFiles, smokeEnvironment } from './electron-package.mjs';

const platform = process.argv[2] || process.platform;
if (!['win32', 'linux'].includes(platform)) throw new Error('Use package:win, package:linux, or package:mac.');
const { output, work } = await buildElectron(platform);
const windows = platform === 'win32';
const folder = windows ? 'Windows' : 'Linux';
const binary = windows ? 'Flip Clock.exe' : 'flip-clock';
execFileSync(path.join(output, binary), ['--smoke-test'], {
  stdio: 'inherit', windowsHide: true, timeout: 60000, env: smokeEnvironment()
});
const payload = path.join(work, folder);
await mkdir(payload);
await cp(output, path.join(payload, 'app'), { recursive: true, verbatimSymlinks: true });
const files = windows
  ? ['Install Flip Clock.cmd', 'Start Flip Clock.cmd', 'Install Screensaver.cmd', 'Install.ps1', 'Uninstall.ps1',
     'Install-Screensaver.ps1', 'Remove-Screensaver.ps1', 'README.md', 'FlipClock.scr',
     'Microsoft.Web.WebView2.Core.dll', 'Microsoft.Web.WebView2.WinForms.dll', 'WebView2Loader.dll',
     'WebView2-LICENSE.txt', 'WebView2-NOTICE.txt']
  : ['install-linux.sh', 'launch-unix.sh', 'README.md'];
for (const file of files) await cp(path.join(root, folder, file), path.join(payload, file));
// Windows screensaver still reads these loose assets via WebView2.
for (const file of windows ? clockFiles : ['icon.png']) {
  await cp(path.join(root, 'shared', file), path.join(payload, file));
}
const archive = path.join(releases, `Flip-Clock-${folder}.zip`);
if (windows) {
  async function listFiles(directory, prefix = '') {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative + '/'));
      else files.push(relative);
    }
    return files;
  }
  await writeFile(path.join(payload, 'runtime-files.json'), JSON.stringify(await listFiles(path.join(payload, 'app')), null, 2));
  execFileSync('powershell.exe', ['-NoProfile', '-File', path.join(root, 'tools/Archive-Windows.ps1'),
    '-Payload', payload, '-Archive', archive], { stdio: 'inherit', windowsHide: true });
} else {
  await chmod(path.join(payload, 'install-linux.sh'), 0o755);
  await chmod(path.join(payload, 'launch-unix.sh'), 0o755);
  await chmod(path.join(payload, 'app/flip-clock'), 0o755);
  // zip -y preserves symlinks; Unix executable modes are stored in the ZIP.
  const freshArchive = path.join(work, 'Flip-Clock-Linux.zip');
  execFileSync('zip', ['-q', '-r', '-y', freshArchive, folder], { cwd: work, stdio: 'inherit' });
  await rename(freshArchive, archive);
}
console.log(`Built ${archive} (standalone Electron app, x64).`);
