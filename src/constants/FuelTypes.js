export const MGO = 'MGO';
export const LFO = 'LFO';
export const HFO = 'HFO';
export const VLSFO = 'VLSFO';
export const LNG = 'LNG';

export const FuelTypes = {
  [MGO]: 'MGO',
  [LFO]: 'LFO',
  [HFO]: 'HFO',
  [VLSFO]: 'VLSFO',
  [LNG]: 'LNG',
};

export const FUEL_TYPES_OPTIONS = Object.entries(FuelTypes)
  .map(([key, label]) => ({ key, label }));
