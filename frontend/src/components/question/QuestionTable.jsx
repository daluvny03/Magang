import { Edit, Power, PowerOff } from 'lucide-react'
import Badge from '../ui/Badge'
import DataTable from '../ui/DataTable'
import IconButton from '../ui/IconButton'
import { DIFFICULTY_OPTIONS } from '../../constants/question'

const difficultyLabel = (v) =>
  DIFFICULTY_OPTIONS.find((o) => o.value === Number(v))?.label || '-'

function QuestionTable({ questions, onEdit, onStatusChange, isStatusSaving }) {
  const columns = [
    {
      key: 'questionText',
      header: 'Question',
      render: (q) => (
        <p className="line-clamp-2 max-w-md font-medium text-gray-900">
          {q.questionText}
        </p>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (q) => q.category?.name || q.categoryName || '-',
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (q) => <Badge>{difficultyLabel(q.difficulty)}</Badge>,
    },
    { key: 'score', header: 'Score' },
    {
      key: 'isActive',
      header: 'Status',
      render: (q) => (
        <Badge tone={q.isActive ? 'green' : 'gray'}>
          {q.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      hideable: false,
      className: 'text-right',
      render: (q) => (
        <div className="flex justify-end gap-1">
          <IconButton label="Edit question" onClick={() => onEdit(q)}>
            <Edit size={17} />
          </IconButton>
          <IconButton
            label={q.isActive ? 'Deactivate question' : 'Activate question'}
            onClick={() => onStatusChange(q)}
            disabled={isStatusSaving}
            className={q.isActive ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-green-50 hover:text-green-600'}
          >
            {q.isActive ? <PowerOff size={17} /> : <Power size={17} />}
          </IconButton>
        </div>
      ),
    },
  ]

  return <DataTable columns={columns} data={questions} columnToggle />
}

export default QuestionTable
