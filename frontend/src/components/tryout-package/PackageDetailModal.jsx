import { Layers3, ListOrdered, Send, ShieldCheck, Undo2 } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import SectionCard from '../ui/SectionCard'
import LoadingSpinner from '../common/LoadingSpinner'

const formatDate = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

function Chip({ children }) {
  return (
    <span className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm text-primary-700">
      {children}
    </span>
  )
}

function EmptyText({ text }) {
  return <p className="text-sm text-gray-500">{text}</p>
}

function ManageButton({ onClick, children }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      {children}
    </Button>
  )
}

function PackageDetailModal({
  isOpen,
  response,
  isLoading,
  isStatusSaving,
  onClose,
  onManageCategories,
  onManageQuestions,
  onManageTiers,
  onPublish,
  onUnpublish,
}) {
  const item = response?.data
  const categories = item?.categories || []
  const questions = item?.questions || []
  const tiers = item?.subscriptionTiers || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Package Detail"
      description="Review mappings and publication status."
    >
      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : !item ? (
        <p className="py-6 text-sm text-red-600">
          Unable to load package detail.
        </p>
      ) : (
        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">{item.slug}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone={item.status === 'published' ? 'green' : 'gray'}>
                  {item.status}
                </Badge>

                {item.status === 'published' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isStatusSaving}
                    onClick={onUnpublish}
                  >
                    <Undo2 size={15} />
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={isStatusSaving}
                    onClick={onPublish}
                  >
                    <Send size={15} />
                    Publish
                  </Button>
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-700">
              {item.description || '-'}
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Duration" value={`${item.durationMinutes} minutes`} />
              <Info label="Questions" value={item.questionCount ?? 0} />
              <Info label="Passing Score" value={item.passingScore ?? '-'} />
              <Info label="Access" value={item.isFree ? 'Free' : 'Paid'} />
              <Info label="Start At" value={formatDate(item.startAt)} />
              <Info label="End At" value={formatDate(item.endAt)} />
            </div>
          </section>

          <SectionCard
            title="Categories"
            icon={Layers3}
            action={
              <ManageButton onClick={onManageCategories}>
                Manage Categories
              </ManageButton>
            }
          >
            <div className="flex flex-wrap gap-2">
              {categories.length ? (
                categories.map((c) => <Chip key={c.id}>{c.name}</Chip>)
              ) : (
                <EmptyText text="No categories assigned." />
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Questions"
            icon={ListOrdered}
            action={
              <ManageButton onClick={onManageQuestions}>
                Manage Questions
              </ManageButton>
            }
          >
            <div className="space-y-2">
              {questions.length ? (
                questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700"
                  >
                    <span className="mr-2 font-semibold text-primary-700">
                      {q.questionOrder ?? i + 1}.
                    </span>
                    {q.questionText || '-'}
                  </div>
                ))
              ) : (
                <EmptyText text="No questions assigned." />
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Subscription Tiers"
            icon={ShieldCheck}
            action={
              <ManageButton onClick={onManageTiers}>Manage Access</ManageButton>
            }
          >
            <div className="flex flex-wrap gap-2">
              {tiers.length ? (
                tiers.map((t) => (
                  <Chip key={t.id}>
                    {t.name} · {t.price}
                  </Chip>
                ))
              ) : (
                <EmptyText text="No subscription tiers assigned." />
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </Modal>
  )
}

export default PackageDetailModal