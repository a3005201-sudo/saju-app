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
import ReturnLuckSheet from './ReturnLuckSheet.tsx'
import { useLocale } from '../i18n/index.ts'
import SajuView from './saju/SajuView.tsx'
import ZiweiView from './ziwei/ZiweiView.tsx'
import NatalView from './natal/NatalView.tsx'
import { calculateSaju } from '@orrery/core/saju'
import { createChart } from '@orrery/core/ziwei'
import { calculateNatal } from '@orrery/core/natal'
import { sajuToText, ziweiToText, natalToText } from '../utils/text-export.ts'
import type { BirthInput } from '@orrery/core/types'
import { COUPANG_FIXED_AFFILIATE_URL, isCoupangAffiliateUrl } from '../constants/affiliate.ts'

type Tab = 'saju' | 'ziwei' | 'natal'

export default function App() {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>('saju')
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null)
  const [bestItemUrl, setBestItemUrl] = useState('')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [externalFormState, setExternalFormState] = useState<SavedFormState | null>(null)
  const birthFormRef = useRef<BirthFormHandle>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const aiLaunchedAtRef = useRef(0)
  const [showReturnSheet, setShowReturnSheet] = useState(false)

  useEffect(() => {
    function handleReturn() {
      if (document.visibilityState !== 'visible' || !aiLaunchedAtRef.current) return
      if (Date.now() - aiLaunchedAtRef.current < 1500) return
      aiLaunchedAtRef.current = 0
      setShowReturnSheet(true)
    }
    document.addEventListener('visibilitychange', handleReturn)
    window.addEventListener('focus', handleReturn)
    return () => {
      document.removeEventListener('visibilitychange', handleReturn)
      window.removeEventListener('focus', handleReturn)
    }
  }, [])

  function handleSubmit(input: BirthInput, opts?: { manual?: boolean }) {
    setBirthInput(input)
    if (opts?.manual) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }

  useEffect(() => {
    // 모바일에서 새 접속 시 항상 상단부터 시작
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const handleLuckLinkChange = useCallback(({ bestItemUrl: url }: { bestItemUrl: string }) => {
    setBestItemUrl(url)
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

  const tabClass = (active: boolean) =>
    `flex-1 sm:flex-none px-3 sm:px-5 py-2 text-sm sm:text-base font-semibold whitespace-nowrap rounded-lg transition-colors ${
      active
        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-amber-200 shadow-sm'
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
    }`

  const aiPanel = birthInput && (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm">
      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">🤖 AI에게 내 사주 쉽게 풀이 받기 (무료)</h2>
      <ol className="mt-2 space-y-1 text-sm sm:text-[15px] text-slate-600 dark:text-slate-300">
        <li><b className="text-slate-900 dark:text-slate-100">1.</b> 평소 쓰는 AI 버튼을 누르세요. 내 사주 정보가 자동 복사되고, 휴대폰은 쓰던 AI 앱이 바로 열려요.</li>
        <li><b className="text-slate-900 dark:text-slate-100">2.</b> AI 입력창을 <b>길게 눌러 &lsquo;붙여넣기&rsquo;</b> 후 보내기</li>
        <li><b className="text-slate-900 dark:text-slate-100">3.</b> AI가 보여주는 메뉴에서 궁금한 번호(재물운, 연애운 등)를 고르면 끝!</li>
      </ol>
      <div className="mt-4">
        <AiLaunchButtons
          variant="large"
          textKey={JSON.stringify(birthInput)}
          onLaunched={() => { aiLaunchedAtRef.current = Date.now() }}
          affiliateUrl={
            isCoupangAffiliateUrl(bestItemUrl)
              ? bestItemUrl
              : COUPANG_FIXED_AFFILIATE_URL
          }
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
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        모바일에서 붙여넣기가 링크만 들어가면 &lsquo;해석용 글만 복사하기&rsquo;를 누른 뒤 다시 붙여넣어 주세요.
      </p>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </section>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-amber-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 text-gray-900 dark:text-gray-100 relative">
      <ThemeToggle />
      <LanguageToggle />
      <InstallAppButton />
      <a
        href="https://github.com/rath/orrery"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-0 right-0 z-50 hidden sm:block"
        aria-label="View source on GitHub"
      >
        <svg width="60" height="60" viewBox="0 0 250 250" className="fill-gray-700 text-white" aria-hidden="true">
          <path d="M0 0l115 115h15l12 27 108 108V0z" />
          <path d="M128.3 109c-14.5-9.3-9.3-19.4-9.3-19.4 3-6.9 1.5-11 1.5-11-1.3-6.6 2.9-2.3 2.9-2.3 3.9 4.6 2.1 11 2.1 11-2.6 10.3 5.1 14.6 8.9 15.9" fill="currentColor" style={{ transformOrigin: '130px 106px' }} />
          <path d="M115 115c-.1.1 3.7 1.5 4.8.4l13.9-13.8c3.2-2.4 6.2-3.2 8.5-3 -8.4-10.6-14.7-24.2 1.6-40.6 4.7-4.6 10.2-6.8 15.9-7 .6-1.6 3.5-7.4 11.7-10.9 0 0 4.7 2.4 7.4 16.1 4.3 2.4 8.4 5.6 12.1 9.2 3.6 3.6 6.8 7.8 9.2 12.2 13.7 2.6 16.2 7.3 16.2 7.3-3.6 8.2-9.4 11.1-10.9 11.7-.3 5.8-2.4 11.2-7.1 15.9-16.4 16.4-29.4 11.6-36.4 8.8 .2 2.8-1 6.8-5 10.8L141 136.5c-1.2 1.2.6 5.4.8 5.3z" fill="currentColor" />
        </svg>
      </a>
      <main className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-10 py-5 sm:py-8">
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-4xl sm:text-7xl lg:text-8xl leading-[1.1] font-black bg-gradient-to-r from-slate-900 via-blue-900 to-amber-500 dark:from-slate-100 dark:via-blue-200 dark:to-amber-300 bg-clip-text text-transparent tracking-tight">
            {t('app.mainTitle')}
          </h1>
          <p className="mt-2 sm:mt-3 text-[15px] sm:text-2xl font-bold text-amber-700 dark:text-amber-300">
            {t('app.mainTitleSub')}
          </p>
          <p className="hidden sm:block mt-3 text-lg text-slate-600 dark:text-slate-300 tracking-wide">
            {t('app.subtitle1')} <span className="font-medium text-gray-700 dark:text-gray-200">{t('app.subtitle.tool')}</span> {t('app.subtitle2')}
          </p>
          <p className="hidden sm:block text-base text-slate-500 dark:text-slate-400 mt-1">{t('app.subtitle3')}</p>
          <ol className="mt-4 mx-auto grid max-w-xl grid-cols-3 gap-1.5 sm:gap-3 text-left">
            {[
              { n: '1', title: '생년월일 입력', desc: '시간 몰라도 OK' },
              { n: '2', title: '내 사주 보기', desc: '성격·오행·운 요약' },
              { n: '3', title: 'AI로 쉽게 풀이', desc: '재물·연애·올해운' },
            ].map(step => (
              <li key={step.n} className="rounded-xl border border-amber-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-2 py-2 sm:px-3">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{step.n}</span>
                <p className="mt-1 text-[13px] sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{step.title}</p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight">{step.desc}</p>
              </li>
            ))}
          </ol>
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

        {birthInput && (
          <div ref={resultRef} className="scroll-mt-3">
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mt-6 mb-4 sm:inline-flex">
              <button className={tabClass(tab === 'saju')} onClick={() => setTab('saju')}>
                {t('app.tab.saju')}
              </button>
              <button className={tabClass(tab === 'ziwei')} onClick={() => setTab('ziwei')}>
                {t('app.tab.ziwei')}
              </button>
              <button className={tabClass(tab === 'natal')} onClick={() => setTab('natal')}>
                {t('app.tab.natal')}
              </button>
            </div>

            {tab === 'saju' && <SajuView input={birthInput} bestItemUrl={bestItemUrl} onLuckLinkChange={handleLuckLinkChange} aiPanel={aiPanel} />}
            {tab === 'ziwei' && (
              <div className="space-y-5">
                {aiPanel}
                <ZiweiView input={birthInput} />
              </div>
            )}
            {tab === 'natal' && (
              <div className="space-y-5">
                {aiPanel}
                <NatalView input={birthInput} />
              </div>
            )}

            <section className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
              <p className="mb-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">친구·가족에게도 무료 사주를 알려주세요</p>
              <LinkShareButtons
                shareUrl={((import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim()) || (typeof window !== 'undefined' ? window.location.origin : '[Vercel 주소]')}
                shareText="누구나 평생 무료 사주 - 사주팔자/자미두수/출생차트"
              />
            </section>
          </div>
        )}

        <Guide />
      </main>
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-6">
        <p>&copy; 2026 Jang-Ho Hwang &middot; <a href="https://x.com/xrath" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300">@xrath</a> &middot; <a href="https://x.com/xrath/status/2022548658562937028" target="_blank" rel="noopener noreferrer" className="hover:text-gray-600 dark:hover:text-gray-300">{t('app.intro')}</a></p>
      </footer>
      <ReturnLuckSheet
        open={showReturnSheet && !!birthInput}
        onClose={() => setShowReturnSheet(false)}
        luckItemsAnchorId={tab === 'saju' ? 'luck-items' : undefined}
        affiliateUrl={isCoupangAffiliateUrl(bestItemUrl) ? bestItemUrl : COUPANG_FIXED_AFFILIATE_URL}
      />
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        getCurrentFormState={getCurrentFormState}
        onSelect={setExternalFormState}
      />
    </div>
  )
}
