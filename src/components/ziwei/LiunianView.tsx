import { useState, useMemo } from 'react'
import { calculateLiunian } from '@orrery/core/ziwei'
import type { ZiweiChart } from '@orrery/core/types'
import { MAIN_STAR_NAMES } from '@orrery/core/constants'
import { withKoreanLabel } from '../../utils/ziwei-labels.ts'

interface Props {
  chart: ZiweiChart
}

const LUNAR_MONTH_NAMES = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '臘月',
]

function getMainStarsAtZhi(chart: ZiweiChart, zhi: string): string[] {
  for (const palace of Object.values(chart.palaces)) {
    if (palace.zhi === zhi) {
      return palace.stars
        .filter(s => MAIN_STAR_NAMES.has(s.name))
        .map(s => s.name)
    }
  }
  return []
}

export default function LiunianView({ chart }: Props) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)

  const liunian = useMemo(() => calculateLiunian(chart, year), [chart, year])

  const colorMap: Record<string, string> = {
    '化祿': 'text-green-600 dark:text-green-400',
    '化權': 'text-yellow-600 dark:text-yellow-400',
    '化科': 'text-blue-600 dark:text-blue-400',
    '化忌': 'text-red-600 dark:text-red-400',
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-sky-700 dark:text-sky-300">{withKoreanLabel('流年')}</h3>
        <input
          type="number"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          min={chart.solarYear}
          max={chart.solarYear + 100}
          className="w-20 text-base border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 text-gray-700 dark:text-gray-200"
        />
        <span className="text-base text-gray-500 dark:text-gray-400 font-hanja">{liunian.gan}{liunian.zhi}년</span>
      </div>

      {/* 대한 정보 */}
      <div className="text-lg text-gray-700 dark:text-gray-200 mb-2">
        <span className="font-semibold text-sky-700 dark:text-sky-300">{withKoreanLabel('大限')}</span>
        <span className="text-gray-400 dark:text-gray-500 mx-1">:</span>
        {liunian.daxianAgeStart}-{liunian.daxianAgeEnd}세 {withKoreanLabel(liunian.daxianPalaceName)}
      </div>

      {/* 유년 명궁 */}
      <div className="text-lg text-gray-700 dark:text-gray-200 mb-3">
        <span className="font-semibold text-sky-700 dark:text-sky-300">{withKoreanLabel('流年命宮')}</span>
        <span className="text-gray-400 dark:text-gray-500 mx-1">:</span>
        <span className="font-hanja">{liunian.mingGongZhi}</span>궁 → 본명 {withKoreanLabel(liunian.natalPalaceAtMing)}
        <span className="text-gray-400 dark:text-gray-500 ml-1">
          ({getMainStarsAtZhi(chart, liunian.mingGongZhi).map(withKoreanLabel).join(', ') || withKoreanLabel('空宮')})
        </span>
      </div>

      {/* 유년 사화 */}
      <div className="mb-3">
        <div className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-1">{withKoreanLabel('流年四化')}</div>
        <div className="space-y-1">
          {['化祿', '化權', '化科', '化忌'].map(huaType => {
            let starName = ''
            for (const [s, h] of Object.entries(liunian.siHua)) {
              if (h === huaType) { starName = s; break }
            }
            const palaceName = liunian.siHuaPalaces[huaType] || '?'
            if (!starName) return null
            return (
              <div key={huaType} className="text-lg text-gray-700 dark:text-gray-200">
                <span className={colorMap[huaType]}>{withKoreanLabel(huaType)}</span>
                <span className="text-gray-400 dark:text-gray-500 mx-1">:</span>
                <span className="font-hanja">{withKoreanLabel(starName)}</span>
                <span className="text-gray-400 dark:text-gray-500 mx-1">→</span>
                <span>{withKoreanLabel(palaceName)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 유월 */}
      <div>
        <div className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-1">{withKoreanLabel('流月運勢')}</div>
        <div className="space-y-1">
          {liunian.liuyue.map(ly => {
            const stars = getMainStarsAtZhi(chart, ly.mingGongZhi)
            const hasMain = stars.length > 0
            return (
              <div
                key={ly.month}
              className={`text-lg ${hasMain ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}
              >
                <span className="w-20 inline-block">{withKoreanLabel(LUNAR_MONTH_NAMES[ly.month - 1])}</span>
                <span className="font-hanja text-sm text-gray-400 dark:text-gray-500 mx-1">({ly.mingGongZhi})</span>
                <span className="mr-1">{withKoreanLabel(ly.natalPalaceName)}</span>
                <span className="text-gray-500 dark:text-gray-400 text-base">
                  {hasMain ? `- ${stars.map(withKoreanLabel).join(', ')}` : `- (${withKoreanLabel('空宮')})`}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
