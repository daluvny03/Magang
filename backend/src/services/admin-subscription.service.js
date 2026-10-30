import {
  findDirectInheritedTiers,
  findAllDirectTierInheritances,
  replaceTierInheritances
} from '../repositories/subscription-inheritance.repository.js';
import { AppError } from '../utils/app-error.js';
import {
  findAllSubscriptionTiers,
  findSubscriptionTierById,
  createSubscriptionTier,
  updateSubscriptionTier,
  updateSubscriptionTierStatus,
  withSubscriptionTierTransaction
} from '../repositories/admin-subscription.repository.js';

const DURATION_UNITS = ['day', 'month', 'year'];

const isPlainObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value);

const normalizeName = (value) => {
  if (typeof value !== 'string') {
    throw new AppError(
      'Name must be a string',
      400,
      'INVALID_TIER_NAME'
    );
  }

  const name = value.trim();

  if (!name || name.length > 100) {
    throw new AppError(
      'Name must contain 1 to 100 characters',
      400,
      'INVALID_TIER_NAME'
    );
  }

  return name;
};

const normalizeSlug = (value) => {
  if (
    typeof value !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ||
    value.length > 100
  ) {
    throw new AppError(
      'Slug must use lowercase letters, numbers, and hyphens',
      400,
      'INVALID_TIER_SLUG'
    );
  }

  return value;
};

const normalizePrice = (value) => {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new AppError(
      'Price must be a non-negative integer',
      400,
      'INVALID_TIER_PRICE'
    );
  }

  return value;
};

const normalizePositiveInteger = (value, field) => {
  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > 2147483647
  ) {
    throw new AppError(
      `${field} must be a valid positive integer`,
      400,
      'INVALID_TIER_INPUT'
    );
  }

  return value;
};

const normalizeDuration = (value) => {
  if (!isPlainObject(value)) {
    throw new AppError(
      'Duration is required',
      400,
      'INVALID_TIER_DURATION'
    );
  }

  const durationValue = normalizePositiveInteger(
    value.value,
    'Duration value'
  );

  if (!DURATION_UNITS.includes(value.unit)) {
    throw new AppError(
      'Duration unit must be day, month, or year',
      400,
      'INVALID_TIER_DURATION'
    );
  }

  // Legacy compatibility only.
  const multiplier = {
    day: 1,
    month: 30,
    year: 365
  }[value.unit];

  const durationDays = durationValue * multiplier;

  if (!Number.isSafeInteger(durationDays) ||
      durationDays > 2147483647) {
    throw new AppError(
      'Duration exceeds supported range',
      400,
      'INVALID_TIER_DURATION'
    );
  }

  return {
    durationValue,
    durationUnit: value.unit,
    durationDays
  };
};

const validateFields = (payload, allowed, required) => {
  if (!isPlainObject(payload)) {
    throw new AppError(
      'Request body must be an object',
      400,
      'INVALID_REQUEST_BODY'
    );
  }

  const keys = Object.keys(payload);

  if (keys.some((key) => !allowed.includes(key))) {
    throw new AppError(
      'Request contains unsupported fields',
      400,
      'INVALID_TIER_FIELDS'
    );
  }

  if (required.some((key) =>
    !Object.prototype.hasOwnProperty.call(payload, key)
  )) {
    throw new AppError(
      'Required fields are missing',
      400,
      'MISSING_TIER_FIELDS'
    );
  }
};

const parseId = (id) => {
  const value = String(id);

  if (!/^[1-9]\d*$/.test(value)) {
    throw new AppError(
      'Invalid subscription tier ID',
      400,
      'INVALID_TIER_ID'
    );
  }

  const numericId = Number(value);

  if (!Number.isSafeInteger(numericId)) {
    throw new AppError(
      'Invalid subscription tier ID',
      400,
      'INVALID_TIER_ID'
    );
  }

  return numericId;
};

const normalizeInheritedTierIds = (value) => {
  if (!Array.isArray(value)) {
    throw new AppError(
      'inheritedTierIds must be an array',
      400,
      'INVALID_INHERITED_TIER_IDS'
    );
  }

  const ids = value.map((id) => parseId(id));

  if (new Set(ids).size !== ids.length) {
    throw new AppError(
      'Duplicate inherited tier IDs are not allowed',
      400,
      'DUPLICATE_INHERITED_TIER_IDS'
    );
  }

  return ids;
};

const mapTier = (row) => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  price: Number(row.price),
  durationDays: row.duration_days,
  duration: row.duration_value == null ||
    row.duration_unit == null
    ? null
    : {
        value: row.duration_value,
        unit: row.duration_unit
      },
  level: row.level,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapInheritedTier = (row) => ({
  id: String(row.id),
  name: row.name,
  slug: row.slug,
  level: Number(row.level)
});

