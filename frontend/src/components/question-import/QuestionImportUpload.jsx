import { Archive, Upload, X } from 'lucide-react'
import Alert from '../ui/Alert'
import IconButton from '../ui/IconButton'

function QuestionImportUpload({ file, error, onFileChange, onRemove }) {
  const handleChange = (e) => {
    const selected = e.target.files?.[0]
    e.target.value = '' // agar file yang sama bisa dipilih lagi
    if (selected) onFileChange(selected)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Upload Import Package</h3>
        <p className="mt-1 text-xs text-gray-500">
          Upload a ZIP file containing questions.xlsx and the referenced question images.
        </p>
      </div>

      <Alert>
        <p className="font-medium">Required ZIP structure</p>
        <pre className="mt-2 font-mono text-xs leading-5">
{`questions.zip
├── questions.xlsx
└── images/
    ├── question-1.png
    └── option-a.png`}
        </pre>
      </Alert>

      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 transition hover:border-primary-500 hover:bg-primary-50">
          <Upload className="mb-3 text-primary-500" size={32} />
          <span className="text-sm font-medium text-gray-700">Choose ZIP file</span>
          <span className="mt-1 text-xs text-gray-500">.zip, maximum 50 MB</span>
          <input
            type="file"
            accept=".zip,application/zip"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Archive size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <IconButton label="Remove file" onClick={onRemove}>
            <X size={18} />
          </IconButton>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default QuestionImportUpload