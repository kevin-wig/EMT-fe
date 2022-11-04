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

export const options = {
  indexAxis: 'y',
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Chart.js Horizontal Bar Chart',
    },
  },
};

const PREFIX = 'HorizontalBarChart';

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

const HorizontalBarChart = ({
  title,
  xLabel = "",
  updatedDate,
  data,
  xMax,
  xMin,
  height,
  onClick = () => null,
}) => {
  const options = {
    indexAxis: 'y',
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
          label += parseFloat(Number(tooltipItem.xLabel)?.toFixed(3));
          return label;
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
    scales: {
      x: {
        ticks: {
          max: xMax,
          min: xMin,
        },
        stacked: false,
        gridLines: {
          color: '#e2e2e2',
        },
        scaleLabel: {
          display: true,
          labelString: xLabel
        }
      },
      y: {
        display: true,
        gridLines: {
          color: '#e2e2e2',
        },
      },
    },
  };

  return (
    <Root className={classes.root} height={height || 350}>
      <Box className={classes.cardHeader}>
        <Typography>{title}</Typography>
      </Box>
      <Box className={classes.cardBody}>
        <Bar data={data} options={options} onElementsClick={onClick} />
      </Box>
      <Box className={classes.cardFooter}>
        <Typography variant="body2" component="h2">{updatedDate}</Typography>
      </Box>
    </Root>
  );
};

export default HorizontalBarChart;
