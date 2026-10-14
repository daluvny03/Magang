import { pool } from '../config/database.js';

import {
  findPackages,
  findPackageById,
  findPackageByName,
  createPackage,
  updatePackage,
  deletePackage as deletePackageRepository
} from '../repositories/tryout-packages.repository.js';

import {
  hasPackageAttempts,
} from '../repositories/package-attempt-guard.repository.js'

import {
  validatePassingRules,
  validatePassingScoreLimits,
} from '../validators/passing-rules.validator.js'

import {
  getPackageQuestionScoreLimits,
} from '../repositories/passing-rules.repository.js'

import {
  replacePackageCategories,
  replacePackageQuestions,
  replacePackageSubscriptionTiers
} from '../repositories/tryout-packages-relation.repository.js';

import { AppError } from '../utils/app-error.js';

const getCategories = async (client, categoryIds) => {
  const { rows } = await client.query(
    `
      SELECT id
      FROM categories
      WHERE id = ANY($1::int[])
    `,
    [categoryIds]
  );

  return rows;
};

const getQuestions = async (client, questionIds) => {
  const { rows } = await client.query(
    `
      SELECT
        id,
        category_id,
        is_active
      FROM questions
      WHERE id = ANY($1::int[])
    `,
    [questionIds]
  );

  return rows;
};

const getSubscriptionTiers = async (
  client,
  subscriptionTierIds
) => {
  const { rows } = await client.query(
    `
      SELECT id
      FROM subscription_tiers
      WHERE id = ANY($1::int[])
    `,
    [subscriptionTierIds]
  );

  return rows;
};

const getPackageRelations = async (
  packageId,
  client = pool
) => {
  const categoriesResult = await client.query(
    `
      SELECT
        c.id,
        c.name,
        c.slug,
        c.parent_id,
        c.level
      FROM categories c
      INNER JOIN tryout_package_categories tpc
        ON tpc.category_id = c.id
      WHERE tpc.package_id = $1
      ORDER BY c.name ASC
    `,
    [packageId]
  )

  const questionsResult = await client.query(
    `
      SELECT
        q.id,
        q.category_id,
        q.question_text,
        q.score,
        q.difficulty,
        q.is_active,
        tpq.question_order AS "questionOrder"
      FROM questions q
      INNER JOIN tryout_package_questions tpq
        ON tpq.question_id = q.id
      WHERE tpq.tryout_package_id = $1
      ORDER BY tpq.question_order ASC
    `,
    [packageId]
  )

  const tiersResult = await client.query(
    `
      SELECT
        st.id,
        st.name,
        st.price
      FROM subscription_tiers st
      INNER JOIN tryout_package_subscription_tiers tpst
        ON tpst.subscription_tier_id = st.id
      WHERE tpst.tryout_package_id = $1
      ORDER BY st.id ASC
    `,
    [packageId]
  )

  return {
    categories: categoriesResult.rows,
    questions: questionsResult.rows,
    subscriptionTiers: tiersResult.rows,
  }
}

const normalizeNumeric = (value) =>
  value == null ? null : Number(value)

const normalizeGrades = (grades) => {
  if (grades == null) return null

  return Object.fromEntries(
    Object.entries(grades)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [
        key,
        normalizeNumeric(value),
      ])
  )
}

const hasPassingRulesChanged = (current, next) =>
  current.passing_mode !== next.passingMode ||
  normalizeNumeric(current.passing_score) !==
    normalizeNumeric(next.passingScore) ||
  JSON.stringify(
    normalizeGrades(current.passing_grades)
  ) !== JSON.stringify(
    normalizeGrades(next.passingGrades)
  )

const sameIdSet = (currentIds, nextIds) => {
  const current = [...currentIds].map(String).sort()
  const next = [...nextIds].map(String).sort()

  return (
    current.length === next.length &&
    current.every((value, index) =>
      value === next[index]
    )
  )
}

