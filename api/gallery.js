import { list, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { checkGalleryLogin } from '../lib/gallery-auth.js';

const prefix = 'rnr-gallery/';
const maxBytes = 4 * 1024 * 1024;

export default async function gallery(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET','POST'].includes(req.method)) return res.status(405).end();
  if (req.method === 'POST' && !checkGalleryLogin(req, res)) return;
  const params = new URL(req.url, 'https://localhost').searchParams;
  try {
    if (req.method === 'GET') {
      const page = await list({prefix, limit:24, cursor:params.get('cursor') || undefined});
      const images = page.blobs.map(blob => {
        const captionKey = blob.pathname.split('/').pop().replace(/\.jpg$/, '');
        return {url:blob.url, caption:Buffer.from(captionKey, 'base64url').toString() || 'RNR field photograph'};
      });
      return res.json({images, cursor:page.hasMore ? page.cursor : null});
    }
    if (req.headers['content-type'] !== 'image/jpeg') return res.status(415).json({error:'Choose a JPEG photograph.'});
    const parts = [];
    let size = 0;
    for await (const part of req) {
      size += part.length;
      if (size > maxBytes) return res.status(413).json({error:'Choose a smaller photograph.'});
      parts.push(part);
    }
    const data = Buffer.concat(parts);
    if (data.length < 12 || data.readUIntBE(0,3) !== 0xffd8ff || data.readUInt16BE(data.length-2) !== 0xffd9)
      return res.status(415).json({error:'Invalid JPEG photograph.'});
    const caption = (params.get('caption') || '').trim().slice(0,120) || 'RNR field photograph';
    const key = prefix + (9999999999999-Date.now()) + '-' + randomUUID() + '/' + Buffer.from(caption).toString('base64url') + '.jpg';
    const blob = await put(key, data, {access:'public', contentType:'image/jpeg'});
    return res.status(201).json({url:blob.url, caption});
  } catch {
    return res.status(503).json({error:'Gallery storage is unavailable. Check the Blob store connection.'});
  }
}
