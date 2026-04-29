import type { ZiweiChart } from '@orrery/core/types'
import { withKoreanLabel } from '../../utils/ziwei-labels.ts'

interface Props {
  chart: ZiweiChart
}

export default function SihuaSummary({ chart }: Props) {
  const siHuaInfo: Record<string, { star: string; palace: string } | null> = {
    '化祿': null, '化權': null, '化科': null, '化忌': null,
  }

  for (const palace of Object.values(chart.palaces)) {
    for (const star of palace.stars) {
      if (star.siHua) {
        siHuaInfo[star.siHua] = { star: star.name, palace: palace.name }
      }
    }
  }

  const colorMap: Record<string, string> = {
    '化祿': 'text-green-600 dark:text-green-400',
    '化權': 'text-yellow-600 dark:text-yellow-400',
    '化科': 'text-blue-600 dark:text-blue-400',
    '化忌': 'text-red-600 dark:text-red-400',
  }

  return (
    <section>
      <h3 className="text-lg sm:text-xl font-semibold text-emerald-700 dark:text-emerald-300 mb-3">{withKoreanLabel('四化')}</h3>
      <div className="space-y-1.5">
        {Object.entries(siHuaInfo).map(([huaType, info]) => {
          if (!info) return null
          return (
            <div key={huaType} className="text-lg text-gray-700 dark:text-gray-200">
              <span className={colorMap[huaType] || ''}>{withKoreanLabel(huaType)}</span>
              <span className="text-gray-400 dark:text-gray-500 mx-1">:</span>
              <span className="font-hanja">{withKoreanLabel(info.star)}</span>
              <span className="text-gray-400 dark:text-gray-500 mx-1">→</span>
              <span>{withKoreanLabel(info.palace)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
