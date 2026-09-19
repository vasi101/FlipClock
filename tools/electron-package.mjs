import { packager } from '@electron/packager';
import { mkdir, mkdtemp, cp, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const releases = path.join(root, 'releases');
export const clockFiles = ['index.html', 'style.css', 'app.js', 'timer.js', 'background.js', 'awake.js', 'icon.ico', 'icon.svg', 'icon.png'];

export async function buildElectron(platform) {
  if (process.platform !== platform) throw new Error(`Build ${platform} on a matching native runner.`);
  await mkdir(releases, { recursive: true });
  const work = await mkdtemp(path.join(releases, `${platform}-build-`));
  const source = path.join(work, 'source');
  await mkdir(source);
  const metadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  await writeFile(path.join(source, 'package.json'), JSON.stringify({
    name: metadata.name, productName: metadata.productName, version: metadata.version,
    description: metadata.description, main: metadata.main
  }, null, 2));
  await cp(path.join(root, 'electron'), path.join(source, 'electron'), { recursive: true });
  await mkdir(path.join(source, 'shared'));
  for (const file of clockFiles) await cp(path.join(root, 'shared', file), path.join(source, 'shared', file));
  const [output] = await packager({
    dir: source,
    out: path.join(work, 'packaged'),
    name: 'Flip Clock',
    executableName: platform === 'linux' ? 'flip-clock' : 'Flip Clock',
    platform,
    arch: platform === 'darwin' ? 'universal' : 'x64',
    electronVersion: metadata.devDependencies.electron,
    appBundleId: 'io.github.vasi101.flipclock',
    appCategoryType: 'public.app-category.utilities',
    icon: path.join(root, platform === 'darwin' ? 'shared/icon.icns' : 'shared/icon.ico'),
    asar: true,
    prune: false,
    darwinDarkModeSupport: true
  });
  return { output, work };
}

export function smokeEnvironment() {
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}
