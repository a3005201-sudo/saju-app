interface Props {
  open: boolean
  onClose: () => void
  /** 결과 화면에 행운템 영역이 있으면 그쪽으로 스크롤, 없으면 제휴 링크로 이동 */
  luckItemsAnchorId?: string
  affiliateUrl: string
}

export default function ReturnLuckSheet({ open, onClose, luckItemsAnchorId, affiliateUrl }: Props) {
  if (!open) return null

  const luckItemsEl = luckItemsAnchorId ? document.getElementById(luckItemsAnchorId) : null
  const buttonClass = 'flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-bold transition-colors'

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-2 pb-2 sm:px-4 sm:pb-4" role="dialog" aria-label="행운템 추천">
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-black text-slate-900 dark:text-slate-100">📖 AI 해설 잘 보고 계신가요?</p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">해설 보면서 내 사주에 맞는 행운템도 구경해 보세요.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          {luckItemsEl ? (
            <button
              type="button"
              onClick={() => {
                luckItemsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
                onClose()
              }}
              className={`${buttonClass} bg-amber-500 text-slate-900 hover:bg-amber-400`}
            >
              🍀 내 부족한 기운 행운템 보기
            </button>
          ) : (
            <a href={affiliateUrl} target="_blank" rel="noopener noreferrer" onClick={onClose} className={`${buttonClass} bg-amber-500 text-slate-900 hover:bg-amber-400`}>
              🍀 오늘의 행운템 보러가기
            </a>
          )}
          <a
            href={affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className={`${buttonClass} border border-amber-500 bg-amber-50 text-amber-950 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-50`}
          >
            📚 쿠팡에서 파는 사주풀이 서적 보기
          </a>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
        </p>
      </div>
    </div>
  )
}
