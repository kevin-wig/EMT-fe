import React from 'react';
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
import { Bar } from 'react-chartjs-2';
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

const PREFIX = 'BarChart';

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

const BarChart = ({
  title,
  xLabel = "",
  yLabel = "",
  xStack = false,
  updatedDate,
  data,
  yMax,
  yMaxTicksLimit,
  height,
  onClick = () => null,
  onDblClick = () => null,
  scales,
}) => {
  const chartOptions = {
    onClick,
    maintainAspectRatio: false,
    legend: {
      display: true,
      fullWidth: false,
    },
    tooltips: {
      intersect: false,
      callbacks: {
        label: function (tooltipItem, data) {
          let label = data.datasets[tooltipItem.datasetIndex].label || "";
          if (label) {
            label += ": ";
          }
          label += parseFloat(Number(tooltipItem.yLabel)?.toFixed(3));
          if (tooltipItem.label === data.datasets[tooltipItem.datasetIndex].label) {
            return label;
          }
          return '';
        },
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
    scales: scales ? scales : {
      x: {
        stacked: xStack,
        gridLines: {
          color: 'transparent',
        },
        scaleLabel: {
          display: true,
          labelString: xLabel
        }
      },
      y: {
        ticks: {
          max: yMax,
          min: 0,
          stepSize: 0.005,
          maxTicksLimit: yMaxTicksLimit || 8,
        },
        display: true,
        gridLines: {
          color: '#e2e2e2',
        },
        scaleLabel: {
          display: true,
          labelString: yLabel
        }
      },
    },
  };

  return (
    <Root className={classes.root} height={height || 350}>
      <Box className={classes.cardHeader}>
        <Typography>{title}</Typography>
      </Box>
      <Box className={classes.cardBody}>
        <Bar data={data} options={chartOptions} onDoubleClick={onDblClick} />
      </Box>
      <Box className={classes.cardFooter}>
        <Typography variant="body2" component="h2">{updatedDate}</Typography>
      </Box>
    </Root>
  );
};

export default BarChart;
