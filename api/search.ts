import type { VercelRequest, VercelResponse } from '@vercel/node';

import { searchDocs } from '../util/mdn';

export default async function search(req: VercelRequest, res: VercelResponse) {
  const { q } = req.query;
  if (typeof q !== 'string') return res.status(400).json({ message: "Missing 'query' query parameter" });

  const data = await searchDocs(q);
  if (!Array.isArray(data) || !data.length) return res.status(404).json({ message: 'Could not find anything.' });

  return res.json(data);
}
