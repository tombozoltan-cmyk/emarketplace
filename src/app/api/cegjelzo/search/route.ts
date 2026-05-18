import { NextRequest, NextResponse } from 'next/server'
import { searchCompaniesByName, CegjelzoApiError } from '@/lib/cegjelzo-api'

/**
 * GET /api/cegjelzo/search?value=<company_name>&limit=<number>
 * 
 * Server-side proxy for Cégjelző company name search.
 * Keeps API key secure on server side.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const value = searchParams.get('value')
    const limitParam = searchParams.get('limit')

    if (!value || value.trim().length < 3) {
      return NextResponse.json(
        { error: 'A keresési kifejezésnek legalább 3 karakter hosszúnak kell lennie.' },
        { status: 400 }
      )
    }

    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    const response = await searchCompaniesByName({
      value: value.trim(),
      limit: limit && !isNaN(limit) ? limit : undefined,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Cégjelző API] Search error:', error)

    if (error instanceof CegjelzoApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Belső szerverhiba a céginformáció lekérdezése során.' },
      { status: 500 }
    )
  }
}
