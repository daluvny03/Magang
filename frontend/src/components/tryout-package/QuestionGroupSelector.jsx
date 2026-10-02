import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Eye, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'

import { getCategoryQuestionIds } from '../../services/category.service'
import { getQuestions } from '../../services/question.service'
import { buildCategoryTree } from '../../utils/buildCategoryTree'

function QuestionGroupSelector({ categories, selectedQuestionIds, onChange, initialQuestions = [], disabled = false }) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState([])
  const [loadingCategoryId, setLoadingCategoryId] = useState(null)
  const [previewCategory, setPreviewCategory] = useState(null)
  const [previewQuestions, setPreviewQuestions] = useState([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [questionCache, setQuestionCache] = useState(() => Object.fromEntries(initialQuestions.map(q => [String(q.id), q])))

  const selected = useMemo(() => selectedQuestionIds.map(String), [selectedQuestionIds])
  const tree = useMemo(() => buildCategoryTree(categories || []), [categories])
  const visibleTree = useMemo(() => filterTree(tree, search), [tree, search])

  const loadIds = async (category) => {
    const response = await getCategoryQuestionIds(category.id)
    return (response?.data?.questionIds || []).map(String)
  }

  const toggleGroup = async (category) => {
    if (disabled || loadingCategoryId) return
    setLoadingCategoryId(String(category.id))
    try {
      const ids = await loadIds(category)
      if (!ids.length) {
        toast.info('This category has no active questions')
        return
      }
      const allSelected = ids.every(id => selected.includes(id))
      onChange(allSelected ? selected.filter(id => !ids.includes(id)) : unique([...selected, ...ids]))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load category questions')
    } finally {
      setLoadingCategoryId(null)
    }
  }

  const openPreview = async (category) => {
    setPreviewCategory(category)
    setPreviewLoading(true)
    try {
      const response = await getQuestions({ page: 1, limit: 100, categoryId: category.id, isActive: 'true' })
      const rows = response?.data || []
      setPreviewQuestions(rows)
      setQuestionCache(current => ({ ...current, ...Object.fromEntries(rows.map(q => [String(q.id), q])) }))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to preview questions')
      setPreviewQuestions([])
    } finally {
      setPreviewLoading(false)
    }
  }

  const toggleQuestion = (id) => {
    const key = String(id)
    onChange(selected.includes(key) ? selected.filter(item => item !== key) : [...selected, key])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">{selected.length} questions selected</p>
          <p className="text-xs text-gray-500">Select a category to add/remove all active questions in that group. Preview lets you adjust individual questions.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search category..." className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-200">
        {visibleTree.map(category => (
          <GroupRow key={category.id} category={category} level={0} selected={selected} expanded={expanded} setExpanded={setExpanded} loadingCategoryId={loadingCategoryId} onToggle={toggleGroup} onPreview={openPreview} disabled={disabled} />
        ))}
        {!visibleTree.length && <p className="p-4 text-sm text-gray-500">No categories found.</p>}
      </div>

      {selected.length > 0 && (
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Final mapping will save {selected.length} explicit question IDs to the package.
        </div>
      )}

      {previewCategory && (
        <div className="rounded-xl border border-gray-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h4 className="text-sm font-semibold text-gray-900">Preview: {previewCategory.name}</h4><p className="text-xs text-gray-500">Toggle individual questions without changing the category structure.</p></div>
            <button type="button" onClick={() => setPreviewCategory(null)} className="text-xs font-medium text-gray-500 hover:text-gray-800">Close preview</button>
          </div>
          {previewLoading ? <div className="flex items-center gap-2 py-4 text-sm text-gray-500"><Loader2 size={16} className="animate-spin" /> Loading questions...</div> : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {previewQuestions.map(q => {
                const id = String(q.id)
                return <label key={id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"><input type="checkbox" checked={selected.includes(id)} onChange={() => toggleQuestion(id)} disabled={disabled} className="mt-1"/><span className="text-sm text-gray-700">{q.questionText}</span></label>
              })}
              {!previewQuestions.length && <p className="py-3 text-sm text-gray-500">No active questions in this category.</p>}
            </div>
          )}
        </div>
      )}

      {selected.length > 0 && Object.keys(questionCache).length > 0 && (
        <p className="text-xs text-gray-400">Question text is loaded on demand during preview; selection itself only needs IDs.</p>
      )}
    </div>
  )
}

function GroupRow({ category, level, selected, expanded, setExpanded, loadingCategoryId, onToggle, onPreview, disabled }) {
  const children = category.children || []
  const hasChildren = children.length > 0
  const isExpanded = expanded.includes(String(category.id))
  const count = Number(category.questionCount || 0)
  const isLoading = loadingCategoryId === String(category.id)
  const toggleExpand = () => setExpanded(current => isExpanded ? current.filter(id => id !== String(category.id)) : [...current, String(category.id)])

  return <div>
    <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2.5 last:border-b-0" style={{ paddingLeft: `${12 + level * 22}px` }}>
      <button type="button" onClick={toggleExpand} disabled={!hasChildren} className={`rounded p-1 ${hasChildren ? 'text-gray-500 hover:bg-gray-100' : 'text-transparent'}`}>{hasChildren ? (isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>) : <ChevronRight size={16}/>}</button>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-800">{category.name}</p><p className="text-xs text-gray-500">{count} active questions</p></div>
      <button type="button" onClick={() => onPreview(category)} disabled={disabled} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"><Eye size={14}/> Preview</button>
      <button type="button" onClick={() => onToggle(category)} disabled={disabled || isLoading || count === 0} className="min-w-24 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40">{isLoading ? 'Loading...' : 'Select group'}</button>
    </div>
    {hasChildren && isExpanded && children.map(child => <GroupRow key={child.id} category={child} level={level + 1} selected={selected} expanded={expanded} setExpanded={setExpanded} loadingCategoryId={loadingCategoryId} onToggle={onToggle} onPreview={onPreview} disabled={disabled}/>) }
  </div>
}

function filterTree(nodes, search) {
  const term = search.trim().toLowerCase()
  if (!term) return nodes
  return nodes.reduce((result, node) => {
    const children = filterTree(node.children || [], search)
    if ((node.name || '').toLowerCase().includes(term) || children.length) result.push({ ...node, children })
    return result
  }, [])
}

function unique(values) { return [...new Set(values.map(String))] }

export default QuestionGroupSelector
