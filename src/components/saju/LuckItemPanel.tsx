import { useEffect, useMemo, useState } from 'react'
import type { SajuResult } from '@orrery/core/types'
import { detectWeakElement, ELEMENT_LABEL, type FiveElement, type LuckItem } from '../../utils/luck-items.ts'

interface RecommendedProduct extends LuckItem {
  shortUrl: string
}

interface Props {
  result: SajuResult
  onLinksChange?: (links: { bestItemUrl: string }) => void
}

function toSafeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export default function LuckItemPanel({ result, onLinksChange }: Props) {
  const weakElement = useMemo<FiveElement>(() => detectWeakElement(result.pillars), [result.pillars])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [legalNotice, setLegalNotice] = useState('')
  const [fallbackMode, setFallbackMode] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    setProducts([])

    fetch(`/api/coupang/recommend-products?element=${weakElement}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then((data) => {
        if (!mounted) return
        const rawList = (data.products ?? []) as RecommendedProduct[]
        const list = rawList.map((item, index) => ({
          ...item,
          productId: item.productId ?? `fallback-${index}`,
          productName: item.productName ?? '추천 상품',
          productImage: item.productImage ?? '',
          productUrl: item.productUrl ?? '',
          shortUrl: item.shortUrl ?? '',
          productRating: toSafeNumber(item.productRating, 0),
          productPrice: toSafeNumber(item.productPrice, 0),
        }))
        setProducts(list)
        setLegalNotice(data.legalNotice ?? '')
        setFallbackMode(!!data.fallback)
        onLinksChange?.({ bestItemUrl: data.bestLink ?? list[0]?.shortUrl ?? '' })
      })
      .catch((e) => {
        if (!mounted) return
        setError(e instanceof Error ? e.message : String(e))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [weakElement, onLinksChange])

  return (
    <section className="bg-gradient-to-br from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-amber-200 dark:border-slate-700 p-5">
      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-amber-200">
        부족 오행 핫딜 추천템: {ELEMENT_LABEL[weakElement]}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        실시간 쿠팡 파트너스 연동으로 핫딜/할인율/평점 기준 상위 2개를 추천합니다.
      </p>
      {fallbackMode && (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          실시간 상품 연동이 지연되어 키워드 기반 바로가기 링크를 표시 중입니다.
        </p>
      )}

      {loading && <p className="mt-3 text-base text-slate-600 dark:text-slate-300">추천 상품 불러오는 중...</p>}
      {error && <p className="mt-3 text-base text-red-600 dark:text-red-400">추천 로딩 실패: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {products.map((item) => (
            <a
              key={item.productId}
              href={item.shortUrl || item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-900/70 p-3 hover:shadow-md transition-shadow"
            >
              <img src={item.productImage} alt={item.productName} className="w-24 h-24 object-cover rounded" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{item.productName}</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">★ {item.productRating.toFixed(1)}</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">{item.productPrice.toLocaleString()}원</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {!!legalNotice && (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {legalNotice}
        </p>
      )}
    </section>
  )
}
