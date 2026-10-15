import { Router } from 'express'

import {
  getAttemptQuestions,
} from '../controllers/attempt-questions.controller.js'

import {
  saveAttemptAnswer,
} from '../controllers/answers.controller.js'

import {
  finishAttempt,
  getAttemptResult,
} from '../controllers/attempt-results.controller.js'

import {
    saveQuestionProgress,
} from '../controllers/question-progress.controller.js'

import {
    updateDoubtful,
} from '../controllers/doubtful.controller.js'

import {
  getAttemptHistory,
} from '../controllers/attempt-history.controller.js'

import {
  validateHistoryQuery,
} from '../middlewares/validate-history-query.middleware.js'

import {
  getAttemptAnalysis,
} from '../controllers/attempt-analysis.controller.js'

import {
  validateAnalysisParams,
} from '../middlewares/validate-analysis-params.middleware.js'

const router = Router()

router.get(
  '/history',
  validateHistoryQuery,
  getAttemptHistory
)

router.get(
  '/:attemptId/analysis',
  validateAnalysisParams,
  getAttemptAnalysis
)

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

router.get(
  '/:attemptId/result',
  getAttemptResult
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