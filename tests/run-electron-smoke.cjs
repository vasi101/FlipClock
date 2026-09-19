const { spawnSync } = require('node:child_process');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const binary = process.argv[2];
if (!binary) throw new Error('Pass a packaged Electron executable.');
const result = spawnSync(binary, ['--smoke-test'], { stdio: 'inherit', windowsHide: true, timeout: 60000, env });
if (result.error) console.error(result.error);
process.exit(result.status ?? 1);
