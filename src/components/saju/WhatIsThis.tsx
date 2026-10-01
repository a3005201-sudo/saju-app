import { useState } from 'react'

interface Props {
  children: React.ReactNode
}

export default function WhatIsThis({ children }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-600 bg-white/70 dark:bg-slate-800/70 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300"
      >
        <span aria-hidden="true">❔</span> 이게 뭐예요?
      </button>
      {open && (
        <p className="mt-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {children}
        </p>
      )}
    </div>
  )
}
