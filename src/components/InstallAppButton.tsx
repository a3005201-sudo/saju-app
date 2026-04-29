import { useCallback, useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    nav.standalone === true
  )
}

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const runInstall = useCallback(async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    } catch {
      // no-op
    }
  }, [deferredPrompt])

  const onClick = useCallback(() => {
    if (deferredPrompt) {
      void runInstall()
      return
    }
    setHelpOpen(true)
  }, [deferredPrompt, runInstall])

  if (installed) return null

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="fixed z-40 bottom-20 right-3 sm:bottom-4 sm:right-4
          inline-flex items-center gap-1.5 rounded-full border border-amber-400/80 dark:border-amber-600
          bg-amber-100/95 dark:bg-amber-950/90 px-3 py-2 sm:px-4 sm:py-2
          text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-100
          shadow-md hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
        title="홈 화면에 추가해 앱처럼 켜기"
      >
        <span aria-hidden>📲</span>
        <span className="sm:hidden">홈에 추가</span>
        <span className="hidden sm:inline">홈 화면에 추가</span>
      </button>

      {helpOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-help-title"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-xl dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="install-help-title" className="text-lg font-bold text-slate-900 dark:text-white">
              홈 화면에 저장하기
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              브라우저마다 버튼 이름이 조금 다릅니다. 아래 순서대로 하면 앱처럼 바로 열 수 있어요.
            </p>

            {isIOS() ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                <li>
                  <strong>Safari</strong>로 이 페이지를 엽니다. (다른 브라우저면 Safari로 복사해 열기)
                </li>
                <li>하단 <strong>공유</strong> 버튼(네모에 화살표)을 누릅니다.</li>
                <li>
                  아래로 스크롤해 <strong>홈 화면에 추가</strong>를 선택합니다.
                </li>
              </ol>
            ) : isAndroid() ? (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                <li>
                  <strong>Chrome</strong> 메뉴(⋮)를 엽니다.
                </li>
                <li>
                  <strong>홈 화면에 추가</strong> 또는 <strong>앱 설치</strong> / <strong>설치</strong>가 보이면 누릅니다.
                </li>
                <li>안 보이면 주소창 오른쪽의 설치 아이콘(+)이 있는지 확인합니다.</li>
              </ol>
            ) : (
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                <li>
                  <strong>Chrome</strong> 또는 <strong>Edge</strong> 주소창 오른쪽의 설치 아이콘(⊕ 또는 다운로드)을 누릅니다.
                </li>
                <li>또는 메뉴(⋮) → <strong>혼천의 설치</strong> / <strong>앱 설치</strong>를 선택합니다.</li>
              </ol>
            )}

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              이미 설치된 경우 이 버튼은 자동으로 숨겨집니다.
            </p>

            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400"
              onClick={() => setHelpOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  )
}
