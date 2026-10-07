import {
  getAvailableTryoutByIdForUser,
  getAvailableTryoutsForUser,
  startTryoutForUser,
} from '../services/tryouts.service.js'

export const getTryouts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const tryouts = await getAvailableTryoutsForUser(
      userId
    );

    return res.status(200).json({
      success: true,
      message: 'Tryouts retrieved successfully',
      data: tryouts
    });
  } catch (error) {
    next(error);
  }
};

export const getTryoutById = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id
    const { tryoutId } = req.params

    const tryout =
      await getAvailableTryoutByIdForUser(
        userId,
        tryoutId
      )

    return res.status(200).json({
      success: true,
      message: 'Tryout retrieved successfully',
      data: tryout,
    })
  } catch (error) {
    next(error)
  }
}

export const startTryout = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id
    const { tryoutId } = req.params

    const result = await startTryoutForUser(
      userId,
      tryoutId
    )

    return res.status(
      result.resumed ? 200 : 201
    ).json({
      success: true,
      message: result.resumed
        ? 'Active attempt retrieved successfully'
        : 'Tryout started successfully',
      data: {
        attempt: result.attempt,
      },
    })
  } catch (error) {
    next(error)
  }
}