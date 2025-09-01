import { useEffect, useState } from 'react'

import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

// Debounce helper
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debounced
}

export const prettifyInitials = (name: string | undefined) => {
  if (!name) return '^_^'

  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
