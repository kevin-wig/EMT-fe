export const YEARS = [
  2019,
  2020,
  2021,
  2022,
  2023,
  2024,
  2025,
  2026,
];

export const YEARS_OPTION = YEARS.map((year) => ({ id: year, label: year }));

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const VESSEL_CATEGORIES = ['A', 'B', 'C', 'D', 'E'];
export const VESSEL_CATEGORIES_ENUM = VESSEL_CATEGORIES.reduce((acc, category, index) => ({
  ...acc,
  [index]: category,
  [category]: index,
}), {});

export const EXPORT_OPTION = {
  PDF: 'PDF',
  XLS: 'XLS',
};

export const EXPORT_OPTIONS = [
  { id: EXPORT_OPTION.PDF, label: 'PDF' },
  { id: EXPORT_OPTION.XLS, label: 'XLS' },
];

export const DASHBOARD_PAGES = {
  CII: 'cii',
  ETS: 'eu-ets',
  GHG :'eu-ghgs',
};

export const JOURNEY_OPTION = {
  CII: 'CII',
  ETS: 'ETS',
};

export const ADDITIONAL_VOYAGE_OPTIONS = [
  { value: JOURNEY_OPTION.CII, label: 'CII' },
  { value: JOURNEY_OPTION.ETS, label: 'ETS' },
];

export const FUEL_GRADES = [
  { value: 'MGO', label: 'MGO' },
  { value: 'LFO', label: 'LFO' },
  { value: 'HFO', label: 'HFO' },
  { value: 'VLSFO_AD', label: 'VLSFO (RMA to RMD)' },
  { value: 'VLSFO_EK', label: 'VLSFO (RME to RMK)' },
  { value: 'VLSFO_XB', label: 'VLSFO (DMX to DMB)' },
  { value: 'LNG', label: 'LNG' },
  { value: 'LPG_PP', label: 'LPG (Propane)' },
  { value: 'LPG_BT', label: 'LPG (Butane)' },
  { value: 'BIO_FUEL', label: 'Biofuel B30' },
];

export const VIEW_MODE = {
  OVERTIME: 'OVERTIME',
  PER_VOYAGE: 'VOYAGE',
};

export const CII_VIEW_MODES = [
  { id: VIEW_MODE.OVERTIME, label: 'CII over time' },
  { id: VIEW_MODE.PER_VOYAGE, label: 'CII per voyage' },
];

export const ETS_VIEW_MODES = [
  { id: VIEW_MODE.OVERTIME, label: 'ETS over time' },
  { id: VIEW_MODE.PER_VOYAGE, label: 'ETS per voyage' },
];
