import { Router } from 'express'
import { validateTryoutId } from '../utils/tryout-id.js'

import {
  getTryoutById,
  getTryouts,
  startTryout,
} from '../controllers/tryouts.controller.js'

import {
  getActiveAttempt,
} from '../controllers/attempts.controller.js'

const router = Router()

router.param('tryoutId', (req, res, next, value) => {
  try {
    req.params.tryoutId = validateTryoutId(value)
    next()
  } catch (error) {
    next(error)
  }
})

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
