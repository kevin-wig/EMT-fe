import React from 'react';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Title,
  LineController,
  BarController,
);

const PREFIX = 'MultiaxisChart';

const classes = {
  root: `${PREFIX}-root`,
  cardHeader: `${PREFIX}-card-header`,
  cardBody: `${PREFIX}-card-body`,
  cardFooter: `${PREFIX}-card-footer`,
};

const Root = styled(Card)(({ height }) => ({
  [`&.${classes.root}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    height: '100%',
    padding: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  [`& .${classes.cardHeader}`]: {
    padding: '0.75rem 1.5rem',
    margin: '0',
  },
  [`& .${classes.cardBody}`]: {
    padding: '1.5rem',
    fontSize: '0.9rem',
    flexGrow: '1',
    height: height,
    '& p': {
      marginBottom: '0.5rem',
    },
    '& canvas': {
      width: '100% !important',
    },
  },
  [`& .${classes.cardFooter}`]: {
    padding: '0.75rem 1.5rem',
    color: '#6c757d',
  },
}));

const MultiaxisLineChart = ({
  title,
  updatedDate,
  data,
  xLabel = '',
  yLabel = '',
  yMax,
  yMaxTicksLimit,
  height,
  onClick = () => null,
  onDblClick = () => null,
  scales,
}) => {
  let firstValue = data?.labels[0]?.split(';')?.[0];
  let sameType = data?.labels?.every((label) => label.startsWith(firstValue));

  if (sameType) {
    let midpoint = Math.round(data.labels.length / 2);
    data.labels = data.labels.map((datum, i) => midpoint - 1 !== i ? datum.replace(firstValue, '') : datum);
  }

  const chartOptions = {
    maintainAspectRatio: false,
    legend: {
      display: true,
      fullWidth: true,
    },
    tooltips: {
      intersect: false,
      callbacks: {
        label: function (tooltipItem, data) {
          let label = data.datasets[tooltipItem.datasetIndex].label || '';
          if (label) {
            label += ': ';
          }
          label += parseFloat(Number(tooltipItem.yLabel)?.toFixed(3));
          return label;
        },
      },
    },
    hover: {
      intersect: false,
    },
    plugins: {
      filler: {
        propagate: false,
      },
    },
    scales: {
      xAxis1: {
        gridLines: {
          color: 'transparent',
        },
        ticks: {
          callback: function (label) {
            return label.split(';')[1];
          },
        },
        scaleLabel: {
          display: true,
          labelString: xLabel,
        },
      },
      xAxis2: {
        gridLines: {
          color: '#e2e2e2',
        },
        barThickness: 4,
        position: 'right',
        ticks: {
          minRotation: 0,
          maxRotation: 0,
          callback: function (label) {
            let category = label.split(';')[0];
            let range = label.split(';')[1];
            if (range.includes('+')) {
              if (!/\s/.test(category)) {
                if (category.length > 0)
                  return category;
              }
            } else {
              if (category.length > 0)
                return category;
            }
          },
        },
      },
      y: {
        ticks: {
          beginAtZero: true,
        },
        scaleLabel: {
          display: true,
          labelString: yLabel,
        },
      },
    },
  };

  return (
    <Root className={classes.root} height={height || 350}>
      <Box className={classes.cardHeader}>
        <Typography>{title}</Typography>
      </Box>
      <Box className={classes.cardBody} onDoubleClick={onDblClick}>
        <Line data={data} options={chartOptions} onElementsClick={onClick}/>
      </Box>
      <Box className={classes.cardFooter}>
        <Typography variant="body2" component="h2">{updatedDate}</Typography>
      </Box>
    </Root>
  );
};

export default MultiaxisLineChart;
