import type { JwaEntry, PillarDetail } from '@orrery/core/types'
import { stemColorClass } from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import { charWithKorean, withSajuKorean } from '../../utils/saju-labels.ts'

interface Props {
  jwabeop: JwaEntry[][]   // [시, 일, 월, 년]
  pillars: PillarDetail[]
  unknownTime?: boolean
}

const LABELS = ['時柱', '日柱', '月柱', '年柱']

export default function JwabeopChart({ jwabeop, pillars, unknownTime }: Props) {
  const { t } = useLocale()
  // 최대 지장간 수 (행 수)
  const maxRows = Math.max(...jwabeop.map(entries => entries.length))
  if (maxRows === 0) return null

  return (
    <section>
      <h3 className="text-lg sm:text-xl font-semibold text-violet-700 dark:text-violet-300 mb-2">{withSajuKorean('坐法')}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">{t('saju.jwabeop.desc')}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-center text-lg font-hanja min-w-[760px]">
          <thead>
            <tr className="text-base text-gray-500 dark:text-gray-400">
              {LABELS.map((label, i) => (
                <th key={label} className="py-1 px-2 font-normal">
                  {i === 0 && unknownTime ? '' : `${withSajuKorean(label)} ${charWithKorean(pillars[i].pillar.branch)}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }, (_, row) => (
              <tr key={row}>
                {jwabeop.map((entries, col) => {
                  if (col === 0 && unknownTime) {
                    return <td key={col} className="py-0.5 px-2 text-gray-300 dark:text-gray-600">?</td>
                  }
                  const entry = entries[row]
                  if (!entry) return <td key={col} className="py-0.5 px-2" />
                  return (
                    <td key={col} className="py-0.5 px-2">
                      <span className={`${stemColorClass(entry.stem)}`}>{charWithKorean(entry.stem)}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-base ml-1">{withSajuKorean(entry.sipsin)}</span>
                      <span className="text-gray-400 dark:text-gray-500 text-base ml-1">{withSajuKorean(entry.unseong)}坐(좌)</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
