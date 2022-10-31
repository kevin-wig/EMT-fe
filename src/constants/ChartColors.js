import Colors from '../theme/colors';

export const ChartColors = [
  Colors.primary.main,
  Colors.success.main,
  Colors.warning.main,
  Colors.error.main,
  Colors.info.main,
  Colors.info.hover,
  Colors.secondary.main,
  Colors.border.focus,
];

export const newColor = (index) => {
  if (index === undefined) {
    return ChartColors[parseInt((ChartColors.length * Math.random()).toString())];
  }

  return ChartColors[index % ChartColors.length];
};
