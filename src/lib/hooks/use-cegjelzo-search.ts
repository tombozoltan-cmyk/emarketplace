'use client'

import { useState, useCallback } from 'react'
import {
  searchCompaniesByName,
  type CegjelzoCompany,
  type CegjelzoSearchResponse,
  CegjelzoApiError,
} from '@/lib/cegjelzo-api'

export type UseCegjelzoSearchState = {
  /** Search results */
  results: CegjelzoCompany[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Whether there are more results (pagination) */
  hasNext: boolean
  /** Current page number */
  currentPage: number
}

export type UseCegjelzoSearchReturn = UseCegjelzoSearchState & {
  /** Execute search with given query */
  search: (query: string, limit?: number) => Promise<CegjelzoSearchResponse | null>
  /** Clear results and error */
  clear: () => void
}

/**
 * React hook for Cégjelző company name search
 * 
 * @example
 * ```tsx
 * function CompanySearch() {
 *   const { results, isLoading, error, search, clear } = useCegjelzoSearch()
 *   const [query, setQuery] = useState('')
 * 
 *   const handleSearch = () => {
 *     if (query.length >= 3) {
 *       search(query)
 *     }
 *   }
 * 
 *   return (
 *     <div>
 *       <input value={query} onChange={e => setQuery(e.target.value)} />
 *       <button onClick={handleSearch} disabled={isLoading}>Keresés</button>
 *       {error && <p className="text-red-500">{error}</p>}
 *       {results.map(company => (
 *         <div key={company.registration_number}>
 *           {company.full_name} - {company.tax_number}
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCegjelzoSearch(): UseCegjelzoSearchReturn {
  const [results, setResults] = useState<CegjelzoCompany[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const search = useCallback(
    async (query: string, limit?: number): Promise<CegjelzoSearchResponse | null> => {
      if (!query || query.trim().length < 3) {
        setError('A keresési kifejezésnek legalább 3 karakter hosszúnak kell lennie.')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await searchCompaniesByName({
          value: query,
          limit,
        })

        setResults(response.results)
        setHasNext(response.has_next)
        setCurrentPage(response.current_page)

        return response
      } catch (err) {
        const message =
          err instanceof CegjelzoApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Ismeretlen hiba történt a keresés során.'

        setError(message)
        setResults([])
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const clear = useCallback(() => {
    setResults([])
    setError(null)
    setHasNext(false)
    setCurrentPage(1)
  }, [])

  return {
    results,
    isLoading,
    error,
    hasNext,
    currentPage,
    search,
    clear,
  }
}

export default useCegjelzoSearch
