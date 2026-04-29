import { useState } from 'react'

interface Props {
  getText: () => string | Promise<string>
  /** 선택: AI 실행 전에 먼저 여는 제휴 링크 */
  affiliateUrl?: string
  compact?: boolean
  copyLabel?: string
  hideCopy?: boolean
  targets?: Array<'chatgpt' | 'gemini' | 'claude' | 'grok'>
}

const AI_TARGETS = [
  { key: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/' },
  { key: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/app' },
  { key: 'claude', label: 'Claude', url: 'https://claude.ai/new' },
  { key: 'grok', label: 'Grok', url: 'https://grok.com/' },
]
const DEFAULT_AFFILIATE_URL = 'https://link.coupang.com/a/exgqrr'

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

export default function AiLaunchButtons({ getText, affiliateUrl, compact, copyLabel, hideCopy, targets }: Props) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const visibleTargets = targets ? AI_TARGETS.filter((ai) => targets.includes(ai.key as 'chatgpt' | 'gemini' | 'claude' | 'grok')) : AI_TARGETS
  const effectiveAffiliateUrl = affiliateUrl?.trim() || DEFAULT_AFFILIATE_URL

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
        }, 250)
        aiWin.focus()
      } else {
        alert(`${aiLabel} 창이 팝업 차단으로 열리지 않았습니다. 이 사이트의 팝업을 허용해주세요.`)
      }
    } finally {
      setLoadingKey(null)
    }
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
          className={`rounded border border-amber-400/80 bg-amber-50 px-2 py-1 text-amber-900 hover:bg-amber-100 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-900/50 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          쿠팡 열기
        </a>
      )}
      {visibleTargets.map((ai) => (
        <button
          key={ai.key}
          type="button"
          onClick={() => launchTo(ai.label, ai.url, ai.key)}
          className={`rounded px-2 py-1 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-300 ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {loadingKey === ai.key ? '준비중...' : ai.label}
        </button>
      ))}
    </div>
  )
}