const attachInheritance = (tier, inheritedRows = []) => {
  const inheritedTiers = inheritedRows.map(
    mapInheritedTier
  );

  return {
    ...mapTier(tier),
    inheritedTierIds: inheritedTiers.map(
      (item) => item.id
    ),
    inheritedTiers
  };
};

const normalizeTierInput = (payload, isCreate = false) => {
  const allowed = isCreate
  ? [
      'name',
      'slug',
      'description',
      'price',
      'duration',
      'level',
      'inheritedTierIds'
    ]
  : [
      'name',
      'description',
      'price',
      'duration',
      'level',
      'inheritedTierIds'
    ];

  const required = isCreate
    ? ['name', 'slug', 'price', 'duration', 'level']
    : ['name', 'price', 'duration', 'level'];

  validateFields(payload, allowed, required);

  const duration = normalizeDuration(payload.duration);

  if (
    payload.description !== undefined &&
    payload.description !== null &&
    typeof payload.description !== 'string'
  ) {
    throw new AppError(
      'Description must be a string or null',
      400,
      'INVALID_TIER_DESCRIPTION'
    );
  }
    
    const hasInheritedTierIds =
    Object.prototype.hasOwnProperty.call(
        payload,
        'inheritedTierIds'
    );

    return {
    name: normalizeName(payload.name),

    ...(isCreate
        ? { slug: normalizeSlug(payload.slug) }
        : {}),

    description: payload.description?.trim() || null,

    price: normalizePrice(payload.price),

    ...duration,

    level: normalizePositiveInteger(
        payload.level,
        'Level'
    ),

    ...(isCreate || hasInheritedTierIds
        ? {
            inheritedTierIds: normalizeInheritedTierIds(
            hasInheritedTierIds
                ? payload.inheritedTierIds
                : []
            )
        }
        : {})
    };
};

const ensureEditableTier = (tier) => {
  if (tier.slug === 'free') {
    throw new AppError(
      'Free tier cannot be modified',
      403,
      'FREE_TIER_PROTECTED'
    );
  }
};

const handleDatabaseError = (error) => {
  if (error.code === '23505') {
    throw new AppError(
      'Subscription tier name or slug already exists',
      409,
      'SUBSCRIPTION_TIER_DUPLICATE'
    );
  }

  throw error;
};

const ensureUpdatedTier = (tier) => {
  if (!tier) {
    throw new AppError(
      'Subscription tier could not be updated',
      409,
      'SUBSCRIPTION_TIER_UPDATE_CONFLICT'
    );
  }

  return mapTier(tier);
};

export const getAdminSubscriptionTiers = async () => {
  const [tiers, inheritanceRows] = await Promise.all([
    findAllSubscriptionTiers(),
    findAllDirectTierInheritances()
  ]);

  const inheritanceMap = new Map();

  for (const row of inheritanceRows) {
    const parentId = String(row.parent_tier_id);

    if (!inheritanceMap.has(parentId)) {
      inheritanceMap.set(parentId, []);
    }

    inheritanceMap.get(parentId).push(row);
  }

  return tiers.map((tier) =>
    attachInheritance(
      tier,
      inheritanceMap.get(String(tier.id)) || []
    )
  );
};

export const getAdminSubscriptionTierById = async (id) => {
  const tierId = parseId(id);

  const tier = await findSubscriptionTierById(
    tierId
  );

  if (!tier) {
    throw new AppError(
      'Subscription tier not found',
      404,
      'SUBSCRIPTION_TIER_NOT_FOUND'
    );
  }

  const inheritedTiers = await findDirectInheritedTiers(
    tierId
  );

  return attachInheritance(
    tier,
    inheritedTiers
  );
};

const lockSubscriptionHierarchy = async (client) => {
  // Serialisasi perubahan tier dan relasi inheritance.
  // Semua operasi CRUD inheritance harus mengikuti
  // aturan penguncian yang sama.
  await client.query(`
    LOCK TABLE
      subscription_tiers,
      subscription_tier_inheritances
    IN SHARE ROW EXCLUSIVE MODE
  `);
};

