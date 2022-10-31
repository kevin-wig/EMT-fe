export const BASIC = 'basic';
export const STANDARD = 'standard';
export const PREMIUM = 'premium';

export const PackageTypes = {
  [BASIC]: 'Basic',
  [STANDARD]: 'Standard',
  [PREMIUM]: 'Premium',
};

export const PACKAGE_TYPES_OPTIONS = Object.entries(PackageTypes)
  .map(([key, label]) => ({ key, label }));
