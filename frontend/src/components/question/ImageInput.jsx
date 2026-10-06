import { useEffect, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getImageUrl } from '../../utils/image-url'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

function useImageSrc(image, file, removed) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setSrc(url)
      return () => URL.revokeObjectURL(url)
    }
    setSrc(image && !removed ? getImageUrl(image) : null)
  }, [image, file, removed])

  return src
}

export function ImagePreview({ image, file, removed, alt, className }) {
  const src = useImageSrc(image, file, removed)
  return src ? <img src={src} alt={alt} className={className} /> : null
}

function ImageInput({
  image,
  file,
  removed,
  onPick,
  onRemove,
  label = 'Add Image',
  previewClass = 'max-h-40',
}) {
  const src = useImageSrc(image, file, removed)

  const handleChange = (e) => {
    const picked = e.target.files?.[0]
    e.target.value = ''
    if (!picked) return
    if (!ALLOWED.includes(picked.type)) {
      return toast.error('Image must be JPEG, PNG or WebP')
    }
    if (picked.size > MAX_SIZE) {
      return toast.error('Image must not exceed 5 MB')
    }
    onPick(picked)
  }

  return (
    <div className="space-y-2">
      {src && (
        <img
          src={src}
          alt=""
          className={`${previewClass} max-w-full rounded-lg border border-gray-200 object-contain`}
        />
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-primary-600 hover:text-primary-700">
          <ImagePlus size={16} />
          {src ? 'Replace Image' : label}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleChange}
          />
        </label>

        {src && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700"
          >
            <Trash2 size={15} />
            Remove
          </button>
        )}
      </div>
    </div>
  )
}

export default ImageInput