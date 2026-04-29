import { useState, useMemo } from 'react'
import { findTransits } from '@orrery/core/pillars'
import { formatRelation } from '../../utils/format.ts'
import type { TransitItem } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import { ganzhiWithKorean, withSajuKorean } from '../../utils/saju-labels.ts'

interface Props {
  natalPillars: string[]  // [시주, 일주, 월주, 년주]
}

export default function TransitView({ natalPillars }: Props) {
  const { t, locale } = useLocale()
  const [months, setMonths] = useState(1)
  const [backward, setBackward] = useState(false)

  const transits = useMemo(
    () => findTransits(natalPillars, months, backward),
    [natalPillars, months, backward],
  )

  const direction = backward ? t('saju.transit.past') : t('saju.transit.future')

  return (
    <section>
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-lg sm:text-xl font-semibold text-cyan-700 dark:text-cyan-300">{withSajuKorean('運勢')}</h3>
        <select
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
          className="text-sm border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-600 dark:text-gray-300"
        >
          <option value={1}>{t('saju.transit.1month')}</option>
          <option value={3}>{t('saju.transit.3months')}</option>
          <option value={6}>{t('saju.transit.6months')}</option>
        </select>
        <button
          onClick={() => setBackward(!backward)}
          className={`text-sm px-2 py-0.5 rounded border transition-colors ${
            backward
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-200'
              : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
          }`}
        >
          {backward ? t('saju.transit.pastBtn') : t('saju.transit.futureBtn')}
        </button>
      </div>

      {transits.length === 0 ? (
        <p className="text-base text-gray-400 dark:text-gray-500">({direction} {months}{t('saju.transit.noRelation')})</p>
      ) : (
        <div className="text-base space-y-1 max-h-80 overflow-y-auto">
          {transits.map((tr, i) => {
            const date = tr.date
            const mm = String(date.getMonth() + 1).padStart(2, ' ')
            const dd = String(date.getDate()).padStart(2, ' ')
            const dateStr = locale === 'en' ? `${mm}/${dd}` : `${mm}${t('form.monthSuffix')} ${dd}${t('form.daySuffix')}`
            const prefixMap: Record<string, string> = { '천간': t('transit.stem'), '지지': t('transit.branch') }
            const relStrs = tr.relations.map(r => `${prefixMap[r.prefix] ?? r.prefix}${formatRelation(r.relation)}`)

            return (
              <div key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-0.5 leading-tight text-gray-600 dark:text-gray-300">
                <span className="text-gray-400 dark:text-gray-500 w-14 sm:w-16 shrink-0">{dateStr}</span>
                <span className={`w-20 sm:w-24 shrink-0 ${tr.type === '月運' ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                  {withSajuKorean(tr.type)}
                </span>
                <span className="font-hanja shrink-0 whitespace-nowrap">{ganzhiWithKorean(tr.transit)}</span>
                <span className="text-gray-400 dark:text-gray-500 shrink-0">↔</span>
                <span className="shrink-0">{tr.natalName}</span>
                <span className="min-w-0 flex-1 break-words">{relStrs.join(', ')}</span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
