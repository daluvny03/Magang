import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Search } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

function CategorySearchSelect({
  id,
  categories,
  value,
  onChange,
  onBlur,
  inputRef,
  disabled,
  isLoading,
  isError,
  onRetry,
  error,
  fallbackName,
  required = true,
  floating = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef(null)

  const options = useMemo(() => {
    const byId = new Map(categories.map((category) => [String(category.id), category]))

    return categories.map((category) => {
      const names = []
      const visited = new Set()
      let current = category

      while (current && !visited.has(String(current.id))) {
        visited.add(String(current.id))
        names.unshift(current.name)
        current = byId.get(String(current.parentId ?? current.parent_id))
      }

      return { id: String(category.id), path: names.join(' → ') }
    })
  }, [categories])

  const selected = options.find((option) => option.id === String(value))
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return options.filter((option) => option.path.toLowerCase().includes(keyword))
  }, [options, search])
  const unavailable = Boolean(value) && !selected && !isLoading && !isError
  const blocked = disabled || isLoading || isError
  const expanded = isOpen && !blocked
  const activeOption = filtered[Math.min(activeIndex, filtered.length - 1)]
  const selectedLabel = selected?.path || (value ? fallbackName || `Kategori #${value}` : '')

  useEffect(() => {
    if (!expanded || !activeOption) return
    const option = listRef.current?.querySelector('[data-highlighted="true"]')
    option?.scrollIntoView({ block: 'nearest' })
  }, [expanded, activeOption])

  const open = () => {
    if (blocked) return
    setSearch('')
    setActiveIndex(0)
    setIsOpen(true)
  }

  const select = (option) => {
    onChange(option.id)
    setIsOpen(false)
    setSearch('')
  }

  const handleKeyDown = (event) => {
    if (blocked) return

    if (event.key === 'Escape' && expanded) {
      event.preventDefault()
      event.stopPropagation()
      setIsOpen(false)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!expanded) {
        open()
        return
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((index) => Math.max(0, Math.min(index + direction, filtered.length - 1)))
    } else if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (!expanded) open()
      else if (activeOption) select(activeOption)
    }
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false)
          onBlur?.()
        }
      }}
    >
      <div className="relative">
        <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-3 text-gray-400" />
        <Input
          id={id}
          ref={inputRef}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={expanded ? `${id}-options` : undefined}
          aria-activedescendant={expanded && activeOption ? `${id}-option-${activeOption.id}` : undefined}
          aria-describedby={`${id}-selection`}
          aria-invalid={Boolean(error) || unavailable}
          aria-required={required}
          autoComplete="off"
          value={expanded ? search : selectedLabel}
          placeholder="Cari nama kategori..."
          disabled={blocked}
          error={error || unavailable}
          className="pl-9"
          onFocus={open}
          onClick={() => { if (!expanded) open() }}
          onChange={(event) => {
            setSearch(event.target.value)
            setActiveIndex(0)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      <p id={`${id}-selection`} className="mt-1 break-words text-xs text-gray-500">
        {value ? `Terpilih: ${selectedLabel}` : required ? 'Pilih satu kategori dari hasil pencarian.' : 'Semua kategori'}
      </p>

      {isLoading && <p role="status" className="mt-2 text-sm text-gray-500">Memuat kategori...</p>}
      {isError && (
        <div role="alert" className="mt-2 flex flex-wrap items-center gap-2 text-sm text-red-600">
          <span>Gagal memuat kategori.</span>
          <Button type="button" variant="soft" onClick={onRetry} disabled={disabled}>Coba lagi</Button>
        </div>
      )}
      {unavailable && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {required
            ? 'Kategori sebelumnya tidak ditemukan. Pilih kategori yang tersedia sebelum menyimpan.'
            : 'Kategori filter tidak ditemukan. Pilih kategori lain atau tampilkan semua kategori.'}
        </p>
      )}
      {!isLoading && !isError && options.length === 0 && (
        <p role="status" className="mt-2 text-sm text-gray-500">Belum ada kategori yang tersedia.</p>
      )}

      {expanded && (
        <div className={floating ? 'absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg' : undefined}>
          <ul
            id={`${id}-options`}
            ref={listRef}
            role="listbox"
            aria-label="Pilihan kategori"
            className={floating
              ? 'max-h-60 overflow-y-auto bg-white'
              : 'mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white'}
          >
            {filtered.map((option) => (
              <li
                key={option.id}
                id={`${id}-option-${option.id}`}
                role="option"
                aria-selected={option.id === String(value)}
                data-highlighted={option.id === activeOption?.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(option)}
                className={`flex cursor-pointer items-start gap-2 px-3 py-2 text-sm hover:bg-primary-50 ${
                  option.id === activeOption?.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <span className="min-w-0 flex-1 break-words">{option.path}</span>
                {option.id === String(value) && <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0" />}
              </li>
            ))}
          </ul>
          {options.length > 0 && filtered.length === 0 && (
            <p role="status" className={floating ? 'p-3 text-sm text-gray-500' : 'mt-2 text-sm text-gray-500'}>Kategori tidak ditemukan.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default CategorySearchSelect
