
import { Fragment, useMemo } from 'react'
import { InlineMath, BlockMath } from 'react-katex'

// Dukungan sintaks:
// \( ... \)  : inline
// \[ ... \]  : block
// $$ ... $$  : block

const MATH_PATTERN =
  /(\\\[[\s\S]+?\\\]|\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\))/g

function parseMathContent(content) {
  const parts = []
  let lastIndex = 0

  for (const match of content.matchAll(MATH_PATTERN)) {
    const index = match.index
    const raw = match[0]

    if (index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, index),
      })
    }

    const isBlock =
      raw.startsWith('\\[') || raw.startsWith('$$')

    const delimiterLength =
      raw.startsWith('$$') ? 2 : 2

    parts.push({
      type: isBlock ? 'block' : 'inline',
      value: raw.slice(
        delimiterLength,
        -delimiterLength
      ),
    })

    lastIndex = index + raw.length
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    })
  }

  return parts
}

function MathText({ content = '', className = '' }) {
  const value = String(content ?? '')

  const parts = useMemo(
    () => parseMathContent(value),
    [value]
  )

  const renderError = ({ error }) => (
    <span
      className="text-red-600"
      title={error?.message ?? 'Invalid LaTeX'}
    >
      [Rumus tidak valid]
    </span>
  )

  return (
    <div
      className={`math-content whitespace-pre-wrap break-words ${className}`}
    >
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part.type === 'text' && part.value}

          {part.type === 'inline' && (
            <InlineMath
              math={part.value}
              renderError={renderError}
              settings={{
                trust: false,
                strict: 'warn',
                maxExpand: 1000,
                maxSize: 10,
              }}
            />
          )}

          {part.type === 'block' && (
            <div className="my-3 max-w-full overflow-x-auto">
              <BlockMath
                math={part.value}
                renderError={renderError}
                settings={{
                  trust: false,
                  strict: 'warn',
                  maxExpand: 1000,
                  maxSize: 10,
                }}
              />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}

export default MathText
