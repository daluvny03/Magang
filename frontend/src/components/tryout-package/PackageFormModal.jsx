import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search } from 'lucide-react'

import Button from '../ui/Button'
import CheckItem from '../ui/CheckItem'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import SectionCard from '../ui/SectionCard'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import QuestionGroupSelector from './QuestionGroupSelector'
import { filterCategoriesByPackageSelection } from '../../utils/filterCategoriesByPackageSelection'

const schema = z
  .object({
    name: z.string().trim().min(1, 'Package name is required'),
    slug: z.string().trim().min(1, 'Slug is required'),
    description: z.string().optional(),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute'),
    passingMode: z.enum(['none', 'total', 'category']),
    passingScore: z.string(),
    passingGrades: z.object({
      twk: z.string(),
      tiu: z.string(),
      tkp: z.string(),
    }),
    status: z.string().trim().min(1, 'Status is required'),
    isFree: z.boolean(),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    categoryIds: z.array(z.string()).min(1, 'Select at least one category'),
    questionIds: z.array(z.string()).min(1, 'Select at least one question'),
    subscriptionTierIds: z
      .array(z.string())
      .min(1, 'Select at least one subscription tier'),
  })
  .superRefine((data, ctx) => {
    const validateScore = (value, path) => {
      if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path,
          message: 'Masukkan batas skor berupa angka minimal 0.',
        })
      }
    }

    if (data.passingMode === 'total') {
      validateScore(data.passingScore, ['passingScore'])
    }

    if (data.passingMode === 'category') {
      const grades = Object.entries(data.passingGrades).filter(([, value]) => value.trim() !== '')
      if (grades.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['passingGrades'],
          message: 'Isi batas skor untuk kategori yang memiliki soal dalam paket.',
        })
      }
      grades.forEach(([slug, value]) => validateScore(value, ['passingGrades', slug]))
    }

    if (
      data.startAt &&
      data.endAt &&
      new Date(data.endAt) <= new Date(data.startAt)
    ) {
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
  passingMode: 'none',
  passingScore: '',
  passingGrades: { twk: '', tiu: '', tkp: '' },
  status: 'draft',
  isFree: false,
  startAt: '',
  endAt: '',
  categoryIds: [],
  questionIds: [],
  subscriptionTierIds: [],
}

const editSchema = z.object({
  name: z.string().trim()
    .min(3, 'Package name must be at least 3 characters')
    .max(200, 'Package name must be at most 200 characters'),
})

