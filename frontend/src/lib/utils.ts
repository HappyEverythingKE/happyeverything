import { useEffect, useState } from 'react'

import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { countries } from 'countries-list'
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

export const populateCountries = () => {
  const formattedCountries = Object.entries(countries).map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_code, country]) => {
      return { label: country.name, value: country.name }
    },
  )

  return formattedCountries
}

export const hashFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
