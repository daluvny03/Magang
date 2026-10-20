
import {
  createPremiumCheckout,
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

export const createCheckout = async (
  req,
  res,
  next
) => {
  try {
    const { error } = createCheckoutSchema.validate(
      req.body ?? {}
    );

    if (error) {
      throw createValidationError(
        error.details[0].message
      );
    }

    const userId = req.user.id;

    const result = await createPremiumCheckout(userId);

    return res.status(
      result.isExisting ? 200 : 201
    ).json({
      success: true,
      message: result.isExisting
        ? 'Existing checkout retrieved successfully'
        : 'Checkout initialized successfully',
      data: result.payment
    });
  } catch (error) {
    next(error);
  }
};

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
