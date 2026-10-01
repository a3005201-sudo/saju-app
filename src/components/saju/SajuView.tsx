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
import SajuSummaryCard from './SajuSummaryCard.tsx'
import WhatIsThis from './WhatIsThis.tsx'
import type { BirthInput } from '@orrery/core/types'
import { withSajuKorean } from '../../utils/saju-labels.ts'
import { COUPANG_PARTNERS_DISCLOSURE } from '../../constants/disclosures.ts'

interface Props {
  input: BirthInput
  bestItemUrl?: string
  onLuckLinkChange?: (links: { bestItemUrl: string }) => void
  aiPanel?: React.ReactNode
}

const LUCK_ITEMS_ID = 'luck-items'

export default function SajuView({ input, onLuckLinkChange, aiPanel }: Props) {
  const result = useMemo(() => calculateSaju(input), [input])

  const ganzis = result.pillars.map(p => p.pillar.ganzi)
  const natalPillars = ganzis // [시, 일, 월, 년]

  return (
    <div className="space-y-5 sm:space-y-6">
      <SajuSummaryCard
        result={result}
        unknownTime={input.unknownTime}
        onShowLuckItems={() => document.getElementById(LUCK_ITEMS_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
      />

      {aiPanel}

      {/* 명식 테이블 */}
      <section className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-blue-100 dark:border-gray-700 p-3 sm:p-5 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">{withSajuKorean('四柱八字')} 원본 표</h2>
        <WhatIsThis>
          태어난 연·월·일·시를 각각 두 글자(위: 천간, 아래: 지지)로 바꾼 여덟 글자가 사주팔자예요.
          노란 테두리의 <b>일주 위쪽 글자(일간)</b>가 &lsquo;나 자신&rsquo;이고, 나머지 글자는 나와의 관계(십신)로 읽어요.
          색깔은 오행(초록=나무, 빨강=불, 노랑=흙, 흰색=쇠, 검정=물)을 뜻해요.
        </WhatIsThis>
        <PillarTable pillars={result.pillars} unknownTime={input.unknownTime} gongmang={result.gongmang} />
      </section>

      {/* 대운 */}
      <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-amber-100 dark:border-gray-700 p-3 sm:p-5 shadow-sm">
        <WhatIsThis>
          대운은 10년마다 바뀌는 인생의 큰 흐름이에요. 노란 테두리가 <b>지금 지나고 있는 대운</b>이고,
          다른 대운을 누르면 그 10년 동안의 해마다 운(세운)이 아래에 나와요. 옆으로 밀어서 볼 수 있어요.
        </WhatIsThis>
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
      <div className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-cyan-100 dark:border-gray-700 p-3 sm:p-5 shadow-sm">
        <WhatIsThis>
          앞으로 다가올 날·달의 기운이 내 사주 글자와 만나는 시점이에요.
          합(合)은 조화·인연, 충(沖)은 변화·이동이 생기기 쉬운 때로 참고하세요.
        </WhatIsThis>
        <TransitView natalPillars={natalPillars} />
      </div>

      {/* 전문가용 상세 */}
      <details className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900 shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-base font-semibold text-slate-800 dark:text-slate-100">전문가용 상세 분석</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">팔자 관계 · 신살 · 좌법 · 인종법 (처음이라면 건너뛰어도 괜찮아요)</span>
          </span>
          <span className="shrink-0 text-sm font-medium text-amber-700 dark:text-amber-300 group-open:hidden">펼치기 ▾</span>
          <span className="shrink-0 text-sm font-medium text-amber-700 dark:text-amber-300 hidden group-open:inline">접기 ▴</span>
        </summary>
        <div className="space-y-4 px-3 pb-4 sm:px-5">
          <div className="bg-gradient-to-br from-white to-rose-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-rose-100 dark:border-gray-700 p-3 sm:p-5">
            <WhatIsThis>
              여덟 글자끼리 서로 합치거나(합) 부딪히는(충·형·파·해) 관계예요.
              좋고 나쁨보다는 &lsquo;인연이나 변화가 생기기 쉬운 자리&rsquo;로 이해하면 쉬워요.
            </WhatIsThis>
            <RelationList relations={result.relations} pillars={ganzis} />
          </div>

          <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-emerald-100 dark:border-gray-700 p-3 sm:p-5">
            <WhatIsThis>
              특정 글자 조합에 붙는 별명 같은 거예요. 예) 도화살 = 인기·매력, 천을귀인 = 나를 돕는 사람.
              무섭게 생각하지 말고 참고용 키워드로 보세요.
            </WhatIsThis>
            <SinsalList sals={result.specialSals} />
          </div>

          <div className="bg-gradient-to-br from-white to-violet-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-violet-100 dark:border-gray-700 p-3 sm:p-5 space-y-4">
            <WhatIsThis>
              지지 속에 숨은 글자(지장간)가 어떤 힘을 받는지 보는 전문 분석이에요. 명리학 공부용 자료예요.
            </WhatIsThis>
            <JwabeopChart jwabeop={result.jwabeop} pillars={result.pillars} unknownTime={input.unknownTime} />
            <InjongbeopChart injongbeop={result.injongbeop} pillars={result.pillars} />
          </div>
        </div>
      </details>

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

      <div id={LUCK_ITEMS_ID} className="scroll-mt-4">
        <LuckItemPanel result={result} onLinksChange={onLuckLinkChange} />
      </div>
    </div>
  )
}
