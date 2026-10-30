
import {
  createSubscriptionCheckout,
  getUserPaymentById
} from '../services/payment.service.js';

import {
  createCheckoutSchema,
  paymentIdParamSchema
} from '../validators/payment.validator.js';

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const normalizeSubscriptionTierId = (value) => {
  if (
    typeof value === 'number' &&
    !Number.isSafeInteger(value)
  ) {
    const error = new Error(
      'subscriptionTierId must be a safe integer or string'
    )
    error.statusCode = 400
    error.code = 'INVALID_SUBSCRIPTION_TIER_ID'
    throw error
  }

  const normalized = String(value)

  if (!/^[1-9]\d*$/.test(normalized)) {
    const error = new Error(
      'subscriptionTierId must be a positive integer'
    )
    error.statusCode = 400
    error.code = 'INVALID_SUBSCRIPTION_TIER_ID'
    throw error
  }

  const maxBigint = BigInt('9223372036854775807')

  if (BigInt(normalized) > maxBigint) {
    const error = new Error(
      'subscriptionTierId exceeds database limits'
    )
    error.statusCode = 400
    error.code = 'INVALID_SUBSCRIPTION_TIER_ID'
    throw error
  }

  return normalized
}

export const createCheckout = async (
  req,
  res,
  next
) => {
  try {
    const { error, value } =
      createCheckoutSchema.validate(
        req.body ?? {},
        {
          abortEarly: false,
          allowUnknown: false,
        }
      )

    if (error) {
      throw createValidationError(
        error.details[0].message
      )
    }

    const subscriptionTierId =
      normalizeSubscriptionTierId(
        value.subscriptionTierId
      )

    const userId = req.user.id

    const result =
      await createSubscriptionCheckout(
        userId,
        subscriptionTierId
      )

    const isReconciling = [
      'initiating',
      'reconciling',
    ].includes(result.payment.status)

    return res.status(
      isReconciling
        ? 202
        : result.isExisting
          ? 200
          : 201
    ).json({
      success: true,
      message: isReconciling
        ? 'Checkout outcome is being reconciled'
        : result.isExisting
          ? 'Existing checkout retrieved successfully'
          : 'Checkout initialized successfully',
      data: result.payment,
    })
  } catch (error) {
    next(error)
  }
}

export const getPaymentDetail = async (
  req,
  res,
  next
) => {
  try {
    const { error, value } =
      paymentIdParamSchema.validate(req.params);

    if (error) {
      throw createValidationError(
        error.details[0].message
      );
    }

    const payment = await getUserPaymentById(
      value.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'Payment retrieved successfully',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};
