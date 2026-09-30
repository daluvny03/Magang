import { X } from 'lucide-react'
import { useState } from 'react'

import QuestionImportUpload from './QuestionImportUpload'
import QuestionImportPreview from './QuestionImportPreview'
import QuestionImportResult from './QuestionImportResult'
import {
    previewQuestionImport,
    importQuestions,
} from '../../services/question-import.service'

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls']

function QuestionImportModal({
    isOpen,
    onClose,
}) {
    const [step, setStep] = useState('upload')
    const [preview, setPreview] = useState(null)
    const [isPreviewLoading, setIsPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState('')
    const [file, setFile] = useState(null)
    const [fileError, setFileError] = useState('')
    const [isImporting, setIsImporting] = useState(false)
    const [importResult, setImportResult] = useState(null)
    const [importError, setImportError] = useState('')

    if (!isOpen) {
        return null
    }

    const validateFile = (selectedFile) => {
        const extension = selectedFile.name
            .slice(selectedFile.name.lastIndexOf('.'))
            .toLowerCase()

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return 'Only Excel files (.xlsx, .xls) are allowed'
        }

        if (selectedFile.size === 0) {
            return 'The selected file is empty'
        }

        return ''
    }

    const handleFileChange = (selectedFile) => {
        const error = validateFile(selectedFile)

        if (error) {
            setFile(null)
            setFileError(error)
            return
        }

        setFile(selectedFile)
        setFileError('')
    }

    const handleRemoveFile = () => {
        setFile(null)
        setFileError('')
    }

    const handleClose = () => {
        setFile(null)
        setFileError('')
        setPreview(null)
        setPreviewError('')
        setImportResult(null)
        setImportError('')
        setStep('upload')
        setIsPreviewLoading(false)
        setIsImporting(false)

        onClose()
    }

    const handleContinue = async () => {
        if (!file) {
            setFileError('Please select an Excel file')
            return
        }

        try {
            setIsPreviewLoading(true)
            setPreviewError('')

            const result = await previewQuestionImport(file)

            setPreview(result.data)
            setStep('preview')
        } catch (error) {
            const message =
                error.response?.data?.message ||
                'Failed to preview import file'

            setPreviewError(message)
        } finally {
            setIsPreviewLoading(false)
        }
    }

    const handleConfirmImport = async () => {
        if (!file) {
            return
        }

        try {
            setIsImporting(true)
            setImportError('')

            const result = await importQuestions(file)

            setImportResult(result.data)
            setStep('result')
        } catch (error) {
            const message =
                error.response?.data?.message ||
                'Failed to import questions'

            setImportError(message)
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Import Questions
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Import multiple questions using an Excel file.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto px-6 py-6">
                    {step === 'upload' && (
                        <div className="space-y-4">
                            <QuestionImportUpload
                                file={file}
                                error={fileError}
                                onFileChange={handleFileChange}
                                onRemove={handleRemoveFile}
                            />

                            {previewError && (
                                <p className="text-sm text-red-600">
                                    {previewError}
                                </p>
                            )}
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={handleContinue}
                                    disabled={!file || isPreviewLoading}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isPreviewLoading ? 'Checking...' : 'Continue'}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <QuestionImportPreview
                            preview={preview}
                            onBack={() => {
                                setPreview(null)
                                setPreviewError('')
                                setStep('upload')
                            }}
                            onConfirm={handleConfirmImport}
                            isProcessing={isImporting}
                        />
                    )}

                    {importError && (
                        <p className="text-sm text-red-600">
                            {importError}
                        </p>
                    )}

                    {step === 'result' && importResult && (
                        <QuestionImportResult
                            result={importResult}
                            onClose={handleClose}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuestionImportModal