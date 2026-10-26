
import { useState } from 'react'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'

import Alert from '../ui/Alert'
import Button from '../ui/Button'
import DataTable from '../ui/DataTable'
import StatCard from '../ui/StatCard'
import MathText from '../common/MathText'

const EXPLANATION_FIELDS = [
  ['summary', 'Summary'],
  ['detail', 'Detail'],
  ['tips', 'Tips'],
]

function QuestionImportPreview({
  preview,
  onBack,
  onConfirm,
  isProcessing,
}) {
  const [selectedRow, setSelectedRow] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)

  if (!preview) return null

  const {
    totalRows = 0,
    validRows = 0,
    invalidRows = 0,
    errors = [],
    preview: previewRows = [],
  } = preview

  const canImport = validRows > 0 && invalidRows === 0

  const validPreviewRows = previewRows.filter(
    (row) => row.valid && row.data
  )

  const currentRow =
    validPreviewRows.find(
      (row) => row.rowNumber === selectedRow
    ) ?? validPreviewRows[0]

  const currentIndex = validPreviewRows.indexOf(currentRow)
  const selectRow = (index) => {
    const row = validPreviewRows[index]
    if (!row) return
    setSelectedRow(row.rowNumber)
    setShowExplanation(false)
  }
  const question = currentRow?.data

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
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Import Preview
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Review the validation result before importing.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Rows" value={totalRows} />
        <StatCard label="Valid Rows" value={validRows} tone="green" />
        <StatCard label="Invalid Rows" value={invalidRows} tone="red" />
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-red-200 p-2">
          <DataTable
            columns={columns}
            data={errors.map((e, i) => ({ ...e, id: i }))}
          />
        </div>
      )}

      {/* Validation Status */}
      {canImport && (
        <Alert tone="green">
          All {validRows} row(s) are valid and ready to import.
        </Alert>
      )}

      {invalidRows > 0 && (
        <Alert tone="yellow">
          <p className="font-medium">
            Import cannot continue.
          </p>

          <p className="mt-1">
            {invalidRows} row(s) contain validation errors.
            Fix the file and upload it again.
          </p>
        </Alert>
      )}

      {/* Question Preview */}
      {validPreviewRows.length > 0 && (
        <div className="space-y-4 rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Question Preview
              </h4>

              <p className="mt-1 text-xs text-gray-500">
                Preview question content before importing.
              </p>
            </div>

            <select
              aria-label="Pilih baris soal preview"
              value={currentRow?.rowNumber ?? ''}
              onChange={(e) => {
                setSelectedRow(Number(e.target.value))
                setShowExplanation(false)
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
            >
              {validPreviewRows.map((row) => (
                <option
                  key={row.rowNumber}
                  value={row.rowNumber}
                >
                  Excel Row {row.rowNumber}
                </option>
              ))}
            </select>
          </div>

          <nav aria-label="Navigasi preview import" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" disabled={currentIndex <= 0} onClick={() => selectRow(currentIndex - 1)}>
                <ChevronLeft size={16} /> Sebelumnya
              </Button>
              <p aria-live="polite" className="text-xs text-gray-500">
                Soal {currentIndex + 1} dari {validPreviewRows.length} · Baris {currentRow?.rowNumber}
              </p>
              <Button variant="outline" disabled={currentIndex >= validPreviewRows.length - 1} onClick={() => selectRow(currentIndex + 1)}>
                Berikutnya <ChevronRight size={16} />
              </Button>
            </div>
            <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto p-1">
              {validPreviewRows.map((row, index) => (
                <button key={row.rowNumber} type="button" onClick={() => selectRow(index)}
                  aria-label={`Soal ${index + 1}, baris Excel ${row.rowNumber}`}
                  aria-current={index === currentIndex ? 'step' : undefined}
                  className={`h-9 min-w-9 rounded-lg border px-2 text-sm font-semibold ${index === currentIndex ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 bg-white text-gray-700'}`}>
                  {index + 1}
                </button>
              ))}
            </div>
          </nav>

          {question && (
            <div className="space-y-5">
              {/* Question Text */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Question
                </p>

                <MathText
                  content={question.questionText}
                  className="text-sm leading-7 text-gray-900"
                />

                {question.questionImageName && (
                  <p className="text-xs text-gray-500">
                    Question image: {question.questionImageName}
                  </p>
                )}
              </div>

              {/* Answer Options */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Answer Options
                </p>

                {question.answerOptions?.map((option) => {
                  const isCorrect =
                    question.correctAnswer === option.key

                  return (
                    <div
                      key={option.key}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        isCorrect
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                          isCorrect
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {option.key}
                      </span>

                      <div className="min-w-0 flex-1 space-y-2">
                        {option.text && (
                          <MathText
                            content={option.text}
                            className="text-sm leading-6 text-gray-800"
                          />
                        )}

                        {option.imageName && (
                          <p className="text-xs text-gray-500">
                            Image: {option.imageName}
                          </p>
                        )}

                        {option.score !== undefined && (
                          <p className="text-xs text-gray-500">
                            Score: {option.score}
                          </p>
                        )}
                      </div>

                      {isCorrect && (
                        <span className="shrink-0 text-xs font-semibold text-green-700">
                          Correct
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Explanation */}
              <div className="rounded-lg bg-gray-50 p-4">
                <button
                  type="button"
                  onClick={() =>
                    setShowExplanation((current) => !current)
                  }
                  aria-expanded={showExplanation}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">
                    Explanation
                  </span>

                  {showExplanation
                    ? <ChevronUp size={16} />
                    : <ChevronDown size={16} />}
                </button>

                {showExplanation && (
                  <div className="mt-4 space-y-4">
                    {EXPLANATION_FIELDS.map(([key, label]) => {
                      const content = question.explanation?.[key]

                      if (!content) return null

                      return (
                        <div key={key} className="space-y-1">
                          <p className="text-xs font-semibold text-gray-700">
                            {label}
                          </p>

                          <MathText
                            content={content}
                            className="text-sm leading-6 text-gray-600"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import Actions */}
      <div className="flex justify-end gap-2">
        <Button
          variant="soft"
          onClick={onBack}
          disabled={isProcessing}
        >
          Back
        </Button>

        <Button
          onClick={onConfirm}
          disabled={isProcessing || !canImport}
        >
          {isProcessing ? 'Importing...' : 'Confirm Import'}
        </Button>
      </div>
    </div>
  )
}

export default QuestionImportPreview
