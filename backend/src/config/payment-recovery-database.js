import pg from 'pg'
import { env } from './env.js'

// Pool terpisah agar timeout recovery tidak mengubah query HTTP/CAT existing.
// Pool bersifat lazy: import tidak membuka koneksi database.
export const recoveryPool = new pg.Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
  application_name: 'cat-payment-recovery',
  max: 4,
  connectionTimeoutMillis: 5000,
  lock_timeout: 5000,
  statement_timeout: 15000,
  query_timeout: 20000,
  idle_in_transaction_session_timeout: 30000,
})

recoveryPool.on('error', (error) => {
  console.error('Payment recovery database error:', {
    code: error.code ?? 'RECOVERY_DATABASE_ERROR',
  })
})
