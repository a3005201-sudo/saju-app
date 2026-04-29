import type { NatalAspect } from '@orrery/core/types'
import { PLANET_SYMBOLS, ASPECT_SYMBOLS } from '@orrery/core/natal'
import { useLocale } from '../../i18n/index.ts'

interface Props {
  aspects: NatalAspect[]
}

export default function AspectGrid({ aspects }: Props) {
  const { t } = useLocale()
  const top = aspects.slice(0, 15)

  return (
    <div>
      <h3 className="text-lg font-semibold text-rose-700 dark:text-rose-300 mb-2">주요 각 (Major Aspects)</h3>
      <div className="space-y-1">
        {top.map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-lg py-1">
            <span className="w-5 text-center">{PLANET_SYMBOLS[a.planet1]}</span>
            <span className="text-gray-500 dark:text-gray-400 w-12">{t(`planet.${a.planet1}`)}</span>
            <span className="w-4 text-center">{ASPECT_SYMBOLS[a.type]}</span>
            <span className="w-5 text-center">{PLANET_SYMBOLS[a.planet2]}</span>
            <span className="text-gray-500 dark:text-gray-400 w-12">{t(`planet.${a.planet2}`)}</span>
            <span className="ml-auto font-mono text-gray-400 dark:text-gray-500 text-sm">
              orb {a.orb.toFixed(1)}°
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
