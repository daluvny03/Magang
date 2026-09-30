import { FileSpreadsheet, Upload, X } from 'lucide-react'

function QuestionImportUpload({
  file,
  error,
  onFileChange,
  onRemove,
}) {
  const handleChange = (event) => {
    const selectedFile = event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    onFileChange(selectedFile)

    // Supaya file yang sama bisa dipilih lagi setelah dihapus.
    event.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Upload Excel File
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Upload an Excel file containing the questions to import.
        </p>
      </div>

      {!file ? (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 transition hover:border-blue-400 hover:bg-blue-50/30">
          <Upload className="mb-3 text-gray-400" size={32} />

          <span className="text-sm font-medium text-gray-700">
            Choose Excel file
          </span>

          <span className="mt-1 text-xs text-gray-500">
            .xlsx or .xls
          </span>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <FileSpreadsheet size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">
                {file.name}
              </p>

              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="ml-4 rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            title="Remove file"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default QuestionImportUpload