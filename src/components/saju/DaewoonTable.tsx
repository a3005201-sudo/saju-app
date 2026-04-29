import { useState, useRef, useEffect, useMemo } from 'react'
import type { DaewoonItem } from '@orrery/core/types'
import { getYearGanzi, getRelation, getJeonggi, getTwelveMeteor, getTwelveSpirit } from '@orrery/core/pillars'
import { stemColorClass, branchColorClass, stemSolidBgClass, branchSolidBgClass } from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import { charWithKorean, ganzhiWithKorean, withSajuKorean } from '../../utils/saju-labels.ts'

interface Props {
  daewoon: DaewoonItem[]
  unknownTime?: boolean
  birthYear: number
  dayStem: string
  yearBranch: string
  gongmangBranches: [string, string]
}

function findActiveDaewoonIndex(daewoon: DaewoonItem[]): number {
  const now = new Date()
  let activeIdx = -1
  for (let i = 0; i < daewoon.length; i++) {
    if (daewoon[i].startDate <= now) {
      activeIdx = i
    }
  }
  return activeIdx
}

interface SewoonItem {
  year: number
  age: number
  ganzi: string
  stemSipsin: string
  branchSipsin: string
  unseong: string
  sinsal: string
  isGongmang: boolean
}

function buildSewoonItems(
  startYear: number, endYear: number,
  birthYear: number, dayStem: string, yearBranch: string,
  gmSet: Set<string>,
): SewoonItem[] {
  const items: SewoonItem[] = []
  for (let y = startYear; y < endYear; y++) {
    const ganzi = getYearGanzi(y)
    const stem = ganzi[0]
    const branch = ganzi[1]
    const rel = getRelation(dayStem, stem)
    const stemSipsin = rel ? rel.hanja : '?'
    const jeonggi = getJeonggi(branch)
    const bRel = getRelation(dayStem, jeonggi)
    const branchSipsin = bRel ? bRel.hanja : '?'
    items.push({
      year: y,
      age: y - birthYear,
      ganzi,
      stemSipsin,
      branchSipsin,
      unseong: getTwelveMeteor(dayStem, branch),
      sinsal: getTwelveSpirit(yearBranch, branch),
      isGongmang: gmSet.has(branch),
    })
  }
  return items
}

