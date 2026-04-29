import { useCallback, useEffect, useRef, useState } from 'react'
import BirthForm from './BirthForm.tsx'
import type { BirthFormHandle, SavedFormState } from './BirthForm.tsx'
import ProfileModal from './ProfileModal.tsx'
import Guide from './Guide.tsx'
import AiLaunchButtons from './AiLaunchButtons.tsx'
import LinkShareButtons from './LinkShareButtons.tsx'
import ThemeToggle from './ThemeToggle.tsx'
import LanguageToggle from './LanguageToggle.tsx'
import InstallAppButton from './InstallAppButton.tsx'
import { useLocale } from '../i18n/index.ts'
import SajuView from './saju/SajuView.tsx'
import ZiweiView from './ziwei/ZiweiView.tsx'
import NatalView from './natal/NatalView.tsx'
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'
import { sajuToText, ziweiToText, natalToText } from '../utils/text-export.ts'
import type { BirthInput } from '@orrery/core/types'

type Tab = 'saju' | 'ziwei' | 'natal'

export default function App() {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>('saju')
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  const [bestItemUrl, setBestItemUrl] = useState('')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [externalFormState, setExternalFormState] = useState<SavedFormState | null>(null)
  const birthFormRef = useRef<BirthFormHandle>(null)

  function handleSubmit(input: BirthInput) {
    setBirthInput(input)
  }

  useEffect(() => {
    // 모바일에서 새 접속 시 항상 상단부터 시작
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const getCurrentFormState = useCallback(() => {
    return birthFormRef.current?.getCurrentState() ?? null
  }, [])

  const aiPromptHeader = [
    '아래 명식 데이터를 바탕으로 전문가처럼 해석해주세요.',
    '답변은 반드시 2단계로 진행해주세요.',
    '1단계) 먼저 아래 메뉴를 간단히 보여주고, 사용자가 번호를 고르게 해주세요.',
    '[메뉴]',
    '1. 타고난 성향/강점/약점',
    '2. 재물운/직업운',
    '3. 연애운/인간관계',
    '4. 올해운/3개월 운세',
    '5. 피해야 할 습관과 보완법',
    '6. 종합 전체 해석',
    '2단계) 사용자가 번호를 입력하면 해당 항목만 상세하게 풀어주세요.',
    '공통 규칙: 쉬운 한국어, 근거(명식 요소)를 짧게 포함, 과장/단정 금지.',
  ].join('\n')
  const copyVersionTag = '[ORRERY_COPY_2026-04-29_1416]'
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-amber-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-gray-900 dark:text-gray-100 relative">
      <ThemeToggle />
      <LanguageToggle />
      <InstallAppButton />
      <a
        href="https://github.com/rath/orrery"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-0 right-0 z-50"
        aria-label="View source on GitHub"
      >
        <svg width="60" height="60" viewBox="0 0 250 250" className="fill-gray-700 text-white" aria-hidden="true">
          <path d="M0 0l115 115h15l12 27 108 108V0z" />
          <path d="M128.3 109c-14.5-9.3-9.3-19.4-9.3-19.4 3-6.9 1.5-11 1.5-11-1.3-6.6 2.9-2.3 2.9-2.3 3.9 4.6 2.1 11 2.1 11-2.6 10.3 5.1 14.6 8.9 15.9" fill="currentColor" style={{ transformOrigin: '130px 106px' }} />
          <path d="M115 115c-.1.1 3.7 1.5 4.8.4l13.9-13.8c3.2-2.4 6.2-3.2 8.5-3 -8.4-10.6-14.7-24.2 1.6-40.6 4.7-4.6 10.2-6.8 15.9-7 .6-1.6 3.5-7.4 11.7-10.9 0 0 4.7 2.4 7.4 16.1 4.3 2.4 8.4 5.6 12.1 9.2 3.6 3.6 6.8 7.8 9.2 12.2 13.7 2.6 16.2 7.3 16.2 7.3-3.6 8.2-9.4 11.1-10.9 11.7-.3 5.8-2.4 11.2-7.1 15.9-16.4 16.4-29.4 11.6-36.4 8.8 .2 2.8-1 6.8-5 10.8L141 136.5c-1.2 1.2.6 5.4.8 5.3z" fill="currentColor" />
        </svg>
      </a>
      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl leading-[1.05] font-black bg-gradient-to-r from-slate-900 via-blue-900 to-amber-500 dark:from-slate-100 dark:via-blue-200 dark:to-amber-300 bg-clip-text text-transparent tracking-tight">
            {t('app.mainTitle')}
          </h1>
          <p className="mt-3 text-base sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
            {t('app.mainTitleSub')}
          </p>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 tracking-wide">
            {t('app.subtitle1')}<br className="sm:hidden" /> <span className="font-medium text-gray-700 dark:text-gray-200">{t('app.subtitle.tool')}</span> {t('app.subtitle2')}
          </p>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">{t('app.subtitle3')}</p>
        </div>
        <BirthForm
          ref={birthFormRef}
          onSubmit={handleSubmit}
          externalState={externalFormState}
          onExternalStateConsumed={() => setExternalFormState(null)}
        />
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            {t('app.profileManage')}
          </button>
        </div>

        <Guide />

        {birthInput && (
          <>
            <div className="mb-2 rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-900/20 px-3 py-2 text-center">
              <p className="text-sm sm:text-base font-semibold text-amber-800 dark:text-amber-300">
                결과 쉽게 보기: <span className="underline decoration-amber-500 decoration-2 underline-offset-2">AI 버튼을 누르면 해석용 글이 먼저 복사되고 ChatGPT 등이 열립니다</span>. 채팅창에 붙여넣을 때는 <span className="underline decoration-amber-500 decoration-2 underline-offset-2">전체가 들어가는지</span> 확인해 주세요(모바일은 링크만 잡히는 경우가 있어, 필요하면 「종합 AI 해석 복사」 후 붙여넣기).
              </p>
            </div>

            {/* 탭 + AI + 쿠팡 링크 (같은 라인) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-center border-b border-amber-200 dark:border-slate-700 mt-6 mb-4 gap-2">
              <div className="flex items-center">
                <button
                  className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    tab === 'saju'
                      ? 'border-amber-500 text-slate-900 dark:border-amber-300 dark:text-amber-200'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  onClick={() => setTab('saju')}
                >
                  {t('app.tab.saju')}
                </button>
                <button
                  className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    tab === 'ziwei'
                      ? 'border-amber-500 text-slate-900 dark:border-amber-300 dark:text-amber-200'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  onClick={() => setTab('ziwei')}
                >
                  {t('app.tab.ziwei')}
                </button>
                <button
                  className={`px-2 sm:px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-colors ${
                    tab === 'natal'
                      ? 'border-amber-500 text-slate-900 dark:border-amber-300 dark:text-amber-200'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                  onClick={() => setTab('natal')}
                >
                  {t('app.tab.natal')}
                </button>
              </div>
              <div className="flex justify-center lg:pb-1">
                <AiLaunchButtons
                  getText={async () => {
                    const saju = calculateSaju(birthInput)
                    const parts = [sajuToText(saju)]
                    if (!birthInput.unknownTime) {
                      const chart = createChart(
                        birthInput.year, birthInput.month, birthInput.day,
                        birthInput.hour,
                        birthInput.minute,
                        birthInput.gender === 'M',
                        birthInput.timezone,
                        birthInput.longitude,
                      )
                      parts.push(ziweiToText(chart))
                    }
                    const natal = await calculateNatal(birthInput)
                    parts.push(natalToText(natal))
                    return `${copyVersionTag}\n${aiPromptHeader}\n\n${parts.join('\n\n')}`
                  }}
                />
              </div>
            </div>
            <div className="mb-4">
              <LinkShareButtons
                shareUrl={((import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim()) || (typeof window !== 'undefined' ? window.location.origin : '[Vercel 주소]')}
                shareText="누구나 평생 무료 사주 - 사주팔자/자미두수/출생차트"
                compact
              />
            </div>

            {tab === 'saju' && <SajuView input={birthInput} bestItemUrl={bestItemUrl} onLuckLinkChange={({ bestItemUrl: url }) => setBestItemUrl(url)} />}
            {tab === 'ziwei' && <ZiweiView input={birthInput} />}
            {tab === 'natal' && <NatalView input={birthInput} />}
          </>
        )}
      </main>
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
        <p>&copy; 2026 Jang-Ho Hwang &middot; <a href="https://x.com/xrath" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300">@xrath</a> &middot; <a href="https://x.com/xrath/status/2022548658562937028" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300">{t('app.intro')}</a></p>
      </footer>
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        getCurrentFormState={getCurrentFormState}
        onSelect={setExternalFormState}
      />
    </div>
  )
}
