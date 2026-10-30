import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const {build}=createRequire(import.meta.url)('esbuild');
await build({absWorkingDir:path.join(root,'vendor/source'),entryPoints:['./host-tools.ts'],outfile:path.join(root,'vendor/runtime.cjs'),bundle:true,platform:'node',format:'cjs',target:'node22',legalComments:'external'});