export default function DaewoonTable({
  daewoon, unknownTime, birthYear, dayStem, yearBranch, gongmangBranches,
}: Props) {
  const { t } = useLocale()

  if (daewoon.length === 0) {
    return (
      <section>
        <h3 className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-300 mb-3">{withSajuKorean('大運')}</h3>
        <p className="text-base text-gray-400 dark:text-gray-500">{t('saju.noData')}</p>
      </section>
    )
  }

  const activeIdx = findActiveDaewoonIndex(daewoon)
  const [selectedIdx, setSelectedIdx] = useState(activeIdx)
  const activeRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sewoonScrollRef = useRef<HTMLDivElement>(null)
  const sewoonActiveRef = useRef<HTMLDivElement>(null)

  // 사주 재계산 시 선택 초기화
  useEffect(() => {
    setSelectedIdx(activeIdx)
  }, [daewoon])

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    }
  }, [activeIdx])

  useEffect(() => {
    if (sewoonActiveRef.current && sewoonScrollRef.current) {
      const container = sewoonScrollRef.current
      const el = sewoonActiveRef.current
      container.scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
    }
  }, [selectedIdx])

  const gmSet = useMemo(() => new Set(gongmangBranches), [gongmangBranches])

  const sewoonItems = useMemo(() => {
    if (selectedIdx < 0) return []
    const dw = daewoon[selectedIdx]
    const startYear = dw.startDate.getFullYear()
    const endYear = selectedIdx + 1 < daewoon.length
      ? daewoon[selectedIdx + 1].startDate.getFullYear()
      : startYear + 10
    return buildSewoonItems(startYear, endYear, birthYear, dayStem, yearBranch, gmSet)
  }, [selectedIdx, daewoon, birthYear, dayStem, yearBranch, gmSet])

  const currentYear = new Date().getFullYear()

  return (
    <section className="space-y-4">
      {/* 대운 */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-amber-700 dark:text-amber-300 mb-2">{withSajuKorean('大運')}</h3>
        {unknownTime && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
            {t('saju.unknownTimeWarning')}
          </p>
        )}
        <div ref={scrollRef} className="overflow-x-auto py-1">
          <div className="inline-flex min-w-full flex-row-reverse gap-2 font-hanja">
            {daewoon.map((dw, i) => {
              const isActive = i === activeIdx
              const isSelected = i === selectedIdx
              const stem = dw.ganzi[0]
              const branch = dw.ganzi[1]
              let ringClass = ''
              if (isActive && isSelected) ringClass = 'ring-2 ring-amber-400 dark:ring-amber-500 bg-amber-100/80 dark:bg-amber-950'
              else if (isActive) ringClass = 'ring-1 ring-amber-300 dark:ring-amber-600'
              else if (isSelected) ringClass = 'ring-2 ring-blue-400 dark:ring-blue-500 bg-slate-100 dark:bg-slate-900'
              return (
                <div
                  key={dw.index}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => setSelectedIdx(i)}
                  className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 cursor-pointer hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors basis-[94px] sm:basis-[108px] ${ringClass}`}
                >
                  <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{dw.age}{t('saju.ageSuffix')}</span>
                  <span className={`text-base sm:text-lg leading-none ${stemColorClass(stem)}`}>{withSajuKorean(dw.stemSipsin)}</span>
                  <span className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 leading-none text-2xl sm:text-3xl rounded pb-[2px] ${stemSolidBgClass(stem)}`}>
                    {stem}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 -mt-0.5">{charWithKorean(stem)}</span>
                  <span className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 leading-none text-2xl sm:text-3xl rounded pb-[2px] ${branchSolidBgClass(branch)}`}>
                    {branch}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 -mt-0.5">{charWithKorean(branch)}</span>
                  <span className={`text-base sm:text-lg leading-none ${branchColorClass(branch)}`}>{withSajuKorean(dw.branchSipsin)}</span>
                  <span className="text-base text-slate-600 dark:text-slate-300 leading-none">{withSajuKorean(dw.unseong)}</span>
                  <span className="text-base text-slate-600 dark:text-slate-300 leading-none">{withSajuKorean(dw.sinsal)}</span>
                  {dw.isGongmang && <span className="text-sm text-slate-700 dark:text-slate-200 leading-none">{withSajuKorean('空亡')}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 세운 */}
      {selectedIdx >= 0 && sewoonItems.length > 0 && (
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-amber-700 dark:text-amber-300 mb-3">{withSajuKorean('歲運')}</h3>
          <div ref={sewoonScrollRef} className="overflow-x-auto py-1">
            <div className="inline-flex min-w-full flex-row-reverse gap-2 font-hanja">
              {sewoonItems.map((sw) => {
                const isActive = sw.year === currentYear
                const stem = sw.ganzi[0]
                const branch = sw.ganzi[1]
                return (
                  <div
                    key={sw.year}
                    ref={isActive ? sewoonActiveRef : undefined}
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 basis-[94px] sm:basis-[108px] ${isActive ? 'ring-2 ring-amber-400 dark:ring-amber-500 bg-amber-100/80 dark:bg-amber-950' : ''}`}
                  >
                    <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{sw.age}{t('saju.ageSuffix')}</span>
                    <span className={`text-base sm:text-lg leading-none ${stemColorClass(stem)}`}>{withSajuKorean(sw.stemSipsin)}</span>
                    <span className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 leading-none text-2xl sm:text-3xl rounded pb-[2px] ${stemSolidBgClass(stem)}`}>
                      {stem}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 -mt-0.5">{charWithKorean(stem)}</span>
                    <span className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 leading-none text-2xl sm:text-3xl rounded pb-[2px] ${branchSolidBgClass(branch)}`}>
                      {branch}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 -mt-0.5">{charWithKorean(branch)}</span>
                    <span className={`text-base sm:text-lg leading-none ${branchColorClass(branch)}`}>{withSajuKorean(sw.branchSipsin)}</span>
                    <span className="text-base text-slate-600 dark:text-slate-300 leading-none">{withSajuKorean(sw.unseong)}</span>
                    <span className="text-base text-slate-600 dark:text-slate-300 leading-none">{withSajuKorean(sw.sinsal)}</span>
                    {sw.isGongmang && <span className="text-sm text-slate-700 dark:text-slate-200 leading-none">{withSajuKorean('空亡')}</span>}
                  </div>
                )
              })}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">선택 대운 간지: {selectedIdx >= 0 ? ganzhiWithKorean(daewoon[selectedIdx].ganzi) : '-'}</p>
        </div>
      )}
    </section>
  )
}
