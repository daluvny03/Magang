export const replacePackageCategories = async (
  client,
  packageId,
  categoryIds
) => {
  await client.query(
    `
      DELETE FROM tryout_package_categories
      WHERE package_id = $1
    `,
    [packageId]
  );

  for (const categoryId of categoryIds) {
    await client.query(
      `
        INSERT INTO tryout_package_categories (
          package_id,
          category_id
        )
        VALUES ($1, $2)
      `,
      [packageId, categoryId]
    );
  }
};

export const replacePackageQuestions = async (
  client,
  packageId,
  questions
) => {
  await client.query(
    `
      DELETE FROM tryout_package_questions
      WHERE tryout_package_id = $1
    `,
    [packageId]
  );

  for (const question of questions) {
    await client.query(
      `
        INSERT INTO tryout_package_questions (
          tryout_package_id,
          question_id,
          question_order
        )
        VALUES ($1, $2, $3)
      `,
      [
        packageId,
        question.questionId,
        question.questionOrder
      ]
    );
  }
};

export const replacePackageSubscriptionTiers = async (
  client,
  packageId,
  subscriptionTierIds
) => {
  await client.query(
    `
      DELETE FROM tryout_package_subscription_tiers
      WHERE tryout_package_id = $1
    `,
    [packageId]
  );

  for (const subscriptionTierId of subscriptionTierIds) {
    await client.query(
      `
        INSERT INTO tryout_package_subscription_tiers (
          tryout_package_id,
          subscription_tier_id
        )
        VALUES ($1, $2)
      `,
      [packageId, subscriptionTierId]
    );
  }
};