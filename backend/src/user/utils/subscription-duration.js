
const isValidDate = (date) =>
  date instanceof Date &&
  !Number.isNaN(date.getTime());

const validateDuration = (value) => {
  if (
    !Number.isSafeInteger(value) ||
    value <= 0
  ) {
    throw new Error('Invalid subscription duration');
  }
};

const parseDate = (dateInput) => {
  const date = new Date(dateInput);

  if (!isValidDate(date)) {
    throw new Error('Invalid subscription date');
  }

  return date;
};

const ensureValidResult = (date) => {
  if (!isValidDate(date)) {
    throw new Error('Subscription expiration out of range');
  }

  return date;
};

const getLastDayOfMonth = (year, month) => {
  const date = new Date(0);

  date.setUTCFullYear(year, month + 1, 0);
  date.setUTCHours(0, 0, 0, 0);

  return date.getUTCDate();
};

export const addCalendarDays = (
  dateInput,
  days = 1
) => {
  validateDuration(days);

  const date = parseDate(dateInput);

  date.setUTCDate(date.getUTCDate() + days);

  return ensureValidResult(date);
};

export const addCalendarMonths = (
  dateInput,
  months = 1
) => {
  validateDuration(months);

  const date = parseDate(dateInput);

  const originalDay = date.getUTCDate();

  // Pindah ke awal bulan agar tidak terjadi
  // overflow otomatis pada tanggal 29-31.
  date.setUTCDate(1);

  date.setUTCMonth(
    date.getUTCMonth() + months
  );

  const lastDay = getLastDayOfMonth(
    date.getUTCFullYear(),
    date.getUTCMonth()
  );

  date.setUTCDate(
    Math.min(originalDay, lastDay)
  );

  return ensureValidResult(date);
};

export const addCalendarYears = (
  dateInput,
  years = 1
) => {
  validateDuration(years);

  const date = parseDate(dateInput);

  const originalDay = date.getUTCDate();

  date.setUTCDate(1);

  date.setUTCFullYear(
    date.getUTCFullYear() + years
  );

  const lastDay = getLastDayOfMonth(
    date.getUTCFullYear(),
    date.getUTCMonth()
  );

  date.setUTCDate(
    Math.min(originalDay, lastDay)
  );

  return ensureValidResult(date);
};

export const addSubscriptionDuration = (
  dateInput,
  durationValue,
  durationUnit
) => {
  validateDuration(durationValue);

  switch (durationUnit) {
    case 'day':
      return addCalendarDays(
        dateInput,
        durationValue
      );

    case 'month':
      return addCalendarMonths(
        dateInput,
        durationValue
      );

    case 'year':
      return addCalendarYears(
        dateInput,
        durationValue
      );

    default:
      throw new Error(
        'Unsupported subscription duration unit'
      );
  }
};