function PackageFormModal({
  isOpen,
  mode,
  packageData,
  categories,
  tiers,
  isSubmitting,
  isReferenceLoading,
  serverErrors = {},
  onClose,
  onSubmit,
}) {
  const isEdit = mode === 'edit'
  const [categorySearch, setCategorySearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? editSchema : schema),
    defaultValues: emptyValues,
  })

  const name = watch('name') || ''
  const slug = watch('slug')
  const status = watch('status')
  const passingMode = watch('passingMode')
  const isFree = watch('isFree')
  const selectedQuestions = watch('questionIds') || []
  const selectedCategoryIds = watch('categoryIds') || []

  const questionCategories = useMemo(
    () => filterCategoriesByPackageSelection(categories, selectedCategoryIds),
    [categories, selectedCategoryIds]
  )

  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase()
    if (!keyword) return categories || []

    return (categories || []).filter((category) =>
      category.name?.toLowerCase().includes(keyword)
    )
  }, [categories, categorySearch])

  useEffect(() => {
    if (!isOpen) return
    setCategorySearch('')

    if (isEdit) {
      reset({
        name: packageData?.name || '',
      })
    } else {
      reset(emptyValues)
    }
  }, [isOpen, isEdit, packageData, reset])

  const generatedSlug = useMemo(
    () =>
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    [name]
  )

  const categoryError = errors.categoryIds?.message || serverErrors.categoryIds
  const tierError =
    errors.subscriptionTierIds?.message || serverErrors.subscriptionTierIds

  if (isEdit) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={isSubmitting ? undefined : onClose}
        size="md"
        title="Edit Tryout Package"
        description="Ubah nama paket. Kelola kategori, soal, dan subscription tier melalui Manage pada detail paket."
        footer={
          <>
            <Button variant="soft" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="package-form"
              disabled={isSubmitting || isReferenceLoading}
            >
              {isSubmitting ? 'Saving...' : 'Update Package'}
            </Button>
          </>
        }
      >
        <form
          id="package-form"
          onSubmit={handleSubmit((values) => {
            if (isSubmitting || isReferenceLoading) return
            return onSubmit(values)
          })}
          className="space-y-5"
        >
          {serverErrors.general && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {serverErrors.general}
            </div>
          )}
          {isReferenceLoading && !serverErrors.general && (
            <p role="status" className="text-sm text-gray-500">Loading package...</p>
          )}
          <FormField
            label="Package Name"
            htmlFor="pkg-name"
            error={errors.name?.message || serverErrors.name}
          >
            <Input
              id="pkg-name"
              {...register('name')}
              disabled={isSubmitting || isReferenceLoading}
              error={errors.name || serverErrors.name}
              placeholder="Tryout SKD Paket 1"
            />
          </FormField>
        </form>
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? undefined : onClose}
      size="2xl"
      title="Add Tryout Package"
      description="Complete package information and minimum required assignments."
      footer={
        <>
          <Button variant="soft" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="package-form"
            disabled={isSubmitting || isReferenceLoading}
          >
            {isSubmitting ? 'Saving...' : 'Create Package'}
          </Button>
        </>
      }
    >
      <form
        id="package-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {serverErrors.general && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {serverErrors.general}
          </div>
        )}

        {/* Basic Information */}
        <SectionCard title="Basic Information">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Package Name"
              htmlFor="pkg-name"
              error={errors.name?.message || serverErrors.name}
            >
              <Input
                id="pkg-name"
                {...register('name')}
                error={errors.name || serverErrors.name}
                placeholder="Tryout SKD Paket 1"
              />
            </FormField>

            <FormField
              label="Slug"
              htmlFor="pkg-slug"
              error={errors.slug?.message || serverErrors.slug}
            >
              <div className="flex gap-2">
                <Input
                  id="pkg-slug"
                  {...register('slug')}
                  error={errors.slug || serverErrors.slug}
                  placeholder="tryout-skd-paket-1"
                />
                <Button
                  variant="outline"
                  onClick={() =>
                    setValue('slug', generatedSlug, { shouldValidate: true })
                  }
                >
                  Generate
                </Button>
              </div>
              {!slug && generatedSlug && (
                <p className="mt-1 text-xs text-gray-400">
                  Suggestion: {generatedSlug}
                </p>
              )}
            </FormField>

            <FormField
              className="md:col-span-2"
              label="Description"
              htmlFor="pkg-description"
              error={errors.description?.message || serverErrors.description}
            >
              <Textarea
                id="pkg-description"
                rows={3}
                {...register('description')}
                placeholder="Package description"
              />
            </FormField>

            <FormField
              label="Duration (minutes)"
              htmlFor="pkg-duration"
              error={errors.durationMinutes?.message || serverErrors.durationMinutes}
            >
              <Input
                id="pkg-duration"
                type="number"
                min="1"
                {...register('durationMinutes')}
                error={errors.durationMinutes}
              />
            </FormField>

            <FormField label="Passing Mode" htmlFor="pkg-passing-mode" error={errors.passingMode?.message || serverErrors.passingMode}>
              <Select id="pkg-passing-mode" {...register('passingMode')}>
                <option value="none">Tanpa evaluasi kelulusan</option>
                <option value="total">Berdasarkan skor total</option>
                <option value="category">Berdasarkan kategori</option>
              </Select>
            </FormField>

            {passingMode === 'total' && (
              <FormField label="Passing Score" htmlFor="pkg-passing" error={errors.passingScore?.message || serverErrors.passingScore}>
                <Input
                  id="pkg-passing"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('passingScore')}
                  error={errors.passingScore || serverErrors.passingScore}
                />
              </FormField>
            )}

            {passingMode === 'category' && (
              <div className="space-y-3 md:col-span-2">
                <p className="text-xs text-gray-500">
                  Isi batas setiap kategori yang memiliki soal dalam paket. Kosongkan kategori yang tidak memiliki soal. Semua batas harus terpenuhi agar peserta lulus.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {['twk', 'tiu', 'tkp'].map((slug) => (
                    <FormField key={slug} label={`Passing Grade ${slug.toUpperCase()}`} htmlFor={`pkg-grade-${slug}`} error={errors.passingGrades?.[slug]?.message || serverErrors[`passingGrades.${slug}`]}>
                      <Input
                        id={`pkg-grade-${slug}`}
                        type="number"
                        min="0"
                        step="0.01"
                        {...register(`passingGrades.${slug}`)}
                        error={errors.passingGrades?.[slug] || serverErrors[`passingGrades.${slug}`]}
                      />
                    </FormField>
                  ))}
                </div>
                {(errors.passingGrades?.message || serverErrors.passingGrades) && (
                  <p className="text-xs text-red-500">{errors.passingGrades?.message || serverErrors.passingGrades}</p>
                )}
              </div>
            )}

            <FormField
              label="Status"
              error={errors.status?.message || serverErrors.status}
            >
              <input type="hidden" {...register('status')} />
              <div className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm capitalize text-gray-700">
                {status || 'draft'}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Status is changed through Publish/Unpublish on Package Detail.
              </p>
            </FormField>

            <FormField label="Access" htmlFor="pkg-access" error={serverErrors.isFree}>
              <Select
                id="pkg-access"
                value={isFree ? 'true' : 'false'}
                onChange={(event) =>
                  setValue('isFree', event.target.value === 'true', {
                    shouldValidate: true,
                  })
                }
              >
                <option value="false">Paid</option>
                <option value="true">Free</option>
              </Select>
            </FormField>
          </div>
        </SectionCard>

        {/* Schedule */}
        <SectionCard
          title="Schedule"
          description="Jadwal membatasi waktu memulai ujian baru. Peserta yang sudah mulai tetap mendapat durasi penuh. Kosongkan tanggal jika tidak ada batas."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Start At"
              htmlFor="pkg-start"
              error={errors.startAt?.message || serverErrors.startAt}
            >
              <Input
                id="pkg-start"
                type="datetime-local"
                {...register('startAt')}
              />
            </FormField>

            <FormField
              label="End At"
              htmlFor="pkg-end"
              error={errors.endAt?.message || serverErrors.endAt}
            >
              <Input
                id="pkg-end"
                type="datetime-local"
                {...register('endAt')}
                error={errors.endAt}
              />
            </FormField>
          </div>
        </SectionCard>

        {/* Categories */}
        <SectionCard
          title="Categories"
          required
          description={`${selectedCategoryIds.length} categories selected`}
          action={
            <div className="relative w-full sm:w-72">
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
          }
        >
          {isReferenceLoading ? (
            <p className="text-sm text-gray-500">Loading options...</p>
          ) : (
            <>
              <div className="grid max-h-64 gap-2 overflow-y-auto md:grid-cols-2">
                {filteredCategories.map((category) => (
                  <CheckItem
                    key={category.id}
                    label={category.name}
                    value={String(category.id)}
                    {...register('categoryIds')}
                  />
                ))}
              </div>

              {filteredCategories.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                  No categories found.
                </p>
              )}
            </>
          )}

          {categoryError && (
            <p className="mt-2 text-xs text-red-500">{categoryError}</p>
          )}
        </SectionCard>

        {/* Questions */}
        <SectionCard
          title={`Questions (${selectedQuestions.length} selected)`}
          required
        >
          <Controller
            name="questionIds"
            control={control}
            render={({ field }) => (
              <QuestionGroupSelector
                categories={questionCategories}
                selectedQuestionIds={field.value || []}
                initialQuestions={packageData?.questions || []}
                disabled={isSubmitting}
                onChange={(ids) => field.onChange(ids)}
              />
            )}
          />

          {(errors.questionIds?.message || serverErrors.questions) && (
            <p className="mt-2 text-xs text-red-500">
              {errors.questionIds?.message || serverErrors.questions}
            </p>
          )}
        </SectionCard>

        {/* Subscription Tiers */}
        <SectionCard title="Subscription Tiers" required>
          {isReferenceLoading ? (
            <p className="text-sm text-gray-500">Loading options...</p>
          ) : tiers.length === 0 ? (
            <p className="text-sm text-gray-500">No data available.</p>
          ) : (
            <div className="grid max-h-64 gap-2 overflow-y-auto md:grid-cols-2">
              {tiers.map((tier) => (
                <CheckItem
                  key={tier.id}
                  label={tier.name}
                  meta={tier.price != null ? `Price: ${tier.price}` : ''}
                  value={String(tier.id)}
                  {...register('subscriptionTierIds')}
                />
              ))}
            </div>
          )}

          {tierError && <p className="mt-2 text-xs text-red-500">{tierError}</p>}
        </SectionCard>
      </form>
    </Modal>
  )
}

export default PackageFormModal
