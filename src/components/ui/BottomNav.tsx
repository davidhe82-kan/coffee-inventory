import { Coffee, Bean } from 'lucide-react'

interface BottomNavProps {
  currentPath: string
}

export function BottomNav({ currentPath }: BottomNavProps) {
  const isBrew = currentPath.startsWith('/brew')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-200 px-4 py-2 z-20">
      <div className="max-w-4xl mx-auto flex justify-around">
        <button
          onClick={() => window.location.hash = '#/'}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            !isBrew ? 'text-coffee-700' : 'text-coffee-400'
          }`}
        >
          <Bean className={`w-6 h-6 ${!isBrew ? 'stroke-coffee-700' : ''}`} />
          <span className="text-xs font-medium">咖啡豆</span>
        </button>
        <button
          onClick={() => window.location.hash = '#/brew'}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            isBrew ? 'text-coffee-700' : 'text-coffee-400'
          }`}
        >
          <Coffee className={`w-6 h-6 ${isBrew ? 'stroke-coffee-700' : ''}`} />
          <span className="text-xs font-medium">手冲记录</span>
        </button>
      </div>
    </nav>
  )
}