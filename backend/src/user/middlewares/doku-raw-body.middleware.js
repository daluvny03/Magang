
import express from 'express'

export const dokuRawBody = express.raw({
  type: 'application/json',
  limit: '128kb',
})
