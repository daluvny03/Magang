import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import EmptyState from '../../../components/common/EmptyState'
import ErrorState from '../../../components/common/ErrorState'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import Pagination from '../../../components/common/Pagination'
import PackageDetailModal from '../../../components/tryout-package/PackageDetailModal'
import PackageFilters from '../../../components/tryout-package/PackageFilters'
import PackageFormModal from '../../../components/tryout-package/PackageFormModal'
import PackageTable from '../../../components/tryout-package/PackageTable'
import PackageMappingModal from '../../../components/tryout-package/PackageMappingModal'

import { useCategories } from '../../../hooks/useCategories'
import { useQuestions } from '../../../hooks/useQuestions'
import { useSubscriptionTiers } from '../../../hooks/useSubscriptionTiers'
import {
  useCreateTryoutPackage,
  useTryoutPackage,
  useTryoutPackages,
  useUpdateTryoutPackage,
  useUpdateTryoutPackageCategories,
  useUpdateTryoutPackageQuestions,
  useUpdateTryoutPackageSubscriptionTiers,
  usePublishTryoutPackage,
  useUnpublishTryoutPackage,
} from '../../../hooks/useTryoutPackages'

function TryoutPackagePage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [selectedId, setSelectedId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [mappingType, setMappingType] = useState(null)

  const limit = 10
  const params = useMemo(() => ({
    page,
    limit,
    ...(search.trim() ? { search: search.trim() } : {}),
  }), [page, search])

  const {
    data: packageResponse,
    isLoading,
    isError,
    refetch,
  } = useTryoutPackages(params)

  const needsDetail = Boolean(selectedId) && (isDetailOpen || (isFormOpen && formMode === 'edit'))
  const {
    data: detailResponse,
    isLoading: isDetailLoading,
  } = useTryoutPackage(selectedId, needsDetail)

  const { data: categoryResponse, isLoading: categoriesLoading } = useCategories({ page: 1, limit: 100 })
  const { data: questionResponse, isLoading: questionsLoading } = useQuestions({ page: 1, limit: 100, isActive: 'true' })
  const { data: tierResponse, isLoading: tiersLoading } = useSubscriptionTiers({ page: 1, limit: 100 })

  const createMutation = useCreateTryoutPackage()
  const updateMutation = useUpdateTryoutPackage()
  const categoryMappingMutation = useUpdateTryoutPackageCategories()
  const questionMappingMutation = useUpdateTryoutPackageQuestions()
  const tierMappingMutation = useUpdateTryoutPackageSubscriptionTiers()
  const publishMutation = usePublishTryoutPackage()
  const unpublishMutation = useUnpublishTryoutPackage()

  const packages = packageResponse?.data || []
  const meta = packageResponse?.meta || { page: 1, limit, total: 0, totalPages: 0 }
  const categories = categoryResponse?.data || []
  const questions = questionResponse?.data || []
  const tiers = tierResponse?.data || []
  const packageData = detailResponse?.data || null

  const isSaving = createMutation.isPending || updateMutation.isPending
  const isReferenceLoading = categoriesLoading || questionsLoading || tiersLoading || (formMode === 'edit' && isDetailLoading)

  const handleOpenCreate = () => {
    createMutation.reset()
    updateMutation.reset()
    setSelectedId(null)
    setFormMode('create')
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    createMutation.reset()
    updateMutation.reset()
    setSelectedId(item.id)
    setFormMode('edit')
    setIsFormOpen(true)
  }

  const handleOpenDetail = (item) => {
    setSelectedId(item.id)
    setIsDetailOpen(true)
  }

  const handleCloseForm = () => {
    if (isSaving) return
    setIsFormOpen(false)
    setSelectedId(null)
  }

  const normalizePayload = (values) => ({
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description?.trim() || '',
    durationMinutes: Number(values.durationMinutes),
    passingScore: Number(values.passingScore),
    status: values.status,
    isFree: Boolean(values.isFree),
    startAt: values.startAt ? new Date(values.startAt).toISOString() : null,
    endAt: values.endAt ? new Date(values.endAt).toISOString() : null,
    categoryIds: values.categoryIds.map(Number),
    questions: values.questionIds.map((questionId, index) => ({
      questionId: Number(questionId),
      questionOrder: index + 1,
    })),
    subscriptionTierIds: values.subscriptionTierIds.map(Number),
  })

  const handleSubmit = async (values) => {
    const payload = normalizePayload(values)

    try {
      if (formMode === 'edit') {
        await updateMutation.mutateAsync({ id: selectedId, payload })
        toast.success('Tryout package updated successfully')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Tryout package created successfully')
      }
      handleCloseForm()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tryout package')
    }
  }


  const handleSaveMapping = async (value) => {
    if (!selectedId || !mappingType) return
    try {
      if (mappingType === 'categories') await categoryMappingMutation.mutateAsync({ id: selectedId, categoryIds: value })
      if (mappingType === 'questions') await questionMappingMutation.mutateAsync({ id: selectedId, questions: value })
      if (mappingType === 'tiers') await tierMappingMutation.mutateAsync({ id: selectedId, subscriptionTierIds: value })
      toast.success('Package mapping updated successfully')
      setMappingType(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update package mapping')
    }
  }

  const handlePublish = async () => {
    try { await publishMutation.mutateAsync(selectedId); toast.success('Tryout package published successfully') }
    catch (error) { toast.error(error.response?.data?.message || 'Failed to publish tryout package') }
  }

  const handleUnpublish = async () => {
    try { await unpublishMutation.mutateAsync(selectedId); toast.success('Tryout package unpublished successfully') }
    catch (error) { toast.error(error.response?.data?.message || 'Failed to unpublish tryout package') }
  }

  const getServerErrors = () => {
    const mutation = formMode === 'edit' ? updateMutation : createMutation
    const data = mutation.error?.response?.data
    if (!data) return {}

    const errors = {}
    if (Array.isArray(data.errors)) {
      data.errors.forEach((item) => {
        if (item.field && item.message) errors[item.field] = item.message
        else if (item.message && !errors.general) errors.general = item.message
      })
    }
    if (data.message && !errors.general && mutation.error?.response?.status === 409) {
      errors.general = data.message
    }
    return errors
  }

  if (isLoading && !packageResponse) {
    return <div className="flex min-h-[400px] items-center justify-center"><LoadingSpinner /></div>
  }

  if (isError) {
    return <ErrorState title="Failed to load tryout packages" message="Unable to retrieve tryout package data." onRetry={refetch} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tryout Packages</h1>
          <p className="mt-1 text-sm text-gray-500">Manage tryout package configuration and assignments.</p>
        </div>
        <button type="button" onClick={handleOpenCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          <Plus size={18} /> Add Package
        </button>
      </div>

      <PackageFilters
        search={search}
        onSearchChange={(event) => { setSearch(event.target.value); setPage(1) }}
        onReset={() => { setSearch(''); setPage(1) }}
      />

      {packages.length === 0 ? (
        <EmptyState title="No tryout packages found" message={search ? 'No packages match your search.' : 'There are no tryout packages yet.'} />
      ) : (
        <>
          <PackageTable packages={packages} onView={handleOpenDetail} onEdit={handleOpenEdit} />
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} />
        </>
      )}

      <PackageFormModal
        isOpen={isFormOpen}
        mode={formMode}
        packageData={packageData}
        categories={categories}
        questions={questions}
        tiers={tiers}
        isSubmitting={isSaving}
        isReferenceLoading={isReferenceLoading}
        serverErrors={getServerErrors()}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
      />

      <PackageDetailModal
        isOpen={isDetailOpen}
        response={detailResponse}
        isLoading={isDetailLoading}
        isStatusSaving={publishMutation.isPending || unpublishMutation.isPending}
        onManageCategories={() => setMappingType('categories')}
        onManageQuestions={() => setMappingType('questions')}
        onManageTiers={() => setMappingType('tiers')}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onClose={() => { setIsDetailOpen(false); setSelectedId(null); setMappingType(null) }}
      />

      <PackageMappingModal
        isOpen={Boolean(mappingType)}
        type={mappingType}
        packageData={packageData}
        categories={categories}
        questions={questions}
        tiers={tiers}
        isSaving={categoryMappingMutation.isPending || questionMappingMutation.isPending || tierMappingMutation.isPending}
        onClose={() => setMappingType(null)}
        onSave={handleSaveMapping}
      />
    </div>
  )
}

export default TryoutPackagePage
