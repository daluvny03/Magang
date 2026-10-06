import { CheckCircle2 } from 'lucide-react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import StatCard from '../ui/StatCard'

function QuestionImportResult({ result, onClose }) {
  const { sheetName, totalRows = 0, insertedRows = 0 } = result

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={22} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Import completed successfully
          </h3>
          <p className="text-xs text-gray-500">
            All validated questions have been imported.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Sheet" value={sheetName || '-'} />
        <StatCard label="Total Rows" value={totalRows} />
        <StatCard label="Imported" value={insertedRows} tone="green" />
      </div>

      <Alert tone="green">
        {insertedRows} question(s) were successfully added to the question bank.
      </Alert>

      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  )
}

export default QuestionImportResult