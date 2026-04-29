import { useMemo } from 'react'
import { createChart } from '@orrery/core/ziwei'
import MingPanGrid from './MingPanGrid.tsx'
import SihuaSummary from './SihuaSummary.tsx'
import DaxianTable from './DaxianTable.tsx'
import LiunianView from './LiunianView.tsx'
import type { BirthInput } from '@orrery/core/types'
import { useLocale } from '../../i18n/index.ts'
import { withKoreanLabel } from '../../utils/ziwei-labels.ts'
import LinkShareButtons from '../LinkShareButtons.tsx'

interface Props {
  input: BirthInput
}

export default function ZiweiView({ input }: Props) {
  const { t } = useLocale()
  const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim()
    || (typeof window !== 'undefined' ? window.location.origin : '[Vercel 주소]')

  if (input.unknownTime) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-base text-amber-800 dark:text-amber-300 font-medium">
          {t('ziwei.needTime')}
        </p>
        <p className="text-base text-amber-600 dark:text-amber-400 mt-1">
          {t('ziwei.needTimeDesc')}
        </p>
      </div>
    )
  }

  const chart = useMemo(
    () => createChart(
      input.year, input.month, input.day,
      input.hour, input.minute, input.gender === 'M', input.timezone, input.longitude,
    ),
    [input],
  )

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <LinkShareButtons
          shareUrl={publicAppUrl}
          shareText={`${withKoreanLabel('紫微斗數')} 결과를 확인해보세요!`}
        />
      </section>

      {/* 命盤 그리드 (기본 정보 + 12궁) */}
      <div className="bg-gradient-to-br from-white to-indigo-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-indigo-100 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-700 dark:text-indigo-300">
            {withKoreanLabel('紫微斗數')} {withKoreanLabel('命宮')}
          </h2>
        </div>
        <MingPanGrid chart={chart} />
      </div>

      {/* 사화 */}
      <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-emerald-100 dark:border-gray-700 p-5 shadow-sm">
        <SihuaSummary chart={chart} />
      </div>

      {/* 대한 */}
      <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-amber-100 dark:border-gray-700 p-5 shadow-sm">
        <DaxianTable chart={chart} />
      </div>

      {/* 유년 */}
      <div className="bg-gradient-to-br from-white to-sky-50 dark:from-gray-900 dark:to-gray-900/70 rounded-xl border border-sky-100 dark:border-gray-700 p-5 shadow-sm">
        <LiunianView chart={chart} />
      </div>
    </div>
  )
}