const validateInheritedTiers = async (
  client,
  parentTierId,
  parentLevel,
  childTierIds
) => {
  if (childTierIds.length === 0) {
    return;
  }

  if (
    parentTierId != null &&
    childTierIds.some(
      (id) => String(id) === String(parentTierId)
    )
  ) {
    throw new AppError(
      'A tier cannot inherit itself',
      400,
      'SELF_INHERITANCE_NOT_ALLOWED'
    );
  }

  const { rows } = await client.query(
    `
      SELECT id, level
      FROM subscription_tiers
      WHERE id = ANY($1::bigint[])
    `,
    [childTierIds]
  );

  if (rows.length !== childTierIds.length) {
    throw new AppError(
      'One or more inherited tiers do not exist',
      400,
      'INHERITED_TIER_NOT_FOUND'
    );
  }

  const invalidLevel = rows.some(
    (tier) => Number(tier.level) >= parentLevel
  );

  if (invalidLevel) {
    throw new AppError(
      'Inherited tiers must have a lower level',
      400,
      'INVALID_INHERITANCE_LEVEL'
    );
  }
};

const validateIncomingInheritances = async (
  client,
  tierId,
  newLevel
) => {
  const { rows } = await client.query(
    `
      SELECT parent.id
      FROM subscription_tier_inheritances sti
      JOIN subscription_tiers parent
        ON parent.id = sti.parent_tier_id
      WHERE sti.child_tier_id = $1
        AND parent.level <= $2
      LIMIT 1
    `,
    [tierId, newLevel]
  );

  if (rows.length > 0) {
    throw new AppError(
      'Tier level conflicts with a higher tier that inherits it',
      409,
      'INHERITANCE_LEVEL_CONFLICT'
    );
  }
};

const findDirectInheritedTierIds = async (
  client,
  tierId
) => {
  const { rows } = await client.query(
    `
      SELECT child_tier_id
      FROM subscription_tier_inheritances
      WHERE parent_tier_id = $1
    `,
    [tierId]
  );

  return rows.map(
    (row) => String(row.child_tier_id)
  );
};

export const createAdminSubscriptionTier = async (payload) => {
  const input = normalizeTierInput(payload, true);

  if (input.slug === 'free') {
    throw new AppError(
      'Free tier is reserved',
      400,
      'RESERVED_TIER_SLUG'
    );
  }

  try {
    return await withSubscriptionTierTransaction(
      async (client) => {
        await lockSubscriptionHierarchy(client);

        await validateInheritedTiers(
          client,
          null,
          input.level,
          input.inheritedTierIds
        );

        const tier = await createSubscriptionTier(
          input,
          client
        );

        await replaceTierInheritances(
          tier.id,
          input.inheritedTierIds,
          client
        );

        const inheritedTiers = await findDirectInheritedTiers(
        tier.id,
        client
        );

        return attachInheritance(tier, inheritedTiers);
      }
    );
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const updateAdminSubscriptionTier = async (
  id,
  payload
) => {
  const tierId = parseId(id);
  const input = normalizeTierInput(payload);

  try {
    return await withSubscriptionTierTransaction(
      async (client) => {
        await lockSubscriptionHierarchy(client);

        const existing = await findSubscriptionTierById(
          tierId,
          client
        );

        if (!existing) {
          throw new AppError(
            'Subscription tier not found',
            404,
            'SUBSCRIPTION_TIER_NOT_FOUND'
          );
        }

        ensureEditableTier(existing);

        const inheritedTierIds =
          input.inheritedTierIds ??
          await findDirectInheritedTierIds(
            client,
            tierId
          );

        await validateInheritedTiers(
          client,
          tierId,
          input.level,
          inheritedTierIds
        );

        await validateIncomingInheritances(
          client,
          tierId,
          input.level
        );

        const updated = await updateSubscriptionTier(
          tierId,
          input,
          client
        );

        if (!updated) {
          throw new AppError(
            'Subscription tier could not be updated',
            409,
            'SUBSCRIPTION_TIER_UPDATE_CONFLICT'
          );
        }

        if (input.inheritedTierIds !== undefined) {
          await replaceTierInheritances(
            tierId,
            inheritedTierIds,
            client
          );
        }

        const inheritedTiers = await findDirectInheritedTiers(
        tierId,
        client
        );

        return attachInheritance(updated, inheritedTiers);
      }
    );
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const changeAdminSubscriptionTierStatus = async (
  id,
  payload
) => {
  validateFields(payload, ['isActive'], ['isActive']);

  if (typeof payload.isActive !== 'boolean') {
    throw new AppError(
      'isActive must be a boolean',
      400,
      'INVALID_TIER_STATUS'
    );
  }

  const tierId = parseId(id);
  const existing = await findSubscriptionTierById(tierId);

  if (!existing) {
    throw new AppError(
      'Subscription tier not found',
      404,
      'SUBSCRIPTION_TIER_NOT_FOUND'
    );
  }

  ensureEditableTier(existing);

  const updated = await updateSubscriptionTierStatus(
    tierId,
    payload.isActive
  );

    const inheritedTiers = await findDirectInheritedTiers(
    tierId
    );

    return attachInheritance(
    updated,
    inheritedTiers
    );
};
