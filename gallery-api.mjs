import { mkdir, readdir, writeFile, readFile, link, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

const imageName = /\.(jpe?g|gif|png|webp|avif)$/i;
const limit = 6 * 1024 * 1024;
const hash = value => createHash('sha256').update(value).digest();

export async function galleryHandler(req, res, directory) {
  const url = new URL(req.url, 'http://localhost');
  function reply(status, value) {
    res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store'});
    res.end(JSON.stringify(value));
  }
  if (req.method === 'GET' && url.pathname === '/api/gallery') {
    await mkdir(directory, {recursive:true});
    const names = (await readdir(directory)).filter(name => imageName.test(name)).sort().reverse();
    const cursor = url.searchParams.get('cursor');
    const page = (cursor ? names.filter(name => name < cursor) : names).slice(0,25);
    const images = await Promise.all(page.slice(0,24).map(async name => {
      let caption = 'RNR field photograph';
      try { caption = (await readFile(join(directory, '.' + name + '.txt'),'utf8')) || caption; }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
      return {url:'/uploads/' + encodeURIComponent(name),caption};
    }));
    return reply(200,{images,cursor:page.length > 24 ? page[23] : null});
  }
  if (req.method !== 'POST') return reply(405,{error:'Method unavailable.'});
  const password = process.env.RNR_GALLERY_PASSWORD;
  if (!password) return reply(503,{error:'Gallery login is not configured.'});
  const expected = 'Basic ' + Buffer.from('rnr-gallery:' + password).toString('base64');
  if (!timingSafeEqual(hash(expected),hash(req.headers.authorization || ''))) return reply(401,{error:'Check your login.'});
  if (url.pathname === '/api/gallery/login') return reply(200,{ok:true});
  if (req.headers['content-type'] !== 'image/jpeg') return reply(415,{error:'Choose a photograph.'});
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) return reply(413,{error:'Choose an image under 6 MB.'});
    chunks.push(chunk);
  }
  const data = Buffer.concat(chunks);
  if (data.length < 12 || data.readUIntBE(0,3) !== 0xffd8ff || data.readUInt16BE(data.length-2) !== 0xffd9)
    return reply(415,{error:'Invalid JPEG.'});
  await mkdir(directory,{recursive:true});
  const name = 'rnr-' + Date.now() + '-' + randomUUID() + '.jpg';
  const caption = (url.searchParams.get('caption') || '').trim().slice(0,120);
  const temporary = join(directory,'.' + name + '.tmp');
  await writeFile(temporary,data,{flag:'wx'});
  try {
    await writeFile(join(directory,'.' + name + '.txt'),caption,{flag:'wx'});
    await link(temporary,join(directory,name));
  } finally { await unlink(temporary); }
  return reply(201,{url:'/uploads/' + name,caption});
}
