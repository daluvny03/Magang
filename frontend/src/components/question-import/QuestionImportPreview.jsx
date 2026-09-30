function QuestionImportPreview({
  preview,
  onBack,
  onConfirm,
  isProcessing,
}) {
  if (!preview) {
    return null
  }

  const {
    totalRows = 0,
    validRows = 0,
    invalidRows = 0,
    errors = [],
  } = preview

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Import Preview
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Review the validation result before importing.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">
            Total Rows
          </p>

          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {totalRows}
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-700">
            Valid Rows
          </p>

          <p className="mt-1 text-2xl font-semibold text-green-700">
            {validRows}
          </p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Invalid Rows
          </p>

          <p className="mt-1 text-2xl font-semibold text-red-700">
            {invalidRows}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-red-200">
          <div className="border-b border-red-200 bg-red-50 px-4 py-3">
            <h4 className="text-sm font-semibold text-red-800">
              Validation Errors
            </h4>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Row
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Field
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Error
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {errors.map((error, index) => (
                  <tr key={`${error.row}-${error.field}-${index}`}>
                    <td className="px-4 py-3 text-gray-700">
                      {error.row}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {error.field || '-'}
                    </td>

                    <td className="px-4 py-3 text-red-600">
                      {error.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invalidRows === 0 && validRows > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          All rows are valid and ready to import.
        </div>
      )}

      {invalidRows > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          {invalidRows} row(s) contain validation errors.
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing || validRows === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm Import
        </button>
      </div>
    </div>
  )
}

export default QuestionImportPreview