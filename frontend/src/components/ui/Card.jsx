function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl bg-white p-5 shadow-card ${className}`}>
      {children}
    </div>
  )
}

export default Card