import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
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

const PREFIX = 'LineChart';

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

const LineChart = ({
  title,
  xLabel = "",
  yLabel = "",
  updatedDate,
  data,
  useCategory = false,
  height,
  yMaxTicksLimit,
  stepSize,
  extraOptions = {},
  onClick = () => null,
  onDblClick = () => null,
}) => {
  const updatedData = useMemo(() => {
    if (data.labels.length === 1) {
      return {
        ...data,
        labels: [null, ...data.labels, null],
        datasets: data.datasets.map((datum) => ({ ...datum, data: [null, ...datum.data, null] })),
      }
    }
    return data;
  }, [data]);
  const options = {
    onClick,
    maintainAspectRatio: false,
    legend: {
      display: true,
      labels: {
        boxWidth: 20,
      },
    },
    hover: {
      intersect: true,
    },
    plugins: {
      filler: {
        propagate: false,
      },
    },
    scales: {
      x: {
        reverse: false,
        gridLines: {
          color: '#e2e2e2',
        },
        title: {
          display: true,
          text: xLabel
        }
      },
      y: {
        ticks: {
          stepSize: stepSize || 0.005,
          maxTicksLimit: yMaxTicksLimit || 8,
        },
        display: true,
        gridLines: {
          color: '#e2e2e2',
        },
        title: {
          display: true,
          text: yLabel
        }
      },
    },
    ...extraOptions,
  };

  return (
    <Root className={classes.root} height={height || 350}>
      <Box className={classes.cardHeader}>
        <Typography>{title}</Typography>
      </Box>
      <Box className={classes.cardBody}>
        <Chart data={updatedData} options={options} onDoubleClick={onDblClick} type="line" />
      </Box>
      <Box className={classes.cardFooter}>
        <Typography variant="body2" component="h2">{updatedDate}</Typography>
      </Box>
    </Root>
  );
};

export default LineChart;
