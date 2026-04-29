import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
  stack: string
}

export default class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '', stack: '' }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info)
    this.setState({
      message: error?.message || '알 수 없는 오류',
      stack: (error?.stack || info?.componentStack || '').slice(0, 1200),
    })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
        <div className="max-w-xl w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold mb-2">화면을 불러오는 중 오류가 발생했습니다</h1>
          <p className="text-sm text-slate-600 mb-4">
            잠시 후 다시 시도하거나 아래 버튼으로 새로고침 해주세요.
          </p>
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <p className="text-xs font-semibold text-rose-700 mb-1">오류 메시지</p>
            <p className="text-xs text-rose-700 break-words">{this.state.message}</p>
            {this.state.stack && (
              <>
                <p className="text-xs font-semibold text-rose-700 mt-2 mb-1">오류 스택(요약)</p>
                <pre className="text-[11px] leading-4 text-rose-700 whitespace-pre-wrap break-words max-h-36 overflow-auto">
                  {this.state.stack}
                </pre>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            새로고침
          </button>
        </div>
      </div>
    )
  }
}
