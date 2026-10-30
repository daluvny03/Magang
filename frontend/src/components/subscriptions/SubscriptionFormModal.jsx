import { useModalFocus } from '../../hooks/useModalFocus'
import { useState } from 'react'
import { X } from 'lucide-react'

const DURATION_OPTIONS = [
    { value: 'day', label: 'Hari' },
    { value: 'month', label: 'Bulan' },
    { value: 'year', label: 'Tahun' },
]

const getInitialValues = (tier) => ({
    name: tier?.name || '',
    slug: tier?.slug || '',
    description: tier?.description || '',
    price: tier?.price != null ? String(tier.price) : '',
    durationValue:
        tier?.duration?.value != null
            ? String(tier.duration.value)
            : '',
    durationUnit: tier?.duration?.unit || 'month',
    level: tier?.level != null ? String(tier.level) : '',
    inheritedTierIds: (tier?.inheritedTierIds || []).map(String),
})

function SubscriptionFormModal({
    mode = 'create',
    tier = null,
    availableTiers = [],
    isSubmitting = false,
    onClose,
    onSubmit,
}) {
    const isEdit = mode === 'edit'
    const [values, setValues] = useState(() =>
        getInitialValues(tier)
    )
    const eligibleTiers = availableTiers.filter((item) => {
        const currentLevel = Number(values.level)

        return (
            Number.isInteger(currentLevel) &&
            currentLevel > 0 &&
            Number(item.level) < currentLevel &&
            String(item.id) !== String(tier?.id ?? '')
        )
    })
    const handleInheritanceChange = (tierId, checked) => {
        const normalizedId = String(tierId)

        setValues((prev) => ({
            ...prev,
            inheritedTierIds: checked
                ? [...new Set([
                    ...prev.inheritedTierIds,
                    normalizedId,
                ])]
                : prev.inheritedTierIds.filter(
                    (id) => id !== normalizedId
                ),
        }))

        setErrors((prev) => ({
            ...prev,
            inheritedTierIds: undefined,
        }))

        setServerError('')
    }
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState('')
    const dialogRef = useModalFocus(onClose, isSubmitting)
    const handleChange = (event) => {
        const { name, value } = event.target

        setValues((prev) => {
            const next = {
                ...prev,
                [name]: value,
            }

            if (name === 'level') {
                const newLevel = Number(value)

                next.inheritedTierIds =
                    prev.inheritedTierIds.filter((id) => {
                        const inheritedTier = availableTiers.find(
                            (item) => String(item.id) === id
                        )

                        return (
                            inheritedTier &&
                            Number(inheritedTier.level) < newLevel
                        )
                    })
            }

            return next
        })

        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
            inheritedTierIds: undefined,
        }))

        setServerError('')
    }

    const validate = () => {
        const nextErrors = {}

        const name = values.name.trim()
        const slug = values.slug.trim()
        const price = Number(values.price)
        const durationValue = Number(values.durationValue)
        const level = Number(values.level)

        if (!name || name.length > 100) {
            nextErrors.name = 'Nama wajib diisi, maksimal 100 karakter.'
        }

        if (
            !isEdit &&
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
        ) {
            nextErrors.slug =
                'Slug hanya boleh huruf kecil, angka, dan tanda hubung.'
        }

        if (!isEdit && slug.length > 100) {
            nextErrors.slug = 'Slug maksimal 100 karakter.'
        }

        if (
            values.price.trim() === '' ||
            !Number.isSafeInteger(price) ||
            price < 0 ||
            price > 999999999999
        ) {
            nextErrors.price =
                'Harga harus bilangan bulat antara 0 dan 999999999999.'
        }

        if (
            values.durationValue.trim() === '' ||
            !Number.isSafeInteger(durationValue) ||
            durationValue <= 0
        ) {
            nextErrors.durationValue =
                'Durasi harus bilangan bulat positif.'
        } else {
            const multiplier = {
                day: 1,
                month: 30,
                year: 365,
            }[values.durationUnit]

            if (
                !multiplier ||
                durationValue * multiplier > 2147483647
            ) {
                nextErrors.durationValue =
                    'Durasi melebihi batas yang didukung.'
            }
        }

        if (
            values.level.trim() === '' ||
            !Number.isSafeInteger(level) ||
            level <= 0 ||
            level > 2147483647
        ) {
            nextErrors.level =
                'Level harus bilangan bulat positif yang valid.'
        }

        const validIds = new Set(
            eligibleTiers.map((item) => String(item.id))
        )

        const selectedIds = values.inheritedTierIds

        if (
            new Set(selectedIds).size !== selectedIds.length ||
            selectedIds.some((id) => !validIds.has(id))
        ) {
            nextErrors.inheritedTierIds =
                'Pilihan inheritance tidak valid untuk level ini.'
        }
        return nextErrors
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        if (isSubmitting) return

        const validationErrors = validate()
        setErrors(validationErrors)

        if (Object.keys(validationErrors).length > 0) {
            return
        }

        const payload = {
            name: values.name.trim(),
            description: values.description.trim() || null,
            price: Number(values.price),
            duration: {
                value: Number(values.durationValue),
                unit: values.durationUnit,
            },
            level: Number(values.level),
            inheritedTierIds: values.inheritedTierIds,
        }

        if (!isEdit) {
            payload.slug = values.slug.trim()
        }

        try {
            setServerError('')
            await onSubmit(payload)
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                error.message ||
                'Gagal menyimpan subscription.'
            )
        }
    }

    const inputClass =
        'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm ' +
        'text-gray-900 outline-none focus:border-primary-500 ' +
        'focus:ring-2 focus:ring-primary-100 disabled:bg-gray-100'

    const renderError = (field) =>
        errors[field] ? (
            <p className="mt-1 text-xs text-red-600" role="alert">
                {errors[field]}
            </p>
        ) : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                ref={dialogRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="subscription-form-title"
                className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-xl"
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2
                            id="subscription-form-title"
                            className="text-lg font-semibold text-gray-900"
                        >
                            {isEdit
                                ? 'Edit Subscription'
                                : 'Tambah Subscription'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isEdit
                                ? 'Perbarui konfigurasi tier subscription.'
                                : 'Tambahkan tier subscription baru.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Tutup modal"
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form
                    id="subscription-tier-form"
                    onSubmit={handleSubmit}
                    className="space-y-4 overflow-y-auto p-6"
                >
                    {serverError && (
                        <div
                            role="alert"
                            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                        >
                            {serverError}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="tier-name"
                            className="mb-1 block text-sm font-medium"
                        >
                            Nama Subscription *
                        </label>
                        <input
                            id="tier-name"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            maxLength={100}
                            className={inputClass}
                            placeholder="Contoh: Premium Pro"
                        />
                        {renderError('name')}
                    </div>

                    <div>
                        <label
                            htmlFor="tier-slug"
                            className="mb-1 block text-sm font-medium"
                        >
                            Slug *
                        </label>
                        <input
                            id="tier-slug"
                            name="slug"
                            value={values.slug}
                            onChange={handleChange}
                            disabled={isEdit}
                            maxLength={100}
                            className={inputClass}
                            placeholder="Contoh: premium-pro"
                        />
                        {renderError('slug')}
                        {isEdit && (
                            <p className="mt-1 text-xs text-gray-500">
                                Slug tidak dapat diubah setelah tier dibuat.
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="tier-description"
                            className="mb-1 block text-sm font-medium"
                        >
                            Deskripsi
                        </label>
                        <textarea
                            id="tier-description"
                            name="description"
                            value={values.description}
                            onChange={handleChange}
                            rows={3}
                            className={inputClass}
                            placeholder="Deskripsi fitur subscription..."
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="tier-price"
                                className="mb-1 block text-sm font-medium"
                            >
                                Harga (Rp) *
                            </label>
                            <input
                                id="tier-price"
                                name="price"
                                type="number"
                                min="0"
                                step="1"
                                value={values.price}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="159000"
                            />
                            {renderError('price')}
                        </div>

                        <div>
                            <label
                                htmlFor="tier-level"
                                className="mb-1 block text-sm font-medium"
                            >
                                Level Akses *
                            </label>
                            <input
                                id="tier-level"
                                name="level"
                                type="number"
                                min="1"
                                step="1"
                                value={values.level}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="2"
                            />
                            {renderError('level')}
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="tier-duration-value"
                                className="mb-1 block text-sm font-medium"
                            >
                                Durasi *
                            </label>
                            <input
                                id="tier-duration-value"
                                name="durationValue"
                                type="number"
                                min="1"
                                step="1"
                                value={values.durationValue}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="1"
                            />
                            {renderError('durationValue')}
                        </div>

                        <div>
                            <label
                                htmlFor="tier-duration-unit"
                                className="mb-1 block text-sm font-medium"
                            >
                                Satuan Durasi *
                            </label>
                            <select
                                id="tier-duration-unit"
                                name="durationUnit"
                                value={values.durationUnit}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                {DURATION_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                Subscription Inheritance
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Pilih subscription level lebih rendah yang
                                hak aksesnya akan diwarisi oleh subscription ini.
                            </p>
                        </div>

                        {!values.level || Number(values.level) <= 0 ? (
                            <p className="text-sm text-gray-500">
                                Tentukan level subscription terlebih dahulu.
                            </p>
                        ) : eligibleTiers.length === 0 ? (
                            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                                Tidak ada subscription dengan level lebih rendah.
                            </p>
                        ) : (
                            <div className="max-h-56 space-y-2 overflow-y-auto">
                                {eligibleTiers.map((item) => {
                                    const id = String(item.id)
                                    const checked =
                                        values.inheritedTierIds.includes(id)

                                    return (
                                        <label
                                            key={id}
                                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 ${checked
                                                ? 'border-primary-300 bg-primary-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={(event) =>
                                                        handleInheritanceChange(
                                                            id,
                                                            event.target.checked
                                                        )
                                                    }
                                                    className="h-4 w-4 accent-primary-500"
                                                />

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {item.name}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {item.slug}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                                Level {item.level}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>
                        )}

                        {errors.inheritedTierIds && (
                            <p role="alert" className="text-xs text-red-600">
                                {errors.inheritedTierIds}
                            </p>
                        )}

                        <div className="rounded-lg bg-gray-50 p-3">
                            <p className="text-xs font-medium text-gray-700">
                                {values.inheritedTierIds.length} subscription dipilih
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Hak akses yang diwarisi juga mencakup inheritance
                                tidak langsung dari subscription yang dipilih.
                            </p>
                        </div>
                    </div>

                    <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                        Perubahan harga dan durasi berlaku untuk checkout
                        baru. Transaksi yang sudah dibuat menggunakan
                        snapshot pembayaran sebelumnya.
                    </p>
                </form>

                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        form="subscription-tier-form"
                        disabled={isSubmitting}
                        className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                    >
                        {isSubmitting
                            ? 'Menyimpan...'
                            : isEdit
                                ? 'Simpan Perubahan'
                                : 'Tambah Subscription'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SubscriptionFormModal