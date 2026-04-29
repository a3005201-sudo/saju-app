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

interface Props {
  pillars: PillarDetail[]  // [시, 일, 월, 년]
  unknownTime?: boolean
  gongmang: Gongmang
}

export default function PillarTable({ pillars, unknownTime, gongmang }: Props) {
  const { t } = useLocale()
  const gmSet = new Set(gongmang.branches)
  const labels = ['時柱', '日柱', '月柱', '年柱']

  return (
    <div className="overflow-x-auto">
      <p className="sm:hidden mb-2 text-xs text-slate-500 dark:text-slate-400">
        👉 좌 &lt;----&gt; 우 로 밀어서 전체 보기
      </p>
      <table className="w-full text-center text-lg min-w-[880px]">
        <thead>
          <tr className="text-base text-gray-500 dark:text-gray-400">
            <td className="py-1 pr-2 text-right w-12"></td>
            {labels.map(label => (
              <th key={label} className="py-1 px-1 sm:px-3 font-normal">{withSajuKorean(label)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="font-hanja">
          {/* 천간 십신 */}
          <tr className="text-base text-gray-600 dark:text-gray-300">
            <td className="pr-2 text-right text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.sipsin')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : stemColorClass(p.pillar.stem)}`}>
                {i === 0 && unknownTime ? '?' : withSajuKorean(p.stemSipsin)}
              </td>
            ))}
          </tr>

          {/* 천간 */}
          <tr className="text-2xl sm:text-3xl">
            <td className="pr-2 text-right text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.cheongan')}</td>
            {pillars.map((p, i) => (
              <td key={i} className="py-1 px-1 sm:px-3">
                {i === 0 && unknownTime
                  ? <span className="inline-flex items-center justify-center w-12 h-12 leading-none rounded pb-[3px] bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600">?</span>
                  : <span className={`inline-flex items-center justify-center w-12 h-12 leading-none rounded pb-[3px] ${stemSolidBgClass(p.pillar.stem)}`}>{p.pillar.stem}</span>
                }
                {!(i === 0 && unknownTime) && <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{charWithKorean(p.pillar.stem)}</div>}
              </td>
            ))}
          </tr>

          {/* 지지 */}
          <tr className="text-2xl sm:text-3xl">
            <td className="pr-2 text-right text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.jiji')}</td>
            {pillars.map((p, i) => (
              <td key={i} className="py-1 px-1 sm:px-3">
                {i === 0 && unknownTime
                  ? <span className="inline-flex items-center justify-center w-12 h-12 leading-none rounded pb-[3px] bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600">?</span>
                  : <span className={`inline-flex items-center justify-center w-12 h-12 leading-none rounded pb-[3px] ${branchSolidBgClass(p.pillar.branch)}`}>{p.pillar.branch}</span>
                }
                {!(i === 0 && unknownTime) && <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{charWithKorean(p.pillar.branch)}</div>}
              </td>
            ))}
          </tr>

          {/* 지지 십신 */}
          <tr className="text-base text-gray-600 dark:text-gray-300">
            <td className="pr-2 text-right text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.sipsin')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : branchColorClass(p.pillar.branch)}`}>
                {i === 0 && unknownTime ? '?' : withSajuKorean(p.branchSipsin)}
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
          <tr className="text-base text-gray-600 dark:text-gray-300">
            <td className="pr-2 text-right text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.unseong')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : ''}`}>
                {i === 0 && unknownTime ? '?' : withSajuKorean(p.unseong)}
              </td>
            ))}
          </tr>

          {/* 신살 */}
          <tr className="text-base text-gray-600 dark:text-gray-300">
            <td className="pr-2 text-right text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.sinsal')}</td>
            {pillars.map((p, i) => (
              <td key={i} className={`py-0.5 px-1 sm:px-3 ${i === 0 && unknownTime ? 'text-gray-300 dark:text-gray-600' : ''}`}>
                {i === 0 && unknownTime ? '?' : withSajuKorean(p.sinsal)}
              </td>
            ))}
          </tr>

          {/* 지장간 */}
          <tr className="text-sm">
            <td className="pr-2 text-right text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.janggan')}</td>
            {pillars.map((p, i) => (
              <td key={i} className="py-0.5 px-1 sm:px-3">
                {i === 0 && unknownTime
                  ? <span className="text-gray-300 dark:text-gray-600">?</span>
                  : <span className="inline-flex gap-0.5 justify-center">
                      {[...p.jigang].map((ch, j) =>
                        ch === ' '
                          ? <span key={j} className="inline-block w-4" />
                          : <span key={j} className={`inline-flex items-center justify-center w-4 h-4 leading-none rounded-sm pb-px ${elementSolidBgClass(stemElement(ch))}`}>{ch}</span>
                      )}
                    </span>
                }
              </td>
            ))}
          </tr>
          {/* 공망 */}
          <tr className="text-sm text-gray-600 dark:text-gray-300">
            <td className="pr-2 text-right text-gray-400 dark:text-gray-500 whitespace-nowrap">{t('saju.gongmang')}</td>
            {pillars.map((p, i) => {
              const isGm = i !== 1 && gmSet.has(p.pillar.branch)
              const isUnknown = i === 0 && unknownTime
              return (
                <td key={i} className={`py-0.5 px-1 sm:px-3 ${isUnknown ? 'text-gray-300 dark:text-gray-600' : ''}`}>
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
