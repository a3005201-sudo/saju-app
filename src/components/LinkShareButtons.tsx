import { useState } from 'react'

interface Props {
  shareUrl: string
  shareText: string
  compact?: boolean
}

async function copyText(text: string) {
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

export default function LinkShareButtons({ shareUrl, shareText, compact }: Props) {
  const [copied, setCopied] = useState(false)
  const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`)

  async function copyLink() {
    await copyText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: shareText, url: shareUrl })
        return
      } catch {
        // user cancelled or share unavailable
      }
    }
    await copyText(`${shareText} ${shareUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const textSize = compact ? 'text-xs' : 'text-sm'
  const buttonClass = `w-full px-3 py-2 rounded-lg ${textSize}`

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-2">
      <button
        type="button"
        onClick={copyLink}
        className={`${buttonClass} border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800`}
      >
        {copied ? '링크 복사됨 ✓' : '링크 복사'}
      </button>
      <button
        type="button"
        onClick={nativeShare}
        className={`${buttonClass} border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30`}
      >
        공유하기
      </button>
      <button
        type="button"
        onClick={() => {
          window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}&text=${encodedText}`, '_blank', 'noopener,noreferrer')
        }}
        className={`${buttonClass} bg-yellow-400 text-slate-900 font-semibold hover:bg-yellow-300`}
      >
        카카오톡 공유
      </button>
      <button
        type="button"
        onClick={() => {
          window.open(`https://www.threads.net/intent/post?text=${encodedText}`, '_blank', 'noopener,noreferrer')
        }}
        className={`${buttonClass} bg-slate-800 text-white font-semibold hover:bg-slate-700`}
      >
        스레드 공유
      </button>
    </div>
  )
}
