import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Keep-alive endpoint to prevent Supabase free tier from pausing
 * after 7 days of inactivity. Triggered by Vercel Cron every 5 days.
 *
 * This performs a lightweight raw SQL query (SELECT 1) to keep the
 * database connection active without reading any user data.
 */
export async function GET(request: Request) {
  // Optional: Verify the request is from Vercel Cron in production
  // Vercel sets this header automatically for cron invocations
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Lightweight query — just checks DB is responsive
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      message: 'Supabase database is active',
    })
  } catch (error: any) {
    console.error('[keep-alive] Database ping failed:', error.message)
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        message: error.message || 'Database ping failed',
      },
      { status: 500 }
    )
  }
}
