import { createHash, timingSafeEqual } from 'node:crypto';

export function checkGalleryLogin(req, res) {
  const password = process.env.RNR_GALLERY_PASSWORD;
  if (!password) {
    res.status(503).json({error:'Gallery login is not configured on this deployment.'});
    return false;
  }
  const digest = value => createHash('sha256').update(value).digest();
  const expected = 'Basic ' + Buffer.from('rnr-gallery:' + password).toString('base64');
  if (!timingSafeEqual(digest(expected), digest(req.headers.authorization || ''))) {
    res.status(401).json({error:'Check your username and password.'});
    return false;
  }
  return true;
}
