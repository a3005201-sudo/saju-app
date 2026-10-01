import { useEffect, useRef, useState } from 'react'
import { COUPANG_FIXED_AFFILIATE_URL, isCoupangAffiliateUrl } from '../constants/affiliate.ts'
import AiBrandIcon, { type AiBrand } from './AiBrandIcon.tsx'

interface Props {
  getText: () => string | Promise<string>
  /** 선택: AI 실행 전에 먼저 여는 제휴 링크 */
  affiliateUrl?: string
  compact?: boolean
  copyLabel?: string
  hideCopy?: boolean
  targets?: Array<'chatgpt' | 'gemini' | 'claude' | 'grok'>
  variant?: 'inline' | 'large'
  /** 바뀔 때만 모바일용 해석 텍스트를 미리 만든다 (예: 생년월일 입력값) */
  textKey?: string
  onLaunched?: () => void
}

interface AiTarget { key: AiBrand; label: string; url: string; androidPackage: string }

const AI_TARGETS: AiTarget[] = [
  { key: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/', androidPackage: 'com.openai.chatgpt' },
  { key: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app', androidPackage: 'com.google.android.apps.bard' },
  { key: 'claude', label: 'Claude', url: 'https://claude.ai/new', androidPackage: 'com.anthropic.claude' },
  { key: 'grok', label: 'Grok', url: 'https://grok.com/', androidPackage: 'ai.x.grok' },
]

type MobilePlatform = 'android' | 'ios' | null

function detectMobilePlatform(): MobilePlatform {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ios'
  return null
}

/** 모바일은 사용자가 직접 누른 링크여야 설치된 앱(로그인 상태)으로 열린다. 없으면 웹으로 연다. */
function appLaunchUrl(ai: AiTarget, platform: MobilePlatform): string {
  if (platform !== 'android') return ai.url
  const { host, pathname } = new URL(ai.url)
  return `intent://${host}${pathname}#Intent;scheme=https;package=${ai.androidPackage};S.browser_fallback_url=${encodeURIComponent(ai.url)};end`
}
const DEFAULT_AFFILIATE_URL = COUPANG_FIXED_AFFILIATE_URL
const AI_REDIRECT_DELAY_MS = 3500

function stripAffiliateBlock(text: string) {
  const blockedPatterns = [
    /✨\s*대박 기운 아이템/i,
    /오늘의\s*행운템\s*보러가기/i,
    /사주\s*명리학\s*기초\s*서적/i,
    /쿠팡\s*파트너스\s*활동의\s*일환/i,
    /link\.coupang\.com\//i,
  ]
  return text
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim()
      if (!trimmed) return true
      return !blockedPatterns.some((pattern) => pattern.test(trimmed))
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function containsBlockedAffiliateText(text: string) {
  const blocked = [
    /대박\s*기운\s*아이템/i,
    /오늘의\s*행운템/i,
    /사주\s*명리학\s*기초\s*서적/i,
    /쿠팡\s*파트너스/i,
    /link\.coupang\.com\//i,
  ]
  return blocked.some((p) => p.test(text))
}

/** 모바일에서 URL만 붙는 현상 완화: 클립보드를 text/plain으로 명시 */
async function copyText(text: string) {
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ])
      return
    }
  } catch {
    // fall through
  }
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

