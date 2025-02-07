import moment from 'moment';
import type { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/prisma';

export default async function user(req: NextApiRequest, res: NextApiResponse) {
  const params = req.query;

  const slug = params.slug as string;
  try {
    const result = await prisma.bounties.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: { sponsor: true, poc: true },
    });

    if (Number(moment(result?.deadline).format('x')) > Date.now()) {
      res.status(200).json({
        bounty: result,
        submission: [],
      });
      return;
    }

    const submission = await prisma.submission.findMany({
      where: {
        listingType: 'BOUNTY',
        listingId: result?.id,
      },
      include: {
        user: true,
      },
    });
    res.status(200).json({
      bounty: result,
      submission,
    });
  } catch (error) {
    res.status(400).json({
      error,
      message: `Error occurred while fetching bounty with slug=${slug}.`,
    });
  }
}
