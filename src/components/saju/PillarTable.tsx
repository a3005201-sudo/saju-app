import type { PillarDetail, Gongmang } from '@orrery/core/types'
import {
  stemColorClass,
  branchColorClass,
  stemSolidBgClass,
  branchSolidBgClass,
  elementSolidBgClass,
  stemElement,
} from '../../utils/format.ts'
import { useLocale } from '../../i18n/index.ts'
import { charWithKorean, withSajuKorean } from '../../utils/saju-labels.ts'
import { sipsinKo } from '../../utils/saju-summary.ts'

interface Props {
  pillars: PillarDetail[]  // [시, 일, 월, 년]
  unknownTime?: boolean
  gongmang: Gongmang
}

const cellClass = 'py-0.5 px-0.5 sm:px-3'
const labelClass = 'pr-1 sm:pr-2 text-right text-xs sm:text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap'
const boxClass = 'inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 leading-none rounded pb-[3px]'

function SipsinLabel({ hanja }: { hanja: string }) {
  const ko = sipsinKo(hanja)
  return (
    <>
      {hanja}
      {ko && <span className="block font-sans text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-tight">{ko}</span>}
    </>
  )
}

export default function PillarTable({ pillars, unknownTime, gongmang }: Props) {
  const { t } = useLocale()
  const gmSet = new Set(gongmang.branches)
  const labels = ['時柱', '日柱', '月柱', '年柱']
  const subLabels = ['태어난 시', '태어난 날 (나)', '태어난 달', '태어난 해']

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed text-center text-base sm:text-lg">
        <colgroup>
          <col className="w-9 sm:w-14" />
          <col /><col /><col /><col />
        </colgroup>
        <thead>
          <tr className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            <td className="py-1"></td>
            {labels.map((label, i) => (
              <th key={label} className={`py-1 px-0.5 sm:px-3 font-normal leading-tight ${i === 1 ? 'text-amber-700 dark:text-amber-300 font-semibold' : ''}`}>
                {withSajuKorean(label)}
                <span className="block text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">{subLabels[i]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-hanja">
          {/* 천간 십신 */}
          <tr className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <td className={labelClass}>{t('saju.sipsin')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`${cellClass} ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : stemColorClass(p.pillar.stem)}`}>
                {i === 0 && unknownTime ? '?' : i === 1 ? <span className="font-sans font-semibold text-amber-700 dark:text-amber-300">나</span> : <SipsinLabel hanja={p.stemSipsin} />}
              </td>
            ))}
          </tr>

          {/* 천간 */}
          <tr className="text-2xl sm:text-3xl">
            <td className={labelClass}>{t('saju.cheongan')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-1 ${cellClass}`}>
                {i === 0 && unknownTime
                  ? <span className={`${boxClass} bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600`}>?</span>
                  : <span className={`${boxClass} ${stemSolidBgClass(p.pillar.stem)} ${i === 1 ? 'ring-[3px] ring-amber-400 ring-offset-2 dark:ring-offset-gray-900' : ''}`}>{p.pillar.stem}</span>
                }
                {!(i === 0 && unknownTime) && <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{charWithKorean(p.pillar.stem)}</div>}
              </td>
            ))}
          </tr>

          {/* 지지 */}
          <tr className="text-2xl sm:text-3xl">
            <td className={labelClass}>{t('saju.jiji')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-1 ${cellClass}`}>
                {i === 0 && unknownTime
                  ? <span className={`${boxClass} bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600`}>?</span>
                  : <span className={`${boxClass} ${branchSolidBgClass(p.pillar.branch)}`}>{p.pillar.branch}</span>
                }
                {!(i === 0 && unknownTime) && <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{charWithKorean(p.pillar.branch)}</div>}
              </td>
            ))}
          </tr>

          {/* 지지 십신 */}
          <tr className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <td className={labelClass}>{t('saju.sipsin')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`${cellClass} ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : branchColorClass(p.pillar.branch)}`}>
                {i === 0 && unknownTime ? '?' : <SipsinLabel hanja={p.branchSipsin} />}
              </td>
            ))}
          </tr>

          {/* 구분선 */}
          <tr>
            <td colSpan={5} className="py-1">
              <div className="border-t border-gray-200 dark:border-gray-700" />
            </td>
          </tr>

          {/* 운성 */}
          <tr className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <td className={labelClass}>{t('saju.unseong')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`${cellClass} ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : ''}`}>
                {i === 0 && unknownTime ? '?' : withSajuKorean(p.unseong)}
              </td>
            ))}
          </tr>

          {/* 신살 */}
          <tr className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <td className={labelClass}>{t('saju.sinsal')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`${cellClass} ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : ''}`}>
                {i === 0 && unknownTime ? '?' : withSajuKorean(p.sinsal)}
              </td>
            ))}
          </tr>

          {/* 지장간 */}
          <tr className="text-xs sm:text-sm">
            <td className={labelClass}>{t('saju.janggan')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={cellClass}>
                {i === 0 && unknownTime
                  ? <span className="text-gray-300 dark:text-gray-600">?</span>
                  : <span className="inline-flex gap-0.5 justify-center">
                      {[...p.jigang].map((ch, j) =>
                        ch === ' '
                          ? <span key={j} className="inline-block w-3 sm:w-4" />
                          : <span key={j} className={`inline-flex items-center justify-center w-4 h-4 leading-none rounded-sm pb-px ${elementSolidBgClass(stemElement(ch))}`}>{ch}</span>
                      )}
                    </span>
                }
              </td>
            ))}
          </tr>
          {/* 공망 */}
          <tr className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <td className={labelClass}>{t('saju.gongmang')}</td>
            {pillars.map((p, i) => {
              const isGm = i !== 1 && gmSet.has(p.pillar.branch)
              const isUnknown = i === 0 && unknownTime
              return (
                <td key={i} className={`${cellClass} ${isUnknown ? 'text-gray-300 dark:text-gray-600' : ''}`}>
                  {isUnknown ? '?' : isGm ? <span className="text-gray-600 dark:text-gray-300">{withSajuKorean('空亡')}</span> : ''}
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
