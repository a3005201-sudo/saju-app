import { useMemo } from 'react'
import { calculateSaju } from '@orrery/core/saju'
import PillarTable from './PillarTable.tsx'
import RelationList from './RelationList.tsx'
import SinsalList from './SinsalList.tsx'
import JwabeopChart from './JwabeopChart.tsx'
import InjongbeopChart from './InjongbeopChart.tsx'
import DaewoonTable from './DaewoonTable.tsx'
import TransitView from './TransitView.tsx'
import LuckItemPanel from './LuckItemPanel.tsx'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import { withSajuKorean } from '../../utils/saju-labels.ts'
import LinkShareButtons from '../LinkShareButtons.tsx'
import { COUPANG_PARTNERS_DISCLOSURE } from '../../constants/disclosures.ts'

interface Props {
  input: BirthInput
  bestItemUrl?: string
  onLuckLinkChange?: (links: { bestItemUrl: string }) => void
}

export default function SajuView({ input, bestItemUrl, onLuckLinkChange }: Props) {
  const { t } = useLocale()
  const result = useMemo(() => calculateSaju(input), [input])
  const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim()
    || (typeof window !== 'undefined' ? window.location.origin : '[Vercel 주소]')

  const ganzis = result.pillars.map(p => p.pillar.ganzi)
  const natalPillars = ganzis // [시, 일, 월, 년]

  return (
    <div className="space-y-6">
      {/* 명식 테이블 */}
      <section className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-blue-100 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-300">{withSajuKorean('四柱八字')}</h2>
        </div>
        <PillarTable pillars={result.pillars} unknownTime={input.unknownTime} gongmang={result.gongmang} />
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <LinkShareButtons
          shareUrl={publicAppUrl}
          shareText={`${withSajuKorean('四柱八字')} 결과를 확인해보세요!`}
        />
      </section>

      {/* 팔자 관계 */}
      <div className="bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-rose-100 dark:border-gray-700 p-5 shadow-sm">
        <RelationList relations={result.relations} pillars={ganzis} />
      </div>

      {/* 신살 */}
      <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-emerald-100 dark:border-gray-700 p-5 shadow-sm">
        <SinsalList sals={result.specialSals} />
      </div>

      {/* 좌법 · 인종법 */}
      <div className="bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-violet-100 dark:border-gray-700 p-5 shadow-sm space-y-4">
        <JwabeopChart jwabeop={result.jwabeop} pillars={result.pillars} unknownTime={input.unknownTime} />
        <InjongbeopChart injongbeop={result.injongbeop} pillars={result.pillars} />
      </div>

      {/* 대운 */}
      <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-amber-100 dark:border-gray-700 p-5 shadow-sm">
        <DaewoonTable
          daewoon={result.daewoon}
          unknownTime={input.unknownTime}
          birthYear={input.year}
          dayStem={result.pillars[1].pillar.stem}
          yearBranch={result.pillars[3].pillar.branch}
          gongmangBranches={result.gongmang.branches}
        />
      </div>

      {/* 트랜짓 */}
      <div className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-cyan-100 dark:border-gray-700 p-5 shadow-sm">
        <TransitView natalPillars={natalPillars} />
      </div>

      {/* 쿠팡 배너 (몰입 구간 전환용) */}
      <section className="rounded-xl border border-amber-200/80 dark:border-amber-700/50 bg-white dark:bg-slate-900 p-4">
        <div className="hidden sm:flex justify-center">
          <a
            href="https://link.coupang.com/a/exl9XF"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="unsafe-url"
            aria-label="사주 명리학 추천 카테고리 배너"
          >
            <img
              src="https://ads-partners.coupang.com/banners/914544?subId=&traceId=V0-301-969b06e95b87326d-I914544&w=728&h=90"
              alt="사주 명리학 관련 추천 배너"
              className="w-full max-w-[728px] h-auto rounded-md"
              loading="lazy"
            />
          </a>
        </div>
        <div className="sm:hidden">
          <a
            href="https://link.coupang.com/a/exl9XF"
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="unsafe-url"
            className="inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-400"
          >
            사주 명리학 추천템 바로가기
          </a>
        </div>
        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 text-center">
          {COUPANG_PARTNERS_DISCLOSURE}
        </p>
      </section>

      <LuckItemPanel result={result} onLinksChange={onLuckLinkChange} />
    </div>
  )
}
