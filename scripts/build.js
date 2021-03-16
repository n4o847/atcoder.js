const fs = require('fs/promises');
const esbuild = require('esbuild');

async function main(...args) {
  const entry = args[0];
  if (typeof entry !== 'string') {
    throw new TypeError('invalid arguments');
  }
  const content = await fs.readFile(entry, { encoding: 'utf8' });
  const banner = content.replace(/^\n+|\n$/g, '').replace(/^|(?<=\n)/g, '// ') + '\n';
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    platform: 'node',
    target: 'node12.16.1',
    banner: {
      js: banner,
    },
  });
}

main(...process.argv.slice(2));
