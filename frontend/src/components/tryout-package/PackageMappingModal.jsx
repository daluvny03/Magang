import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'

import Button from '../ui/Button'
import CheckItem from '../ui/CheckItem'
import IconButton from '../ui/IconButton'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import QuestionGroupSelector from './QuestionGroupSelector'
import { filterCategoriesByPackageSelection } from '../../utils/filterCategoriesByPackageSelection'

const titles = {
  categories: 'Manage Categories',
  questions: 'Manage Questions',
  tiers: 'Manage Subscription Tiers',
}

function ChoiceList({ items, selectedIds, toggle, label }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => {
        const id = String(item.id)

        return (
          <CheckItem
            key={id}
            label={label(item)}
            checked={selectedIds.includes(id)}
            onChange={() => toggle(id)}
          />
        )
      })}

      {items.length === 0 && (
        <p className="text-sm text-gray-500">No data found.</p>
      )}
    </div>
  )
}

function PackageMappingModal({
  isOpen,
  type,
  packageData,
  categories,
  tiers,
  isSaving,
  onClose,
  onSave,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [orderedQuestions, setOrderedQuestions] = useState([])
  const [categorySearch, setCategorySearch] = useState('')

  useEffect(() => {
    if (!isOpen || !packageData) return

    if (type === 'categories') {
      setSelectedIds((packageData.categories || []).map((x) => String(x.id)))
    }

    if (type === 'tiers') {
      setSelectedIds(
        (packageData.subscriptionTiers || []).map((x) => String(x.id))
      )
    }

    if (type === 'questions') {
      setOrderedQuestions(
        (packageData.questions || [])
          .map((x, index) => ({
            id: String(x.id),
            questionOrder: Number(x.questionOrder ?? index + 1),
          }))
          .sort((a, b) => a.questionOrder - b.questionOrder)
      )
    }

    setCategorySearch('')
  }, [isOpen, type, packageData])

  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase()
    if (!keyword) return categories || []

    return (categories || []).filter((category) =>
      category.name?.toLowerCase().includes(keyword)
    )
  }, [categories, categorySearch])

  const toggle = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    )
  }

  const move = (index, direction) => {
    setOrderedQuestions((current) => {
      const next = [...current]
      const target = index + direction

      if (target < 0 || target >= next.length) return current

      ;[next[index], next[target]] = [next[target], next[index]]

      return next.map((x, i) => ({ ...x, questionOrder: i + 1 }))
    })
  }

  const save = () => {
    if (type === 'questions') {
      onSave(
        orderedQuestions.map((x, i) => ({
          questionId: Number(x.id),
          questionOrder: i + 1,
        }))
      )
      return
    }

    onSave(selectedIds.map(Number))
  }

  const questionCategories = filterCategoriesByPackageSelection(
    categories,
    (packageData?.categories || []).map((x) => x.id)
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? undefined : onClose}
      size="lg"
      title={titles[type] || 'Manage'}
      description={packageData?.name}
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Mapping'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {type === 'questions' && (
          <>
            <p className="rounded-lg bg-primary-50 p-3 text-xs text-primary-700">
              Save category mapping first. Select question groups by category,
              then optionally preview and adjust individual questions.
            </p>

            <QuestionGroupSelector
              categories={questionCategories}
              selectedQuestionIds={orderedQuestions.map((x) => x.id)}
              initialQuestions={packageData?.questions || []}
              disabled={isSaving}
              onChange={(ids) =>
                setOrderedQuestions((current) => {
                  const orderMap = new Map(
                    current.map((x) => [x.id, x.questionOrder])
                  )

                  return ids.map((id, index) => ({
                    id: String(id),
                    questionOrder: orderMap.get(String(id)) ?? index + 1,
                  }))
                })
              }
            />

            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                Final Order ({orderedQuestions.length})
              </h3>

              <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-3">
                {orderedQuestions.map((item, index) => {
                  const question = (packageData?.questions || []).find(
                    (x) => String(x.id) === item.id
                  )

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 p-2.5"
                    >
                      <span className="w-7 text-sm font-semibold text-primary-700">
                        {index + 1}.
                      </span>

                      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                        {question?.questionText || `Question #${item.id}`}
                      </span>

                      <IconButton
                        label="Move up"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        className="p-1 disabled:opacity-30"
                      >
                        <ArrowUp size={16} />
                      </IconButton>

                      <IconButton
                        label="Move down"
                        onClick={() => move(index, 1)}
                        disabled={index === orderedQuestions.length - 1}
                        className="p-1 disabled:opacity-30"
                      >
                        <ArrowDown size={16} />
                      </IconButton>
                    </div>
                  )
                })}

                {orderedQuestions.length === 0 && (
                  <p className="p-3 text-sm text-gray-500">
                    No questions selected yet.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {type === 'categories' && (
          <>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                placeholder="Search category..."
                className="pl-9"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {selectedIds.length} categories selected
              </p>

              {categorySearch && (
                <p className="text-xs text-gray-400">
                  {filteredCategories.length} results
                </p>
              )}
            </div>

            <ChoiceList
              items={filteredCategories}
              selectedIds={selectedIds}
              toggle={toggle}
              label={(x) => x.name}
            />
          </>
        )}

        {type === 'tiers' && (
          <ChoiceList
            items={tiers}
            selectedIds={selectedIds}
            toggle={toggle}
            label={(x) => `${x.name}${x.price != null ? ` · ${x.price}` : ''}`}
          />
        )}
      </div>
    </Modal>
  )
}

export default PackageMappingModal