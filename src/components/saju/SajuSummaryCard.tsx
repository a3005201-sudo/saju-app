import type { SajuResult } from '@orrery/core/types'
import { STEM_INFO } from '@orrery/core/constants'
import { stemSolidBgClass } from '../../utils/format.ts'
import { charWithKorean, ganzhiWithKorean } from '../../utils/saju-labels.ts'
import { detectWeakElement } from '../../utils/luck-items.ts'
import {
  DAY_MASTER_PROFILE,
  ELEMENT_INFO,
  ELEMENT_ORDER,
  SIPSIN_PLAIN,
  countElements,
  findCurrentDaewoon,
  yearLuck,
} from '../../utils/saju-summary.ts'

interface Props {
  result: SajuResult
  unknownTime?: boolean
  onShowLuckItems?: () => void
}

export default function SajuSummaryCard({ result, unknownTime, onShowLuckItems }: Props) {
  const dayStem = result.pillars[1].pillar.stem
  const profile = DAY_MASTER_PROFILE[dayStem]
  const dayElement = STEM_INFO[dayStem]?.element
  const counts = countElements(result.pillars, unknownTime)
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const maxCount = Math.max(...Object.values(counts))
  const strongest = ELEMENT_ORDER.filter(el => counts[el] === maxCount)
  const weak = detectWeakElement(result.pillars)
  const current = findCurrentDaewoon(result.daewoon)
  const thisYear = yearLuck(dayStem)
  const currentSipsin = current ? SIPSIN_PLAIN[current.item.stemSipsin] : undefined
  const yearSipsin = SIPSIN_PLAIN[thisYear.sipsin]

  return (
    <section className="rounded-2xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/40 p-4 sm:p-6 shadow-sm">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-amber-100">✨ 한눈에 보는 내 사주</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">어려운 한자 없이, 핵심만 쉽게 정리했어요.</p>

      {profile && (
        <div className="mt-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">① 나는 어떤 사람?</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`shrink-0 inline-flex items-center justify-center w-16 h-16 rounded-xl text-4xl leading-none pb-1 font-hanja ${stemSolidBgClass(dayStem)}`}>
              {dayStem}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                나를 나타내는 글자 · {charWithKorean(dayStem)}{dayElement ? ` ${ELEMENT_INFO[dayElement].name}(${ELEMENT_INFO[dayElement].hanja})` : ''}
              </p>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">{profile.title}</p>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">{profile.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.keywords.map(k => (
              <span key={k} className="rounded-full bg-amber-100 dark:bg-amber-900/50 px-2.5 py-0.5 text-sm font-medium text-amber-800 dark:text-amber-200">#{k}</span>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">💡 주의할 점: {profile.caution}</p>
        </div>
      )}

      <div className="mt-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 p-4">
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">② 내 사주의 다섯 가지 기운 (오행)</p>
        <ul className="mt-3 space-y-2">
          {ELEMENT_ORDER.map(el => {
            const info = ELEMENT_INFO[el]
            const pct = total ? Math.round((counts[el] / total) * 100) : 0
            return (
              <li key={el} className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-200">{info.name}({info.hanja})</span>
                <span className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <span className={`block h-full rounded-full ${info.barClass}`} style={{ width: `${Math.max(pct, counts[el] ? 6 : 0)}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right text-sm tabular-nums text-slate-600 dark:text-slate-300">{counts[el]}개</span>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-700 dark:text-slate-200">
          가장 강한 기운은 <b>{strongest.map(el => `${ELEMENT_INFO[el].name}(${ELEMENT_INFO[el].hanja})`).join('·')}</b>
          {' '}({strongest.map(el => ELEMENT_INFO[el].meaning).join(' / ')})이고,
          {' '}보완하면 좋은 기운은 <b className="text-amber-700 dark:text-amber-300">{ELEMENT_INFO[weak].name}({ELEMENT_INFO[weak].hanja})</b>
          {' '}({ELEMENT_INFO[weak].meaning})이에요.
        </p>
        {onShowLuckItems && (
          <button
            type="button"
            onClick={onShowLuckItems}
            className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300 underline underline-offset-2"
          >
            부족한 {ELEMENT_INFO[weak].name} 기운 채워주는 아이템 보기 ↓
          </button>
        )}
        {unknownTime && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">태어난 시간을 몰라 6글자 기준으로 계산했어요.</p>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 p-4">
        <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">③ 지금 나의 운 흐름</p>
        <dl className="mt-2 space-y-3">
          {current && (
            <div>
              <dt className="text-sm text-slate-500 dark:text-slate-400">
                10년 큰 운(대운) · {current.item.age}~{current.endAge}세 · <span className="font-hanja">{ganzhiWithKorean(current.item.ganzi)}</span>
              </dt>
              <dd className="text-[15px] font-medium text-slate-800 dark:text-slate-100">
                {currentSipsin ? currentSipsin.meaning : current.item.stemSipsin}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-slate-500 dark:text-slate-400">
              {thisYear.year}년 올해 운(세운) · <span className="font-hanja">{ganzhiWithKorean(thisYear.ganzi)}</span>
            </dt>
            <dd className="text-[15px] font-medium text-slate-800 dark:text-slate-100">
              {yearSipsin ? yearSipsin.meaning : thisYear.sipsin}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
        👇 재물운·연애운·올해 운세 등 자세한 풀이는 아래 AI 버튼으로 무료로 받아보세요
      </p>
    </section>
  )
}
