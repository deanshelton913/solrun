import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

import type { Airport } from '@/app/types/airport';

/** Cache for 24h; data is from OurAirports and updated via scripts/fetch-airports.mjs */
const CACHE_SECONDS = 86400;

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      'data',
      'airports.json'
    );
    const data = await readFile(filePath, 'utf-8');
    const airports: Airport[] = JSON.parse(data);
    const response = NextResponse.json({ airports });
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS}`
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Airport data unavailable' },
      { status: 503 }
    );
  }
}
