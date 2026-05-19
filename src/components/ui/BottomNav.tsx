import { Link } from 'react-router-dom'
import { Coffee, Bean } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  currentPath: string
}

export function BottomNav({ currentPath }: BottomNavProps) {
  const isBrew = currentPath.startsWith('/brew')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-200 px-4 py-2 z-20">
      <div className="max-w-4xl mx-auto flex justify-around">
        <Link
          to="/"
          className={cn(
            'relative flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
            !isBrew ? 'text-coffee-700 bg-coffee-50' : 'text-coffee-400 hover:text-coffee-600'
          )}
        >
          {!isBrew && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-coffee-600 rounded-full" />}
          <Bean className="w-6 h-6" />
          <span className="text-xs font-medium">咖啡豆</span>
        </Link>
        <Link
          to="/brew"
          className={cn(
            'relative flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors',
            isBrew ? 'text-coffee-700 bg-coffee-50' : 'text-coffee-400 hover:text-coffee-600'
          )}
        >
          {isBrew && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-coffee-600 rounded-full" />}
          <Coffee className="w-6 h-6" />
          <span className="text-xs font-medium">手冲记录</span>
        </Link>
      </div>
    </nav>
  )
}