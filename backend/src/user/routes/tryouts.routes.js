import { Router } from 'express'

import {
  getTryoutById,
  getTryouts,
  startTryout,
} from '../controllers/tryouts.controller.js'

import {
  getActiveAttempt,
} from '../controllers/attempts.controller.js'

const router = Router()

router.get('/', getTryouts)

router.get(
  '/:tryoutId/attempt',
  getActiveAttempt
)

router.post(
  '/:tryoutId/start',
  startTryout
)

router.get(
  '/:tryoutId',
  getTryoutById
)

export default router