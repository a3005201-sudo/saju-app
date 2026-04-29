import type { InjongEntry, PillarDetail } from '@orrery/core/types'
import { ELEMENT_HANJA } from '@orrery/core/constants'
import { STEM_INFO } from '@orrery/core/constants'
import { stemColorClass } from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import { charWithKorean, withSajuKorean } from '../../utils/saju-labels.ts'

interface Props {
  injongbeop: InjongEntry[]
  pillars: PillarDetail[] // [시, 일, 월, 년]
}

export default function InjongbeopChart({ injongbeop, pillars }: Props) {
  const { t } = useLocale()
  if (injongbeop.length === 0) return null

  const dayBranch = pillars[1].pillar.branch
  const jigang = pillars[1].jigang.replace(/ /g, '')

  // 일지 지장간의 십신 요약
  const jigangSummary = [...jigang].map(stem => {
    const info = STEM_INFO[stem]
    const el = info ? ELEMENT_HANJA[info.element] : '?'
    return `${stem}${el}`
  }).join(' ')

  return (
    <section>
      <h3 className="text-lg sm:text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">{withSajuKorean('引從法')}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">
        日支(일지) <span className="font-hanja">{charWithKorean(dayBranch)}</span> {t('saju.injong.jijanggan')}:
        <span className="font-hanja ml-1">{jigangSummary}</span>
        {t('saju.injong.desc')}
      </p>
      <div className="flex flex-wrap gap-3">
        {injongbeop.map(entry => (
          <div
            key={entry.category}
          className="flex items-center gap-1.5 text-lg border border-gray-200 dark:border-gray-700 rounded px-2.5 py-1.5"
          >
            <span className={`font-hanja ${stemColorClass(entry.yangStem)}`}>
              {charWithKorean(entry.yangStem)}{ELEMENT_HANJA[STEM_INFO[entry.yangStem]?.element ?? ''] ?? ''}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-hanja">{withSajuKorean(entry.category)}</span>
            <span className="text-gray-400 dark:text-gray-500">→</span>
            <span className="font-hanja">{withSajuKorean(entry.unseong)}從(종)</span>
          </div>
        ))}
      </div>
    </section>
  )
}
