import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'

const schema = z.object({
  name: z.string().trim().min(1, 'Package name is required'),
  slug: z.string().trim().min(1, 'Slug is required'),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().int().min(1, 'Duration must be at least 1 minute'),
  passingScore: z.coerce.number().min(0, 'Passing score must be at least 0'),
  status: z.string().trim().min(1, 'Status is required'),
  isFree: z.boolean(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
  questionIds: z.array(z.string()).min(1, 'Select at least one question'),
  subscriptionTierIds: z.array(z.string()).min(1, 'Select at least one subscription tier'),
}).superRefine((data, ctx) => {
  if (data.startAt && data.endAt && new Date(data.endAt) < new Date(data.startAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endAt'],
      message: 'End date must be after start date',
    })
  }
})

const emptyValues = {
  name: '',
  slug: '',
  description: '',
  durationMinutes: 100,
  passingScore: 0,
  status: 'draft',
  isFree: false,
  startAt: '',
  endAt: '',
  categoryIds: [],
  questionIds: [],
  subscriptionTierIds: [],
}

const toDateTimeLocal = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

function PackageFormModal({
  isOpen,
  mode,
  packageData,
  categories,
  questions,
  tiers,
  isSubmitting,
  isReferenceLoading,
  serverErrors = {},
  onClose,
  onSubmit,
}) {
  const isEdit = mode === 'edit'
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  const name = watch('name')
  const slug = watch('slug')
  const selectedQuestions = watch('questionIds') || []

  useEffect(() => {
    if (!isOpen) return

    if (isEdit && packageData) {
      reset({
        name: packageData.name || '',
        slug: packageData.slug || '',
        description: packageData.description || '',
        durationMinutes: Number(packageData.durationMinutes ?? 100),
        passingScore: Number(packageData.passingScore ?? 0),
        status: packageData.status || 'draft',
        isFree: Boolean(packageData.isFree),
        startAt: toDateTimeLocal(packageData.startAt),
        endAt: toDateTimeLocal(packageData.endAt),
        categoryIds: (packageData.categories || []).map((item) => String(item.id)),
        questionIds: (packageData.questions || []).map((item) => String(item.id)),
        subscriptionTierIds: (packageData.subscriptionTiers || []).map((item) => String(item.id)),
      })
    } else {
      reset(emptyValues)
    }
  }, [isOpen, isEdit, packageData, reset])

  const generatedSlug = useMemo(() => (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  ), [name])

  if (!isOpen) return null

  const submit = (values) => onSubmit(values)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Tryout Package' : 'Add Tryout Package'}</h2>
            <p className="text-sm text-gray-500">Complete package information and minimum required assignments.</p>
          </div>
          <button type="button" disabled={isSubmitting} onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-6 p-6 text-left">
          {serverErrors.general && <ErrorBox message={serverErrors.general} />}

          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Package Name" error={errors.name?.message || serverErrors.name}>
                <input {...register('name')} className={inputClass} placeholder="Tryout SKD Paket 1" />
              </Field>

              <Field label="Slug" error={errors.slug?.message || serverErrors.slug}>
                <div className="flex gap-2">
                  <input {...register('slug')} className={inputClass} placeholder="tryout-skd-paket-1" />
                  <button type="button" onClick={() => setValue('slug', generatedSlug, { shouldValidate: true })} className="rounded-lg border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50">
                    Generate
                  </button>
                </div>
                {!slug && generatedSlug && <p className="mt-1 text-xs text-gray-400">Suggestion: {generatedSlug}</p>}
              </Field>

              <div className="md:col-span-2">
                <Field label="Description" error={errors.description?.message || serverErrors.description}>
                  <textarea {...register('description')} rows={3} className={inputClass} placeholder="Package description" />
                </Field>
              </div>

              <Field label="Duration (minutes)" error={errors.durationMinutes?.message || serverErrors.durationMinutes}>
                <input type="number" min="1" {...register('durationMinutes')} className={inputClass} />
              </Field>

              <Field label="Passing Score" error={errors.passingScore?.message || serverErrors.passingScore}>
                <input type="number" min="0" step="0.01" {...register('passingScore')} className={inputClass} />
              </Field>

              <Field label="Status" error={errors.status?.message || serverErrors.status}>
                <input type="hidden" {...register('status')} />
                <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm capitalize text-gray-700">
                  {watch('status') || 'draft'}
                </div>
                <p className="mt-1 text-xs text-gray-400">Status is changed through Publish/Unpublish on Package Detail.</p>
              </Field>

              <Field label="Access" error={serverErrors.isFree}>
                <select
                  value={watch('isFree') ? 'true' : 'false'}
                  onChange={(event) => setValue('isFree', event.target.value === 'true', { shouldValidate: true })}
                  className={inputClass}
                >
                  <option value="false">Paid</option>
                  <option value="true">Free</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900">Schedule</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Start At" error={errors.startAt?.message || serverErrors.startAt}>
                <input type="datetime-local" {...register('startAt')} className={inputClass} />
              </Field>
              <Field label="End At" error={errors.endAt?.message || serverErrors.endAt}>
                <input type="datetime-local" {...register('endAt')} className={inputClass} />
              </Field>
            </div>
          </section>

          <SelectionSection title="Categories" error={errors.categoryIds?.message || serverErrors.categoryIds} loading={isReferenceLoading}>
            {categories.map((category) => (
              <CheckItem key={category.id} label={category.name} value={String(category.id)} register={register('categoryIds')} />
            ))}
          </SelectionSection>

          <SelectionSection title={`Questions (${selectedQuestions.length} selected)`} error={errors.questionIds?.message || serverErrors.questions} loading={isReferenceLoading}>
            {questions.map((question) => (
              <CheckItem
                key={question.id}
                label={question.questionText}
                meta={question.category?.name || question.categoryName}
                value={String(question.id)}
                register={register('questionIds')}
              />
            ))}
          </SelectionSection>

          <SelectionSection title="Subscription Tiers" error={errors.subscriptionTierIds?.message || serverErrors.subscriptionTierIds} loading={isReferenceLoading}>
            {tiers.map((tier) => (
              <CheckItem key={tier.id} label={tier.name} meta={tier.price != null ? `Price: ${tier.price}` : ''} value={String(tier.id)} register={register('subscriptionTierIds')} />
            ))}
          </SelectionSection>

          {isEdit && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              The current package detail API does not return questionOrder. Existing questions are therefore submitted in the order returned by the detail endpoint unless you change the selection.
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting || isReferenceLoading} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

function Field({ label, error, children }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>
}

function SelectionSection({ title, error, loading, children }) {
  return (
    <section className="rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900">{title} <span className="text-red-500">*</span></h3>
      {loading ? <p className="mt-3 text-sm text-gray-500">Loading options...</p> : <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto md:grid-cols-2">{children}</div>}
      {!loading && !children?.length && <p className="mt-3 text-sm text-gray-500">No data available.</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  )
}

function CheckItem({ label, meta, value, register }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
      <input type="checkbox" value={value} {...register} className="mt-1" />
      <span className="min-w-0"><span className="block text-sm font-medium text-gray-800">{label}</span>{meta && <span className="mt-0.5 block text-xs text-gray-500">{meta}</span>}</span>
    </label>
  )
}

function ErrorBox({ message }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{message}</div>
}

export default PackageFormModal
