function Surface({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag
      className={`rounded-2xl border border-border bg-card shadow-soft ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export default Surface