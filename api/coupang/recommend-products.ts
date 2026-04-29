import crypto from 'node:crypto'

import { COUPANG_PARTNERS_DISCLOSURE } from '../../src/constants/disclosures.ts'

type ElementKey = 'tree' | 'fire' | 'earth' | 'metal' | 'water'

const ELEMENT_KEYWORDS: Record<ElementKey, string[]> = {
  tree: ['초록색 인테리어 소품', '공기정화 식물 화분', '나무 소재 가구'],
  fire: ['빨간색 장지갑', '세련된 무드등', '붉은 계열 의류'],
  earth: ['황토색 패션 잡화', '도자기 장식품', '베이지색 침구'],
  metal: ['메탈 손목시계', '금속 액세서리', '화이트톤 최신 가전'],
  water: ['검은색 고급 가방', '미니 가습기', '물 멍용 수조 소품'],
}

interface Product {
  productId: number
  productName: string
  productImage: string
  productUrl: string
  productPrice: number
  productRating: number
  isRocket: boolean
  isFreeShipping: boolean
  discountRate?: number
  rank?: number
}

function buildFallbackProducts(keywords: string[], trackingCode: string) {
  return keywords.slice(0, 2).map((keyword, idx) => {
    const url = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}&channel=user&subId=${encodeURIComponent(trackingCode)}`
    return {
      productId: Date.now() + idx,
      productName: `${keyword} 추천 검색 바로가기`,
      productImage: 'https://img1a.coupangcdn.com/image/coupang/common/logo_coupang_w350.png',
      productUrl: url,
      shortUrl: url,
      productPrice: 0,
      productRating: 0,
      isRocket: false,
      isFreeShipping: false,
    }
  })
}

function signAuthorization(method: string, pathWithQuery: string, accessKey: string, secretKey: string) {
  const [path, query = ''] = pathWithQuery.split('?')
  const datetime = new Date().toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z')
    .slice(2) // yyMMddTHHmmssZ
  const message = `${datetime}${method}${path}${query}`
  const signature = crypto.createHmac('sha256', secretKey).update(message).digest('hex')
  return {
    datetime,
    authorization: `CEA algorithm=HmacSHA256,access-key=${accessKey},signed-date=${datetime},signature=${signature}`,
  }
}

async function callCoupang<T>(pathWithQuery: string, accessKey: string, secretKey: string): Promise<T> {
  const { datetime, authorization } = signAuthorization('GET', pathWithQuery, accessKey, secretKey)
  const response = await fetch(`https://api-gateway.coupang.com${pathWithQuery}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: authorization,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Coupang API error(${response.status}): ${text}`)
  }
  return (await response.json()) as T
}

async function createShortUrl(targetUrl: string, accessKey: string, secretKey: string): Promise<string> {
  const encoded = encodeURIComponent(targetUrl)
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/shorten_url?url=${encoded}`
  try {
    const payload = await callCoupang<{ data?: { shortenUrl?: string } }>(path, accessKey, secretKey)
    return payload.data?.shortenUrl ?? targetUrl
  } catch {
    return targetUrl
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const accessKey = process.env.COUPANG_ACCESS_KEY
  const secretKey = process.env.COUPANG_SECRET_KEY
  const partnersId = process.env.COUPANG_PARTNERS_ID
  const trackingCode = process.env.COUPANG_TRACKING_CODE || 'AF2449492'
  const fixedAffiliateUrl = process.env.VITE_FIXED_AFFILIATE_URL || 'https://link.coupang.com/a/exgqrr'

  const element = (req.query.element || 'tree') as ElementKey
  const keywords = ELEMENT_KEYWORDS[element] ?? ELEMENT_KEYWORDS.tree

  if (!accessKey || !secretKey || !partnersId) {
    const fallbackProducts = buildFallbackProducts(keywords, trackingCode)
    res.status(200).json({
      element,
      products: fallbackProducts,
      bestLink: fixedAffiliateUrl || fallbackProducts[0]?.shortUrl || '',
      fallback: true,
      reason: 'COUPANG env is not configured',
      legalNotice: COUPANG_PARTNERS_DISCLOSURE,
    })
    return
  }

  try {
    const gathered: Product[] = []
    const searchTerms = Array.from(new Set([
      `핫딜 ${keywords[0]}`,
      ...keywords.map((k) => `${k} 핫딜`),
      ...keywords,
    ]))
    for (const keyword of searchTerms) {
      const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(keyword)}&limit=8&subId=${encodeURIComponent(partnersId)}`
      const data = await callCoupang<{ data?: { productData?: Product[] } }>(path, accessKey, secretKey)
      const products = data.data?.productData ?? []
      gathered.push(...products)
    }

    const sorted = gathered
      .filter((p) => !!p.productUrl)
      .sort((a, b) => {
        const aHot = (a.discountRate ?? 0) + (a.productName.includes('핫딜') ? 10 : 0)
        const bHot = (b.discountRate ?? 0) + (b.productName.includes('핫딜') ? 10 : 0)
        return (bHot - aHot)
          || ((b.productRating ?? 0) - (a.productRating ?? 0))
          || (Number(b.isRocket) - Number(a.isRocket))
      })
      .slice(0, 2)

    const withShortUrl = await Promise.all(
      sorted.map(async (p) => {
        const trackedUrl = `${p.productUrl}${p.productUrl.includes('?') ? '&' : '?'}subId=${encodeURIComponent(trackingCode)}`
        const shortUrl = await createShortUrl(trackedUrl, accessKey, secretKey)
        return { ...p, trackedUrl, shortUrl }
      }),
    )

    if (withShortUrl.length === 0) {
      const fallbackProducts = buildFallbackProducts(keywords, trackingCode)
      res.status(200).json({
        element,
        products: fallbackProducts,
        bestLink: fixedAffiliateUrl || fallbackProducts[0]?.shortUrl || '',
        fallback: true,
        legalNotice: COUPANG_PARTNERS_DISCLOSURE,
      })
      return
    }

    res.status(200).json({
      element,
      products: withShortUrl,
      bestLink: fixedAffiliateUrl || withShortUrl[0]?.shortUrl || '',
      fallback: false,
      legalNotice: COUPANG_PARTNERS_DISCLOSURE,
    })
  } catch (error) {
    const fallbackProducts = buildFallbackProducts(keywords, trackingCode)
    res.status(200).json({
      element,
      products: fallbackProducts,
      bestLink: fixedAffiliateUrl || fallbackProducts[0]?.shortUrl || '',
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      legalNotice: COUPANG_PARTNERS_DISCLOSURE,
    })
  }
}
