/** AI 버튼 쿠키 심기·고정 제휴에 쓰는 쿠팡 파트너스 링크 */
export const COUPANG_FIXED_AFFILIATE_URL =
  (import.meta.env.VITE_FIXED_AFFILIATE_URL as string | undefined)?.trim()
  || 'https://link.coupang.com/a/exgqrr'

export const COUPANG_TRACKING_CODE = 'AF2449492'

/** 파트너스 추적 쿠키가 심히는 공식 제휴 링크인지 */
export function isCoupangAffiliateUrl(url: string | undefined | null): boolean {
  if (!url?.trim()) return false
  try {
    return new URL(url.trim()).hostname === 'link.coupang.com'
  } catch {
    return false
  }
}
