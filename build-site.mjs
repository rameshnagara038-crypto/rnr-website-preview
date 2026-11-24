import { cp, copyFile, mkdir } from 'node:fs/promises';
await mkdir('dist', {recursive:true});
await cp('site', 'dist', {recursive:true});
await copyFile('index.html', 'dist/index.html');
