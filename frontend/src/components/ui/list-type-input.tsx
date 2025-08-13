'use client'

import { useState } from 'react'

import { useFetchListType } from '@/services/list.api'
import { startCase } from 'lodash'

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type ListTypeInputProps = {
  inputValue: string
  onChange: (value: string) => void
}

export function ListTypeInput({ inputValue, onChange }: ListTypeInputProps) {
  const [open, setOpen] = useState(false)
  const [localValue, setLocalValue] = useState(inputValue)

  const { data: listTypes = [], isLoading } = useFetchListType(localValue)

  const formatValue = (val: string) => startCase(val.trim())

  const handleSelect = (listType: string) => {
    const formatted = formatValue(listType)
    onChange(formatted)
    setLocalValue(formatted)
    setOpen(false)
  }

  const handleBlur = () => {
    const formatted = formatValue(localValue)
    setLocalValue(formatted)
    onChange(formatted)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          className="text-left"
          value={localValue}
          onChange={(e) => {
            const val = e.target.value
            setLocalValue(val) // show raw text while typing
            onChange(formatValue(val)) // keep form state clean at all times
            setOpen(true)
          }}
          onBlur={handleBlur}
        />
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <Command className="w-full">
          <CommandInput
            placeholder="Search list types..."
            value={localValue}
            onValueChange={(val) => {
              setLocalValue(val)
              onChange(formatValue(val))
            }}
            disabled={isLoading}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : listTypes.length > 0 ? (
              listTypes.map((listType) => (
                <CommandItem
                  key={listType.name}
                  onSelect={() => handleSelect(listType.name)}
                >
                  {listType.name}
                </CommandItem>
              ))
            ) : (
              <CommandEmpty className="p-4 text-sm text-gray-500">
                No match. You can enter a new list type.
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
