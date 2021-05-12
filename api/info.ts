import type { VercelRequest, VercelResponse } from '@vercel/node';

import { resolveInfo } from '../util/mdn';

export default async function info(req: VercelRequest, res: VercelResponse) {
  const { l } = req.query;
  if (typeof l !== 'string') {
    return res.status(400).json({ message: "Missing 'link' query parameter." });
  }

  const data = await resolveInfo(l);
  if (!data) return res.status(404).json({ message: 'Could not resolve info.' });

  return res.json(data);
}
