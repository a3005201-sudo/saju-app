import { useLocale } from '../i18n/index.ts'

function ExampleBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 rounded border border-dashed border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
      {children}
    </div>
  )
}

export default function Guide() {
  const { t } = useLocale()
  return (
    <div className="mt-8">
      <section className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-5 bg-gray-50/50 dark:bg-gray-900/50">
        <h3 className="text-base font-medium text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {t('guide.title')}
        </h3>
        <div>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">{t('guide.compatibility')}</p>
          <ExampleBox>
            {t('guide.compatibilityEx')}<br /><br />
            <span className="text-gray-400 dark:text-gray-500">{t('guide.pasteA')}</span><br /><br />
            <span className="text-gray-400 dark:text-gray-500">{t('guide.pasteB')}</span>
          </ExampleBox>
        </div>
      </section>
    </div>
  )
}
