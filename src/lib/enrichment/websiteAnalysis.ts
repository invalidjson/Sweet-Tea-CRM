import type { WebsiteAnalysis } from "@/lib/scoring/types"

const PAGESPEED_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

interface PageSpeedAudit {
  score?: number
  numericValue?: number
}

interface PageSpeedResult {
  lighthouseResult?: {
    audits?: {
      "is-on-https"?: PageSpeedAudit
      "viewport"?: PageSpeedAudit
      "interactive"?: PageSpeedAudit
    }
  }
}

const PLATFORM_SIGNATURES: Array<{ name: string; tokens: string[] }> = [
  { name: "wordpress", tokens: ["wp-content", "wp-includes", "wordpress"] },
  { name: "squarespace", tokens: ["squarespace.com", "static1.squarespace"] },
  { name: "wix", tokens: ["wix.com", "wixstatic.com"] },
  { name: "webflow", tokens: ["webflow.com", "webflow.io"] },
  { name: "shopify", tokens: ["shopify.com", "myshopify.com"] },
  { name: "framer", tokens: ["framer.com", "framerusercontent.com"] },
]

export function detectPlatform(html: string, headers: Headers): string | undefined {
  const haystack =
    html.toLowerCase() +
    "\n" +
    [...headers.entries()].map(([k, v]) => `${k}: ${v}`).join("\n").toLowerCase()

  for (const { name, tokens } of PLATFORM_SIGNATURES) {
    if (tokens.some((t) => haystack.includes(t))) return name
  }
  return undefined
}

export function detectContactForm(html: string): boolean {
  const hasForm = html.toLowerCase().includes("<form")
  const hasEmailField = /type=["']?email["']?/i.test(html)
  const hasContactContext = /contact|reach\s+us|get\s+in\s+touch|send\s+us|message\s+us/i.test(html)
  return hasForm && (hasEmailField || hasContactContext)
}

export function detectCTA(html: string): boolean {
  return /\b(get\s+a\s+quote|free\s+quote|call\s+now|book\s+now|schedule|get\s+started|contact\s+us|request\s+service|get\s+estimate|hire\s+us)\b/i.test(html)
}

export function detectOnlineBooking(html: string): boolean {
  return /\b(book\s+(online|now|appointment)|schedule\s+(online|appointment|service)|online\s+booking|calendly|acuity|setmore|booksy|vagaro)\b/i.test(html)
}

export async function analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
  const result: WebsiteAnalysis = {
    hasHttps: url.startsWith("https://"),
  }

  // Crawl the homepage
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SiteScan/1.0)" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    })
    const html = await res.text()

    result.hasHttps = res.url.startsWith("https://")
    result.detectedPlatform = detectPlatform(html, res.headers)
    result.hasContactForm = detectContactForm(html)
    result.hasClearCallToAction = detectCTA(html)
    result.hasOnlineBooking = detectOnlineBooking(html)
  } catch {
    return result
  }

  // PageSpeed Insights — mobile strategy
  try {
    const psUrl = new URL(PAGESPEED_URL)
    psUrl.searchParams.set("url", url)
    psUrl.searchParams.set("strategy", "mobile")
    psUrl.searchParams.set("category", "performance")

    const psRes = await fetch(psUrl.toString(), {
      signal: AbortSignal.timeout(20000),
    })

    if (psRes.ok) {
      const ps: PageSpeedResult = await psRes.json()
      const audits = ps.lighthouseResult?.audits ?? {}

      if (audits["is-on-https"]?.score !== undefined) {
        result.hasHttps = audits["is-on-https"].score === 1
      }
      if (audits["viewport"]?.score !== undefined) {
        result.isMobileFriendly = audits["viewport"].score === 1
      }
      if (audits["interactive"]?.numericValue !== undefined) {
        result.loadTimeMs = Math.round(audits["interactive"].numericValue)
      }
    }
  } catch {
    // PageSpeed failure is non-fatal — partial result is fine
  }

  return result
}
