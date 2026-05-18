/**
 * Cégjelző V3 Search API - Company Name Search Integration
 * 
 * API Documentation: https://search.api.cegjelzo.com
 * 
 * Environment configuration:
 * - NEXT_PUBLIC_CEGJELZO_API_URL: Base URL (defaults to test environment)
 * - CEGJELZO_API_KEY: API key for authentication (server-side only)
 * - NEXT_PUBLIC_CEGJELZO_API_KEY: API key for client-side (if needed)
 */

// =============================================================================
// Configuration
// =============================================================================

const CEGJELZO_BASE_URLS = {
  test: 'https://search-dev.api.cegjelzo.com',
  production: 'https://search.api.cegjelzo.com',
} as const

/**
 * Get base URL from environment or default to test
 */
function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CEGJELZO_API_URL ||
    process.env.CEGJELZO_API_URL ||
    CEGJELZO_BASE_URLS.test
  )
}

/**
 * Get API key from environment
 */
function getApiKey(): string {
  const apiKey =
    process.env.CEGJELZO_API_KEY ||
    process.env.NEXT_PUBLIC_CEGJELZO_API_KEY ||
    ''
  
  if (!apiKey) {
    console.warn('[Cégjelző API] No API key configured. Set CEGJELZO_API_KEY or NEXT_PUBLIC_CEGJELZO_API_KEY.')
  }
  
  return apiKey
}

/**
 * Get Client ID from environment
 */
function getClientId(): string {
  return (
    process.env.CEGJELZO_CLIENT_ID ||
    process.env.NEXT_PUBLIC_CEGJELZO_CLIENT_ID ||
    ''
  )
}

// =============================================================================
// Types
// =============================================================================

/**
 * Bank account information
 */
export type CegjelzoBankAccount = {
  bank_account: string
}

/**
 * Company representative
 */
export type CegjelzoRepresentative = {
  name: string
}

/**
 * Company/entity result from search
 */
export type CegjelzoCompany = {
  /** Entity type (e.g., "companies") */
  type: string
  /** Company status code */
  status_code: number
  /** Full legal name */
  full_name: string
  /** Short name */
  short_name: string
  /** Registered address */
  address: string
  /** Tax number (adószám) */
  tax_number: string
  /** Bank account numbers */
  bank_accounts: CegjelzoBankAccount[]
  /** Foundation date (YYYY-MM-DD) */
  founded_at: string
  /** Company registration number (cégjegyzékszám) */
  registration_number: string
  /** EU VAT number (e.g., HU26163190) */
  social_tax_number: string
  /** Legal representatives */
  representatives: CegjelzoRepresentative[]
  /** Main activities (TEÁOR codes and descriptions) */
  main_activities: string[]
}

/**
 * Search API response
 */
export type CegjelzoSearchResponse = {
  /** Current page number */
  current_page: number
  /** Whether there are more pages */
  has_next: boolean
  /** Search results */
  results: CegjelzoCompany[]
}

/**
 * Search parameters
 */
export type CegjelzoSearchParams = {
  /** Company name or partial name (min 3 characters) */
  value: string
  /** Maximum results to return (default: 50, max: 50) */
  limit?: number
}

/**
 * Search error
 */
export class CegjelzoApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string
  ) {
    super(message)
    this.name = 'CegjelzoApiError'
  }
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Search companies by name using Cégjelző V3 Search API
 * 
 * @param params Search parameters
 * @param params.value Company name or partial name (minimum 3 characters)
 * @param params.limit Maximum number of results (default: 50, max: 50)
 * @returns Search results with company data
 * @throws CegjelzoApiError on API errors
 * 
 * @example
 * ```typescript
 * const results = await searchCompaniesByName({ value: 'mol nyrt' })
 * results.results.forEach(company => {
 *   console.log(company.full_name, company.tax_number)
 * })
 * ```
 */
export async function searchCompaniesByName(
  params: CegjelzoSearchParams
): Promise<CegjelzoSearchResponse> {
  const { value, limit } = params

  // Validate minimum length
  if (!value || value.trim().length < 3) {
    throw new CegjelzoApiError(
      'A keresési kifejezésnek legalább 3 karakter hosszúnak kell lennie.',
      400
    )
  }

  const baseUrl = getBaseUrl()
  const apiKey = getApiKey()

  // Build query parameters
  const queryParams = new URLSearchParams()
  queryParams.set('value', value.trim())
  if (limit !== undefined && limit > 0) {
    queryParams.set('limit', Math.min(limit, 50).toString())
  }

  const url = `${baseUrl}/v1/names?${queryParams.toString()}`

  try {
    const clientId = getClientId()

    const headers: Record<string, string> = {
      'X-Api-Key': apiKey,
      'Accept': 'application/json',
    }
    
    if (clientId) {
      headers['X-Client-Id'] = clientId
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new CegjelzoApiError(
        `Cégjelző API hiba: ${response.status} ${response.statusText}`,
        response.status,
        errorText
      )
    }

    const data: CegjelzoSearchResponse = await response.json()
    return data
  } catch (error) {
    if (error instanceof CegjelzoApiError) {
      throw error
    }
    
    throw new CegjelzoApiError(
      `Nem sikerült kapcsolódni a Cégjelző API-hoz: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`,
      undefined,
      undefined
    )
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract all bank account numbers from a company
 */
export function extractBankAccounts(company: CegjelzoCompany): string[] {
  return (company.bank_accounts || []).map((ba) => ba.bank_account)
}

/**
 * Extract all representative names from a company
 */
export function extractRepresentativeNames(company: CegjelzoCompany): string[] {
  return (company.representatives || []).map((rep) => rep.name)
}

/**
 * Format company for display (summary)
 */
export function formatCompanySummary(company: CegjelzoCompany): string {
  const parts = [company.full_name]
  if (company.tax_number) {
    parts.push(`(${company.tax_number})`)
  }
  if (company.address) {
    parts.push(`- ${company.address}`)
  }
  return parts.join(' ')
}

/**
 * Check if the API is configured (has API key)
 */
export function isCegjelzoApiConfigured(): boolean {
  return !!(process.env.CEGJELZO_API_KEY || process.env.NEXT_PUBLIC_CEGJELZO_API_KEY)
}

/**
 * Get current environment (test or production based on URL)
 */
export function getCegjelzoEnvironment(): 'test' | 'production' | 'custom' {
  const baseUrl = getBaseUrl()
  if (baseUrl === CEGJELZO_BASE_URLS.test) return 'test'
  if (baseUrl === CEGJELZO_BASE_URLS.production) return 'production'
  return 'custom'
}
