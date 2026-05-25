import { useEffect, useRef, useCallback, useId } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const INPUT_SELECTOR = 'input:not([type="hidden"]), textarea, select'

export function Modal({ isOpen, onClose, title, children, footer, className, maxWidth = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCloseRef.current()
      return
    }

    if (e.key === 'Tab' && panelRef.current) {
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const previousActive = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    requestAnimationFrame(() => {
      const firstInput = panelRef.current?.querySelector<HTMLElement>(INPUT_SELECTOR)
      if (firstInput) {
        firstInput.focus()
      }
    })

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previousActive?.focus()
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-coffee-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative w-full bg-cream-50 rounded-t-2xl sm:rounded-2xl shadow-xl animate-slide-up max-h-[90vh] flex flex-col',
          maxWidthClasses[maxWidth],
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-coffee-200 shrink-0">
          <h2 id={titleId} className="text-lg font-semibold text-coffee-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-coffee-100 transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5 text-coffee-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">{children}</div>

        {footer && (
          <div className="flex gap-3 p-4 border-t border-coffee-200 shrink-0">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  )
}
