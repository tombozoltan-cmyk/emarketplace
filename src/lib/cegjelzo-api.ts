/**
 * Cégjelző Search API v2 - Company Name Search Integration
 *
 * Environment configuration:
 * - CEGJELZO_API_URL: Base URL (defaults to CEGJELZO_BASE_URL below)
 * - CEGJELZO_API_KEY: API key, sent as X-Api-Key (server-side only)
 * - CEGJELZO_CLIENT_ID: Client id, sent as X-Client-Id (server-side only)
 *
 * The key and the client id are issued as a pair and are bound to a contract
 * that lists which fields the search may return. Fields outside the contract
 * are simply absent from the response — see mapCompany() below.
 */

// =============================================================================
// Configuration
// =============================================================================

/**
 * Search host. Our contract is bound to this host: the older
 * `search.api.cegjelzo.com` (and its `search-dev` counterpart) answer
 * 403 Forbidden for the same key and client id.
 */
const CEGJELZO_BASE_URL = 'https://api.cegjelzo.com'
const CEGJELZO_SEARCH_PATH = '/api/v2/search'

/** Default page size used by the API when `limit` is omitted. */
const CEGJELZO_DEFAULT_LIMIT = 30

/**
 * Get base URL from environment or fall back to the known search host.
 */
function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_CEGJELZO_API_URL ||
    process.env.CEGJELZO_API_URL ||
    CEGJELZO_BASE_URL
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
 * What the searched value is. Optional: without it the API matches on any of
 * them, with it the match is stricter (`tax_number` errors out if the value is
 * not a tax number). Name search matches the start of the long and short name.
 */
export type CegjelzoSearchValueType = 'name' | 'tax_number' | 'reg_number'

/**
 * Search parameters
 */
export type CegjelzoSearchParams = {
  /** Company name or partial name (min 3 characters) */
  value: string
  /** Maximum results to return (API default: 30) */
  limit?: number
  /** 1-based page number (API default: 1) */
  page?: number
  /** Type of the searched value; omitted by default */
  type?: CegjelzoSearchValueType
}

// =============================================================================
// Raw v2 response shape
// =============================================================================

/**
 * Every "rovat" (register section) comes back as the full history of that
 * section, one entry per change. `change` / `insertion` are ISO dates.
 */
type CegjelzoHistoryEntry = {
  change?: string | null
  insertion?: string | null
}

/**
 * A register section. Company records (`type: "companies"`) carry the full
 * history of the section as dated entries; other registers — civil
 * organisations, for example — return a plain string, or null when the
 * register has no such section at all.
 */
type CegjelzoSection<T> = T[] | string | null

type CegjelzoRawCompany = {
  type?: string
  status_code?: number
  nav_status?: string | null
  nav_status_code?: number | null
  long_name?: CegjelzoSection<CegjelzoHistoryEntry & { name?: string | null }>
  short_name?: CegjelzoSection<CegjelzoHistoryEntry & { name?: string | null }>
  address?: CegjelzoSection<CegjelzoHistoryEntry & { address?: string | null }>
  tax_number?: CegjelzoSection<
    CegjelzoHistoryEntry & {
      tax_number?: string | null
      social_tax_number?: string | null
    }
  >
  company_registration_number?: CegjelzoSection<
    CegjelzoHistoryEntry & { company_registration_number?: string | null }
  >
  representatives?: CegjelzoSection<
    CegjelzoHistoryEntry & {
      name?: string | null
      title?: string | null
      address?: string | null
      birth_date?: string | null
      mother?: string | null
      tax_number?: string | null
      start_date?: string | null
      end_date?: string | null
    }
  >
}

/**
 * Pick the entry in force from a register section.
 *
 * The API returns the history in what is normally chronological order, but
 * that is not documented, so we sort by `change ?? insertion` instead of
 * trusting the array order. Entries without either date keep their relative
 * position and sort first, so a dated entry always wins over an undated one.
 */
function latestEntry<T extends CegjelzoHistoryEntry>(
  section?: CegjelzoSection<T>
): T | undefined {
  if (!Array.isArray(section) || section.length === 0) return undefined
  if (section.length === 1) return section[0]

  return section
    .map((entry, index) => ({ entry, index, key: entry.change ?? entry.insertion ?? '' }))
    .sort((a, b) => (a.key === b.key ? a.index - b.index : a.key < b.key ? -1 : 1))
    .at(-1)?.entry
}

/**
 * Read one value out of a register section, whichever shape it arrived in.
 */
function sectionValue<T extends CegjelzoHistoryEntry>(
  section: CegjelzoSection<T> | undefined,
  pick: (entry: T) => string | null | undefined
): string {
  if (typeof section === 'string') return section

  const entry = latestEntry(section)
  return (entry ? pick(entry) : undefined) ?? ''
}

/**
 * Flatten one raw result into the shape the rest of the app consumes.
 *
 * `bank_accounts`, `founded_at` and `main_activities` are not part of our
 * search contract, so they stay empty rather than being guessed at — the
 * register section dates are not a founding date.
 */
function mapCompany(raw: CegjelzoRawCompany): CegjelzoCompany {
  const representatives = Array.isArray(raw.representatives) ? raw.representatives : []

  return {
    type: raw.type ?? '',
    status_code: raw.status_code ?? 0,
    full_name: sectionValue(raw.long_name, (entry) => entry.name),
    short_name: sectionValue(raw.short_name, (entry) => entry.name),
    address: sectionValue(raw.address, (entry) => entry.address),
    tax_number: sectionValue(raw.tax_number, (entry) => entry.tax_number),
    social_tax_number: sectionValue(raw.tax_number, (entry) => entry.social_tax_number),
    registration_number: sectionValue(
      raw.company_registration_number,
      (entry) => entry.company_registration_number
    ),
    representatives: representatives
      .filter((rep): rep is typeof rep & { name: string } => Boolean(rep.name))
      .map((rep) => ({ name: rep.name })),
    bank_accounts: [],
    founded_at: '',
    main_activities: [],
  }
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
 * Search companies by name using the Cégjelző v2 search API
 *
 * @param params Search parameters
 * @param params.value Company name or partial name (minimum 3 characters)
 * @param params.limit Maximum number of results (API default: 30)
 * @param params.page 1-based page number (API default: 1)
 * @param params.type Type of the searched value, for a stricter match
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
  const { value, limit, page, type } = params

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
  const effectiveLimit = limit !== undefined && limit > 0 ? limit : CEGJELZO_DEFAULT_LIMIT
  queryParams.set('limit', effectiveLimit.toString())
  if (page !== undefined && page > 1) {
    queryParams.set('page', page.toString())
  }
  if (type) {
    queryParams.set('type', type)
  }

  const url = `${baseUrl}${CEGJELZO_SEARCH_PATH}?${queryParams.toString()}`

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

    // v2 returns a bare array with no paging metadata. A full page is the only
    // signal that more results may exist.
    const raw: unknown = await response.json()
    const items: CegjelzoRawCompany[] = Array.isArray(raw) ? raw : []

    return {
      current_page: page && page > 1 ? page : 1,
      has_next: items.length >= effectiveLimit,
      results: items.map(mapCompany),
    }
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
 * Whether the configured base URL is the known search host or an override.
 */
export function getCegjelzoEnvironment(): 'production' | 'custom' {
  return getBaseUrl() === CEGJELZO_BASE_URL ? 'production' : 'custom'
}
