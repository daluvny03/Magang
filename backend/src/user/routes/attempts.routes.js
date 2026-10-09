import { Router } from 'express'

import {
  getAttemptQuestions,
} from '../controllers/attempt-questions.controller.js'

import {
  saveAttemptAnswer,
} from '../controllers/answers.controller.js'

import {
  finishAttempt,
} from '../controllers/attempt-results.controller.js'

import {
    saveQuestionProgress,
} from '../controllers/question-progress.controller.js'

import {
    updateDoubtful,
} from '../controllers/doubtful.controller.js'

const router = Router()

router.get(
  '/:attemptId/questions',
  getAttemptQuestions
)

router.put(
  '/:attemptId/answer',
  saveAttemptAnswer
)

router.post(
  '/:attemptId/finish',
  finishAttempt
)

router.put(
    '/:attemptId/question-progress',
    saveQuestionProgress
)

router.put(
    '/:attemptId/doubtful',
    updateDoubtful
)

export default router