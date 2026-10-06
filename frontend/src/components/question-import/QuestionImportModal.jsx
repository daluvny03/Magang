import { useState } from 'react'

import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import QuestionImportPreview from './QuestionImportPreview'
import QuestionImportResult from './QuestionImportResult'
import QuestionImportUpload from './QuestionImportUpload'
import { importQuestions, previewQuestionImport } from '../../services/question-import.service'

const MAX_FILE_SIZE = 50 * 1024 * 1024

const validateFile = (file) => {
  if (!file) return 'Please select a ZIP file'
  if (!file.name.toLowerCase().endsWith('.zip')) return 'Only ZIP files (.zip) are allowed'
  if (file.size === 0) return 'The selected file is empty'
  if (file.size > MAX_FILE_SIZE) return 'ZIP file must not exceed 50 MB'
  return ''
}

function QuestionImportModal({ isOpen, onClose, onImportSuccess }) {
  const [step, setStep] = useState('upload')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [preview, setPreview] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [importError, setImportError] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const isBusy = isPreviewLoading || isImporting

  const handleFileChange = (selected) => {
    const error = validateFile(selected)
    setFile(error ? null : selected)
    setFileError(error)
    setPreviewError('')
  }

  const handleRemoveFile = () => {
    setFile(null)
    setFileError('')
    setPreview(null)
    setPreviewError('')
  }

  const handleClose = () => {
    if (isBusy) return
    setStep('upload')
    setFile(null)
    setFileError('')
    setPreview(null)
    setPreviewError('')
    setImportResult(null)
    setImportError('')
    onClose()
  }

  const handleContinue = async () => {
    if (!file) return setFileError('Please select a ZIP file')

    try {
      setIsPreviewLoading(true)
      setPreviewError('')
      setImportError('')
      const result = await previewQuestionImport(file)
      setPreview(result.data)
      setStep('preview')
    } catch (error) {
      setPreviewError(error.response?.data?.message || 'Failed to preview import file')
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleBack = () => {
    if (isImporting) return
    setPreview(null)
    setPreviewError('')
    setImportError('')
    setStep('upload')
  }

  const handleConfirmImport = async () => {
    if (!file || !preview) return

    if (preview.invalidRows > 0 || preview.validRows === 0) {
      return setImportError('Import cannot continue while invalid rows exist.')
    }

    try {
      setIsImporting(true)
      setImportError('')
      const result = await importQuestions(file)
      setImportResult(result.data)
      setStep('result')
      onImportSuccess?.()
    } catch (error) {
      setImportError(error.response?.data?.message || 'Failed to import questions')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title="Import Questions"
      description="Import multiple questions using a ZIP package."
    >
      {step === 'upload' && (
        <div className="space-y-4">
          <QuestionImportUpload
            file={file}
            error={fileError}
            onFileChange={handleFileChange}
            onRemove={handleRemoveFile}
          />

          {previewError && <Alert tone="red">{previewError}</Alert>}

          <div className="flex justify-end gap-2">
            <Button variant="soft" onClick={handleClose} disabled={isPreviewLoading}>
              Cancel
            </Button>
            <Button onClick={handleContinue} disabled={!file || isPreviewLoading}>
              {isPreviewLoading ? 'Checking...' : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-4">
          <QuestionImportPreview
            preview={preview}
            onBack={handleBack}
            onConfirm={handleConfirmImport}
            isProcessing={isImporting}
          />
          {importError && <Alert tone="red">{importError}</Alert>}
        </div>
      )}

      {step === 'result' && importResult && (
        <QuestionImportResult result={importResult} onClose={handleClose} />
      )}
    </Modal>
  )
}

export default QuestionImportModal