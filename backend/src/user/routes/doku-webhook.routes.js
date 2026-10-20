
import { Router } from 'express'

import { dokuRawBody } from '../middlewares/doku-raw-body.middleware.js'
import { receiveDokuNotification } from '../controllers/doku-webhook.controller.js'

const router = Router()

router.post(
  '/notifications',
  dokuRawBody,
  receiveDokuNotification
)

export default router
