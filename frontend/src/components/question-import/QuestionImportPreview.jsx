import Alert from '../ui/Alert'
import Button from '../ui/Button'
import DataTable from '../ui/DataTable'
import StatCard from '../ui/StatCard'

function QuestionImportPreview({ preview, onBack, onConfirm, isProcessing }) {
  if (!preview) return null

  const { totalRows = 0, validRows = 0, invalidRows = 0, errors = [] } = preview
  const canImport = validRows > 0 && invalidRows === 0

  const columns = [
    { key: 'row', header: 'Row' },
    { key: 'field', header: 'Field', render: (e) => e.field || '-' },
    {
      key: 'message',
      header: 'Error',
      render: (e) => (
        <span className="text-red-600">
          {e.message}
          {e.duplicateOf && (
            <span className="mt-0.5 block text-xs text-gray-500">
              Duplicate of row {e.duplicateOf}
            </span>
          )}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Import Preview</h3>
        <p className="mt-1 text-xs text-gray-500">
          Review the validation result before importing.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Rows" value={totalRows} />
        <StatCard label="Valid Rows" value={validRows} tone="green" />
        <StatCard label="Invalid Rows" value={invalidRows} tone="red" />
      </div>

      {errors.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-red-200 p-2">
          <DataTable
            columns={columns}
            data={errors.map((e, i) => ({ ...e, id: i }))}
          />
        </div>
      )}

      {canImport && (
        <Alert tone="green">All {validRows} row(s) are valid and ready to import.</Alert>
      )}

      {invalidRows > 0 && (
        <Alert tone="yellow">
          <p className="font-medium">Import cannot continue.</p>
          <p className="mt-1">
            {invalidRows} row(s) contain validation errors. Fix the file and upload it again.
          </p>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="soft" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={isProcessing || !canImport}>
          {isProcessing ? 'Importing...' : 'Confirm Import'}
        </Button>
      </div>
    </div>
  )
}

export default QuestionImportPreview