
const isValidDate = (date) =>
  date instanceof Date &&
  !Number.isNaN(date.getTime());

export const addCalendarYears = (dateInput, years = 1) => {
  const date = new Date(dateInput);

  if (!isValidDate(date)) {
    throw new Error('Invalid subscription date');
  }

  if (
    !Number.isInteger(years) ||
    years <= 0
  ) {
    throw new Error('Invalid subscription duration');
  }

  const year = date.getUTCFullYear() + years;
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Cari hari terakhir pada bulan yang sama
  // di tahun tujuan.
  const lastDayOfTargetMonth = new Date(
    Date.UTC(year, month + 1, 0)
  ).getUTCDate();

  const targetDay = Math.min(
    day,
    lastDayOfTargetMonth
  );

  return new Date(
    Date.UTC(
      year,
      month,
      targetDay,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  );
};
