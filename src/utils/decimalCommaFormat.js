export const twoDigitsOnly = (value) =>
/^\d+(\.\d{0,2})?$/.test(value) || value === undefined || value.length === 0;

export const threeDigitsOnly = (value) =>
  /^\d+(\.\d{0,3})?$/.test(value) || value === undefined || value.length === 0;