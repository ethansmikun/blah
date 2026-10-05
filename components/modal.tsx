'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/** Native modal dialogs supply the focus trap, background inertness and Escape event. */
export function Modal({ children, className, label, onClose }: { children: ReactNode; className: string; label: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    const previous = document.activeElement as HTMLElement | null
    const scrollY = window.scrollY
    const original = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow }
    dialog.showModal()
    Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden' })
    return () => {
      dialog.close()
      Object.assign(document.body.style, original)
      window.scrollTo({ top: scrollY, behavior: 'instant' })
      if (previous?.isConnected && previous !== document.body) previous.focus({ preventScroll: true })
      else document.querySelector<HTMLElement>('.site-header')?.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} className={`store-modal ${className}`} aria-label={label} onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>{children}</dialog>
}
