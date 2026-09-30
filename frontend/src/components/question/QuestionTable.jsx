import { Edit, Trash2 } from 'lucide-react'
import {
    DIFFICULTY_OPTIONS,
} from '../../constants/question'

const getDifficultyLabel = (value) => {
    const difficulty = DIFFICULTY_OPTIONS.find(
        (option) => option.value === Number(value),
    )

    return difficulty?.label || '-'
}

function QuestionTable({
    questions,
    onEdit,
    onDelete,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Question
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Category
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Difficulty
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Score
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Status
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {questions.map((question) => (
                            <tr key={question.id} className="hover:bg-gray-50">
                                <td className="max-w-md px-6 py-4">
                                    <p className="line-clamp-2 text-sm font-medium text-gray-900">
                                        {question.questionText}
                                    </p>
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                    {question.category?.name ||
                                        question.categoryName ||
                                        '-'}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                                        {getDifficultyLabel(question.difficulty) || '-'}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                    {question.score ?? '-'}
                                </td>

                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${question.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {question.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(question)}
                                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                            title="Edit question"
                                        >
                                            <Edit size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(question)}
                                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                            title="Delete question"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default QuestionTable