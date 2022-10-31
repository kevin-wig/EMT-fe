export const genYearArray = (yearArray) => {
  const minYear = Math.min(...yearArray);
  const maxYear = Math.max(...yearArray);
  return new Array(maxYear - minYear + 1).fill('').map((item, index) => minYear + index);
};
