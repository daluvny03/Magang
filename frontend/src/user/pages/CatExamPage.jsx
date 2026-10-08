import { useParams } from 'react-router-dom'

function CatExamPage() {
  const { attemptId } = useParams()

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">
        CAT Exam
      </h1>

      <p className="mt-2 text-sm text-gray-600">
        Attempt ID: {attemptId}
      </p>
    </div>
  )
}

export default CatExamPage