type ConfirmOptions = {
  title?:        string
  confirmLabel?: string
  danger?:       boolean
}

export function confirmDialog(message: string, options?: ConfirmOptions): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent('app-confirm', {
      detail: { message, resolve, ...options },
    }))
  })
}
