import { checkGalleryLogin } from '../../lib/gallery-auth.js';

export default function login(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();
  if (checkGalleryLogin(req, res)) return res.status(200).json({ok:true});
}
