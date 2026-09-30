import { CheckCircle2, AlertTriangle } from 'lucide-react'

function QuestionImportResult({ result, onClose }) {
  const {
    sheetName,
    totalRows,
    validRows,
    invalidRows,
    insertedRows,
    skippedRows,
    errors = [],
  } = result

  const hasSkippedRows = skippedRows > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {hasSkippedRows ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <AlertTriangle size={22} />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 size={22} />
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {hasSkippedRows
              ? 'Import completed with some skipped rows'
              : 'Import completed successfully'}
          </h3>

          <p className="text-sm text-gray-500">
            Sheet: {sheetName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">
            Total Rows
          </p>

          <p className="mt-1 text-xl font-semibold text-gray-900">
            {totalRows}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">
            Valid Rows
          </p>

          <p className="mt-1 text-xl font-semibold text-green-600">
            {validRows}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">
            Imported
          </p>

          <p className="mt-1 text-xl font-semibold text-blue-600">
            {insertedRows}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">
            Skipped
          </p>

          <p className="mt-1 text-xl font-semibold text-red-600">
            {skippedRows}
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div>
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900">
              Skipped Row Errors
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              These rows were not imported because they failed validation.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
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

              <tbody className="divide-y divide-gray-200 bg-white">
                {errors.map((error, index) => (
                  <tr key={`${error.row}-${error.field}-${index}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {error.row}
                    </td>

                    <td className="px-4 py-3 text-gray-600">
                      {error.field}
                    </td>

                    <td className="px-4 py-3 text-red-600">
                      <div>
                        {error.message}
                      </div>

                      {error.duplicateOf && (
                        <p className="mt-1 text-xs text-gray-500">
                          Duplicate of row {error.duplicateOf}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  )
}

export default QuestionImportResult