const sameQuestionMapping = (
  currentQuestions,
  nextQuestions
) => {
  if (
    currentQuestions.length !== nextQuestions.length
  ) {
    return false
  }

  const current = currentQuestions
    .map((item) => ({
      id: String(item.questionId),
      order: Number(item.questionOrder),
    }))
    .sort((a, b) => a.order - b.order)

  const next = nextQuestions
    .map((item) => ({
      id: String(item.questionId),
      order: Number(item.questionOrder),
    }))
    .sort((a, b) => a.order - b.order)

  return current.every((item, index) =>
    item.id === next[index].id &&
    item.order === next[index].order
  )
}

export const getPackages = async ({
  page,
  limit,
  search,
  status
}) => {
  const result = await findPackages({
    page,
    limit,
    search,
    status
  });

  return {
    data: result.rows,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(
        result.total / result.limit
      )
    }
  };
};

export const getPackageById = async (id) => {
  const packageData = await findPackageById(id);

  if (!packageData) {
    throw new AppError(
      'Tryout package not found',
      404,
      'PACKAGE_NOT_FOUND'
    );
  }

  const relations = await getPackageRelations(id);

  return {
    ...packageData,
    ...relations
  };
};

export const createTryoutPackage = async (payload) => {
  console.log('PASSING RULES INPUT:', {
    passingMode: payload.passingMode,
    passingScore: payload.passingScore,
    passingGrades: payload.passingGrades,
  })

  const passingRules = validatePassingRules({
    passingMode: payload.passingMode,
    passingScore: payload.passingScore,
    passingGrades: payload.passingGrades,
  })
  console.log('VALIDATED PASSING RULES:', passingRules)

  const validatedPayload = {
    ...payload,
    ...passingRules,
  }

  const existingPackage = await findPackageByName(
    validatedPayload.name
  )

  if (existingPackage) {
    throw new AppError(
      'Tryout package name is already registered',
      409,
      'PACKAGE_NAME_ALREADY_EXISTS'
    )
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await validateRelations(
      client,
      validatedPayload
    )


  if (validatedPayload.passingMode !== 'none') {
    const scoreLimits =
      await getPackageQuestionScoreLimits(
        client,
        validatedPayload.questions
      )

    validatePassingScoreLimits({
      passingMode: validatedPayload.passingMode,
      passingScore: validatedPayload.passingScore,
      passingGrades: validatedPayload.passingGrades,
      scoreLimits,
    })
  }

    const packageData = await createPackage(
      client,
      validatedPayload
    )

    await replacePackageCategories(
      client,
      packageData.id,
      validatedPayload.categoryIds
    )

    await replacePackageQuestions(
      client,
      packageData.id,
      validatedPayload.questions
    )

    await replacePackageSubscriptionTiers(
      client,
      packageData.id,
      validatedPayload.subscriptionTierIds
    )

    await client.query('COMMIT')

    return getPackageById(packageData.id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const updateTryoutPackage = async (
  id,
  payload
) => {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Lock package
    const packageResult = await client.query(
      `
        SELECT *
        FROM tryout_packages
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    )

    const existingPackage = packageResult.rows[0]

    if (!existingPackage) {
      throw new AppError(
        'Tryout package not found',
        404,
        'PACKAGE_NOT_FOUND'
      )
    }

    // 2. Ambil relasi saat ini dalam transaksi
    const relations = await getPackageRelations(
      id,
      client
    )

    const currentCategoryIds =
      relations.categories.map(
        (item) => item.id
      )

    const currentQuestions =
      relations.questions.map(
        (item) => ({
          questionId: item.id,
          questionOrder: item.questionOrder,
        })
      )

    const currentTierIds =
      relations.subscriptionTiers.map(
        (item) => item.id
      )

    // 3. Gunakan konfigurasi lama jika tidak
    // disertakan di payload update
    const passingRules = validatePassingRules({
      passingMode:
        payload.passingMode ??
        existingPackage.passing_mode,

      passingScore:
        payload.passingScore === undefined
          ? existingPackage.passing_score
          : payload.passingScore,

      passingGrades:
        payload.passingGrades === undefined
          ? existingPackage.passing_grades
          : payload.passingGrades,
    })

    const validatedPayload = {
      ...payload,
      ...passingRules,

      categoryIds:
        payload.categoryIds ??
        currentCategoryIds,

      questions:
        payload.questions ??
        currentQuestions,

      subscriptionTierIds:
        payload.subscriptionTierIds ??
        currentTierIds,
    }

    // 4. Periksa perubahan nama
    if (
      validatedPayload.name !== undefined &&
      validatedPayload.name !==
        existingPackage.name
    ) {
      const duplicatePackage =
        await findPackageByName(
          validatedPayload.name
        )

      if (
        duplicatePackage &&
        Number(duplicatePackage.id) !== Number(id)
      ) {
        throw new AppError(
          'Tryout package name is already registered',
          409,
          'PACKAGE_NAME_ALREADY_EXISTS'
        )
      }
    }

    // 5. Bandingkan konfigurasi
    const passingChanged =
      hasPassingRulesChanged(
        existingPackage,
        passingRules
      )

    const durationChanged =
      payload.durationMinutes !== undefined &&
      Number(payload.durationMinutes) !==
        Number(existingPackage.duration_minutes)

    const categoriesChanged =
      !sameIdSet(
        currentCategoryIds,
        validatedPayload.categoryIds
      )

    const questionsChanged =
      !sameQuestionMapping(
        currentQuestions,
        validatedPayload.questions
      )

    // 6. Guard package yang sudah digunakan
    const hasAttempts =
      await hasPackageAttempts(
        client,
        id
      )

    if (
      hasAttempts &&
      (
        passingChanged ||
        durationChanged ||
        categoriesChanged ||
        questionsChanged
      )
    ) {
      throw new AppError(
        'Package exam configuration cannot be modified because it has existing attempts',
        409,
        'PACKAGE_ALREADY_USED'
      )
    }

    if (questionsChanged) {
      const questionIds =
        validatedPayload.questions.map(
          (question) => question.questionId
        )

      const lockResult = await client.query(
        `
          SELECT id
          FROM questions
          WHERE id = ANY($1::bigint[])
          ORDER BY id
          FOR SHARE
        `,
        [questionIds]
      )

      if (
        lockResult.rows.length !==
        new Set(questionIds.map(String)).size
      ) {
        throw new AppError(
          'One or more questions were not found',
          404,
          'QUESTION_NOT_FOUND'
        )
      }
    }

    // 7. Validasi relasi hanya jika mapping berubah
    if (
      categoriesChanged ||
      questionsChanged ||
      payload.subscriptionTierIds !== undefined
    ) {
      await validateRelations(
        client,
        validatedPayload
      )
    }

    // 8. Validasi passing score jika diperlukan
    if (
      !hasAttempts &&
      validatedPayload.passingMode !== 'none'
    ) {
      const scoreLimits =
        await getPackageQuestionScoreLimits(
          client,
          validatedPayload.questions
        )

      validatePassingScoreLimits({
        passingMode: validatedPayload.passingMode,
        passingScore:
          validatedPayload.passingScore,
        passingGrades:
          validatedPayload.passingGrades,
        scoreLimits,
      })
    }

    // 9. Update informasi package
    const packageData = await updatePackage(
      client,
      id,
      validatedPayload
    )

    // 10. Replace mapping hanya jika berubah
    if (categoriesChanged) {
      await replacePackageCategories(
        client,
        id,
        validatedPayload.categoryIds
      )
    }

    if (questionsChanged) {
      await replacePackageQuestions(
        client,
        id,
        validatedPayload.questions
      )
    }

    // Tier boleh berubah mengikuti aturan akses
    if (
      payload.subscriptionTierIds !== undefined &&
      !sameIdSet(
        currentTierIds,
        validatedPayload.subscriptionTierIds
      )
    ) {
      await replacePackageSubscriptionTiers(
        client,
        id,
        validatedPayload.subscriptionTierIds
      )
    }

    await client.query('COMMIT')

    return getPackageById(packageData.id)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}


export const deleteTryoutPackage = async (
  id
) => {
  const packageData = await findPackageById(id);

  if (!packageData) {
    throw new AppError(
      'Tryout package not found',
      404,
      'PACKAGE_NOT_FOUND'
    );
  }

  const { rows } = await pool.query(
    `
      SELECT 1
      FROM tryout_attempts
      WHERE tryout_package_id = $1
      LIMIT 1
    `,
    [id]
  );

  if (rows.length > 0) {
    throw new AppError(
      'Tryout package cannot be deleted because it has existing attempts',
      409,
      'PACKAGE_ALREADY_USED'
    );
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await deletePackageRepository(
      client,
      id
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getDescendantCategoryIds = async (
  client,
  categoryIds
) => {
  const result = await client.query(
    `
      WITH RECURSIVE category_tree AS (
        SELECT
          id
        FROM categories
        WHERE id = ANY($1::int[])

        UNION ALL

        SELECT
          c.id
        FROM categories c
        INNER JOIN category_tree ct
          ON c.parent_id = ct.id
      )
      SELECT DISTINCT id
      FROM category_tree
    `,
    [categoryIds]
  );

  return result.rows.map((row) => row.id);
};

const validateRelations = async (
  client,
  {
    categoryIds,
    questions,
    subscriptionTierIds
  }
) => {
  const questionIds = questions.map(
    (question) => question.questionId
  );

  const categories =
    await getCategories(
      client,
      categoryIds
    );

  const existingQuestions =
    await getQuestions(
      client,
      questionIds
    );

  const subscriptionTiers =
    await getSubscriptionTiers(
      client,
      subscriptionTierIds
    );

  if (
    categories.length !==
    categoryIds.length
  ) {
    const existingIds = new Set(
      categories.map((item) => item.id)
    );

    const missingId = categoryIds.find(
      (id) => !existingIds.has(id)
    );

    throw new AppError(
      `Category with id ${missingId} was not found`,
      404,
      'CATEGORY_NOT_FOUND'
    );
  }

  if (
    existingQuestions.length !==
    questionIds.length
  ) {
    const existingIds = new Set(
      existingQuestions.map(
        (item) => item.id
      )
    );

    const missingId = questionIds.find(
      (id) => !existingIds.has(id)
    );

    throw new AppError(
      `Question with id ${missingId} was not found`,
      404,
      'QUESTION_NOT_FOUND'
    );
  }

  if (
    subscriptionTiers.length !==
    subscriptionTierIds.length
  ) {
    const existingIds = new Set(
      subscriptionTiers.map(
        (item) => item.id
      )
    );

    const missingId =
      subscriptionTierIds.find(
        (id) => !existingIds.has(id)
      );

    throw new AppError(
      `Subscription tier with id ${missingId} was not found`,
      404,
      'SUBSCRIPTION_TIER_NOT_FOUND'
    );
  }

  const inactiveQuestion =
    existingQuestions.find(
      (question) => !question.is_active
    );

  if (inactiveQuestion) {
    throw new AppError(
      `Question with id ${inactiveQuestion.id} is inactive`,
      422,
      'QUESTION_INACTIVE'
    );
  }

  const allowedCategoryIds =
    await getDescendantCategoryIds(
      client,
      categoryIds
    );

  const categorySet =
    new Set(allowedCategoryIds);

  const invalidQuestion =
    existingQuestions.find(
      (question) =>
        !categorySet.has(
          question.category_id
        )
    );

  if (invalidQuestion) {
    throw new AppError(
      `Question with id ${invalidQuestion.id} does not belong to the selected package categories`,
      422,
      'QUESTION_CATEGORY_MISMATCH'
    );
  }
};

export const updatePackageCategories = async (id, categoryIds = []) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT id FROM tryout_packages WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!rows.length) {
      throw new AppError('Tryout package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    const hasAttempts = await hasPackageAttempts(
      client,
      id
    )

    if (hasAttempts) {
      throw new AppError(
        'Package categories cannot be modified because the package has existing attempts',
        409,
        'PACKAGE_ALREADY_USED'
      )
    }

    const categories = await getCategories(client, categoryIds);
    if (categories.length !== categoryIds.length) {
      const existingIds = new Set(categories.map((item) => String(item.id)));
      const missingId = categoryIds.find((catId) => !existingIds.has(String(catId)));
      throw new AppError(`Category with id ${missingId} was not found`, 404, 'CATEGORY_NOT_FOUND');
    }

    const allowedCategoryIds = await getDescendantCategoryIds(client, categoryIds);
    const categorySet = new Set(allowedCategoryIds.map(String));

    const { rows: questions } = await client.query(
      `SELECT q.id, q.category_id
       FROM tryout_package_questions tpq
       JOIN questions q ON q.id = tpq.question_id
       WHERE tpq.tryout_package_id = $1`,
      [id]
    );

    const invalidQuestion = questions.find(
      (q) => !categorySet.has(String(q.category_id))
    );
    if (invalidQuestion) {
      throw new AppError(
        `Question with id ${invalidQuestion.id} does not belong to the selected package categories`,
        422,
        'QUESTION_CATEGORY_MISMATCH'
      );
    }

    await replacePackageCategories(client, id, categoryIds);
    await client.query('COMMIT');

    return getPackageById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updatePackageQuestions = async (
  id,
  questions
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

  const packageResult = await client.query(
    `
      SELECT
        id,
        passing_mode,
        passing_score,
        passing_grades
      FROM tryout_packages
      WHERE id = $1
      FOR UPDATE
    `,
    [id]
  )

  const packageData = packageResult.rows[0]

  if (!packageData) {
    throw new AppError(
      'Tryout package not found',
      404,
      'PACKAGE_NOT_FOUND'
    )
  }

  const hasAttempts = await hasPackageAttempts(
    client,
    id
  )

  if (hasAttempts) {
    throw new AppError(
      'Package cannot be modified because it has existing attempts',
      409,
      'PACKAGE_ALREADY_USED'
    )
  }

    const questionIds = questions.map(
      (question) => question.questionId
    );

    const lockedQuestions = await client.query(
      `
        SELECT id
        FROM questions
        WHERE id = ANY($1::bigint[])
        ORDER BY id
        FOR SHARE
      `,
      [questionIds]
    )

    const uniqueQuestionIds = new Set(
      questionIds.map(String)
    )

    if (
      lockedQuestions.rows.length !==
      uniqueQuestionIds.size
    ) {
      throw new AppError(
        'One or more questions were not found',
        404,
        'QUESTION_NOT_FOUND'
      )
    }

    const existingQuestions = await getQuestions(
      client,
      questionIds
    );

    if (
      existingQuestions.length !==
      questionIds.length
    ) {
      const existingIds = new Set(
        existingQuestions.map(
          (question) => question.id
        )
      );

      const missingId = questionIds.find(
        (questionId) =>
          !existingIds.has(questionId)
      );

      throw new AppError(
        `Question with id ${missingId} was not found`,
        404,
        'QUESTION_NOT_FOUND'
      );
    }

    const inactiveQuestion =
      existingQuestions.find(
        (question) => !question.is_active
      );

    if (inactiveQuestion) {
      throw new AppError(
        `Question with id ${inactiveQuestion.id} is inactive`,
        422,
        'QUESTION_INACTIVE'
      );
    }

    const categoryResult = await client.query(
      `
        SELECT category_id
        FROM tryout_package_categories
        WHERE package_id = $1
      `,
      [id]
    );

    const categoryIds =
      categoryResult.rows.map(
        (row) => row.category_id
      );

    if (categoryIds.length === 0) {
      throw new AppError(
        'Package categories must be mapped before questions',
        422,
        'PACKAGE_CATEGORIES_REQUIRED'
      );
    }

    const allowedCategoryIds =
      await getDescendantCategoryIds(
        client,
        categoryIds
      );

    const categorySet =
      new Set(allowedCategoryIds);

    const invalidQuestion =
      existingQuestions.find(
        (question) =>
          !categorySet.has(
            question.category_id
          )
      );

    if (packageData.passing_mode !== 'none') {
      const scoreLimits =
        await getPackageQuestionScoreLimits(
          client,
          questions
        )

      validatePassingScoreLimits({
        passingMode: packageData.passing_mode,
        passingScore:
          packageData.passing_score == null
            ? null
            : Number(packageData.passing_score),
        passingGrades: packageData.passing_grades,
        scoreLimits,
      })
    }

    if (invalidQuestion) {
      throw new AppError(
        `Question with id ${invalidQuestion.id} does not belong to the selected package categories`,
        422,
        'QUESTION_CATEGORY_MISMATCH'
      );
    }

    await replacePackageQuestions(
      client,
      id,
      questions
    );

    await client.query(
      `
        UPDATE tryout_packages
        SET
          question_count = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [questions.length, id]
    );

    await client.query('COMMIT');

    return getPackageById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updatePackageSubscriptionTiers =
  async (id, subscriptionTierIds) => {
    const packageData =
      await findPackageById(id);

    if (!packageData) {
      throw new AppError(
        'Tryout package not found',
        404,
        'PACKAGE_NOT_FOUND'
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const subscriptionTiers =
        await getSubscriptionTiers(
          client,
          subscriptionTierIds
        );

      if (
        subscriptionTiers.length !==
        subscriptionTierIds.length
      ) {
        const existingIds = new Set(
          subscriptionTiers.map(
            (tier) => tier.id
          )
        );

        const missingId =
          subscriptionTierIds.find(
            (tierId) =>
              !existingIds.has(tierId)
          );

        throw new AppError(
          `Subscription tier with id ${missingId} was not found`,
          404,
          'SUBSCRIPTION_TIER_NOT_FOUND'
        );
      }

      await replacePackageSubscriptionTiers(
        client,
        id,
        subscriptionTierIds
      );

      await client.query('COMMIT');

      return getPackageById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };

  const getPackageMappingCounts = async (
  client,
  packageId
) => {
  const { rows } = await client.query(
    `
      SELECT
        (
          SELECT COUNT(*)::int
          FROM tryout_package_categories
          WHERE package_id = $1
        ) AS category_count,

        (
          SELECT COUNT(*)::int
          FROM tryout_package_questions
          WHERE tryout_package_id = $1
        ) AS question_count,

        (
          SELECT COUNT(*)::int
          FROM tryout_package_subscription_tiers
          WHERE tryout_package_id = $1
        ) AS tier_count
    `,
    [packageId]
  );

  return rows[0];
};

export const publishTryoutPackage = async (
  id
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `
        SELECT
          id,
          status,
          duration_minutes,
          question_count
        FROM tryout_packages
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    const packageData = rows[0];

    if (!packageData) {
      throw new AppError(
        'Tryout package not found',
        404,
        'PACKAGE_NOT_FOUND'
      );
    }

    if (packageData.status === 'published') {
      throw new AppError(
        'Tryout package is already published',
        409,
        'PACKAGE_ALREADY_PUBLISHED'
      );
    }

    const mapping =
      await getPackageMappingCounts(
        client,
        id
      );

    if (mapping.category_count === 0) {
      throw new AppError(
        'Tryout package must have at least one category before publishing',
        422,
        'PACKAGE_CATEGORY_REQUIRED'
      );
    }

    if (mapping.question_count === 0) {
      throw new AppError(
        'Tryout package must have at least one question before publishing',
        422,
        'PACKAGE_QUESTION_REQUIRED'
      );
    }

    if (mapping.tier_count === 0) {
      throw new AppError(
        'Tryout package must have at least one subscription tier before publishing',
        422,
        'PACKAGE_SUBSCRIPTION_TIER_REQUIRED'
      );
    }

    await client.query(
      `
        UPDATE tryout_packages
        SET
          status = 'published',
          question_count = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `,
      [
        mapping.question_count,
        id
      ]
    );

    await client.query('COMMIT');

    return getPackageById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const unpublishTryoutPackage = async (
  id
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `
        SELECT
          id,
          status
        FROM tryout_packages
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    const packageData = rows[0];

    if (!packageData) {
      throw new AppError(
        'Tryout package not found',
        404,
        'PACKAGE_NOT_FOUND'
      );
    }

    if (packageData.status !== 'published') {
      throw new AppError(
        'Tryout package is not published',
        409,
        'PACKAGE_NOT_PUBLISHED'
      );
    }

    await client.query(
      `
        UPDATE tryout_packages
        SET
          status = 'draft',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [id]
    );

    await client.query('COMMIT');

    return getPackageById(id);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};