export default function AiLaunchButtons({ getText, affiliateUrl, compact, copyLabel, hideCopy, targets, variant = 'inline', textKey, onLaunched }: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [platform] = useState<MobilePlatform>(detectMobilePlatform)
  const preparedTextRef = useRef<string | null>(null)

  // iOS는 클릭 직후 동기적으로 복사해야 하므로 텍스트를 미리 만들어 둔다.
  useEffect(() => {
    if (!platform) return
    let alive = true
    preparedTextRef.current = null
    Promise.resolve(getText())
      .then((text) => { if (alive) preparedTextRef.current = stripAffiliateBlock(text) })
      .catch(() => {})
    return () => { alive = false }
  }, [platform, textKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const visibleTargets = targets ? AI_TARGETS.filter((ai) => targets.includes(ai.key as 'chatgpt' | 'gemini' | 'claude' | 'grok')) : AI_TARGETS
  // 일반 쿠팡 URL이면 쿠키가 안 심히므로 무조건 link.coupang.com 만 사용
  const effectiveAffiliateUrl = isCoupangAffiliateUrl(affiliateUrl)
    ? affiliateUrl!.trim()
    : DEFAULT_AFFILIATE_URL

  async function copyOnly() {
    const text = await getText()
    const cleaned = stripAffiliateBlock(text)
    if (containsBlockedAffiliateText(cleaned)) {
      alert('복사 텍스트에 쿠팡 문구가 남아 있어 복사를 중단했습니다. 페이지를 새로고침 후 다시 시도해주세요.')
      return
    }
    await copyText(cleaned)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  /**
   * 1) 먼저 명식 텍스트를 클립보드에 넣고
   * 2) 제휴 링크를 같은 팝업창으로 먼저 연 뒤
   * 3) 같은 창을 AI 주소로 덮어쓴다.
   * 추가 안전장치로 복사 직전에 쿠팡 관련 문구/링크를 제거한다.
   */
  async function launchTo(aiLabel: string, aiUrl: string, key: string) {
    setLoadingKey(key)
    try {
      const text = await getText()
      const cleaned = stripAffiliateBlock(text)
      if (containsBlockedAffiliateText(cleaned)) {
        alert('복사 텍스트에 쿠팡 문구가 남아 있어 복사를 중단했습니다. 페이지를 새로고침 후 다시 시도해주세요.')
        return
      }
      await copyText(cleaned)

      // 사용자 액션 클릭 문맥 안에서 같은 named window를 재사용해야 팝업 차단 가능성을 낮출 수 있다.
      const targetName = 'orrery-ai-window'
      const firstUrl = effectiveAffiliateUrl
      const aiWin = window.open(firstUrl, targetName)
      if (aiWin && !aiWin.closed) {
        // 제휴 링크 로딩을 아주 짧게 보장한 뒤 같은 창을 AI 페이지로 전환
        setTimeout(() => {
          try {
            aiWin.location.href = aiUrl
            aiWin.focus()
          } catch {
            window.open(aiUrl, targetName)
          }
        }, AI_REDIRECT_DELAY_MS)
        aiWin.focus()
        onLaunched?.()
      } else {
        alert(`${aiLabel} 창이 팝업 차단으로 열리지 않았습니다. 이 사이트의 팝업을 허용해주세요.`)
      }
    } finally {
      setLoadingKey(null)
    }
  }

  function launchMobile(e: React.MouseEvent<HTMLAnchorElement>, ai: AiTarget) {
    const prepared = preparedTextRef.current
    if (prepared && !containsBlockedAffiliateText(prepared)) {
      void copyText(prepared)
      onLaunched?.()
      return
    }
    e.preventDefault()
    setLoadingKey(ai.key)
    void (async () => {
      try {
        const cleaned = stripAffiliateBlock(await getText())
        if (containsBlockedAffiliateText(cleaned)) {
          alert('복사 텍스트에 쿠팡 문구가 남아 있어 복사를 중단했습니다. 페이지를 새로고침 후 다시 시도해주세요.')
          return
        }
        await copyText(cleaned)
        onLaunched?.()
        window.location.href = appLaunchUrl(ai, platform)
      } finally {
        setLoadingKey(null)
      }
    })()
  }

  function renderAiButton(ai: AiTarget, className: string, content: React.ReactNode) {
    if (platform) {
      return (
        <a
          key={ai.key}
          href={appLaunchUrl(ai, platform)}
          target={platform === 'ios' ? '_blank' : undefined}
          rel="noopener noreferrer"
          onClick={(e) => launchMobile(e, ai)}
          className={className}
        >
          {content}
        </a>
      )
    }
    return (
      <button key={ai.key} type="button" onClick={() => launchTo(ai.label, ai.url, ai.key)} className={className}>
        {content}
      </button>
    )
  }

  if (variant === 'large') {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {visibleTargets.map((ai) => renderAiButton(
            ai,
            'h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-base font-bold shadow-sm hover:bg-slate-700 dark:hover:bg-slate-300 active:scale-[0.98] transition-all',
            <>
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                <AiBrandIcon brand={ai.key} className="w-[18px] h-[18px]" />
              </span>
              {loadingKey === ai.key ? '준비중...' : `${ai.label}로 풀이`}
            </>,
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {!hideCopy && (
            <button
              type="button"
              onClick={copyOnly}
              className="h-11 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {copied ? '복사됨 ✓ 원하는 AI 채팅창에 붙여넣으세요' : (copyLabel ?? '📋 해석용 글만 복사하기')}
            </button>
          )}
          {effectiveAffiliateUrl && (
            <a
              href={effectiveAffiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-amber-500 bg-amber-100 px-3 text-sm font-semibold text-amber-950 hover:bg-amber-200 dark:border-amber-500 dark:bg-amber-900/60 dark:text-amber-50 dark:hover:bg-amber-800/70"
            >
              📚 쿠팡에서 파는 사주풀이 서적 구입하기
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5">
      {!hideCopy && (
        <button
          type="button"
          onClick={copyOnly}
          className={`border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {copied ? '복사됨 ✓' : (copyLabel ?? '종합 AI 해석 복사')}
        </button>
      )}
      {effectiveAffiliateUrl && (
        <a
          href={effectiveAffiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded border border-amber-500 bg-amber-100 px-2 py-1 font-semibold text-amber-950 hover:bg-amber-200 dark:border-amber-500 dark:bg-amber-900/60 dark:text-amber-50 dark:hover:bg-amber-800/70 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          쿠팡에서 파는 사주풀이 서적 구입하기
        </a>
      )}
      {visibleTargets.map((ai) => renderAiButton(
        ai,
        `inline-flex items-center gap-1 rounded px-2 py-1 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-300 ${compact ? 'text-xs' : 'text-sm'}`,
        <>
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white">
            <AiBrandIcon brand={ai.key} className="w-3 h-3" />
          </span>
          {loadingKey === ai.key ? '준비중...' : ai.label}
        </>,
      ))}
    </div>
  )
}
