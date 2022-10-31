import React from 'react';
import { Line } from 'react-chartjs-2';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

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
  onClick = () => null,
  onDblClick = () => null,
}) => {
  const options = {
    maintainAspectRatio: false,
    legend: {
      display: true,
      labels: {
        boxWidth: 20,
      },
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
          if (!useCategory) {
            return label;
          }
          if (!data.datasets[tooltipItem.datasetIndex].label.includes("CII attained")) {
            return label;
          } else {
            return label + " Category: " + data.categories[tooltipItem.index];
          }
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
      xAxes: [
        {
          reverse: true,
          gridLines: {
            color: '#e2e2e2',
          },
          scaleLabel: {
            display: true,
            labelString: xLabel
          }
        },
      ],
      yAxes: [
        {
          ticks: {
            stepSize: stepSize || 0.005,
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
      ],
    },
  };

  return (
    <Root className={classes.root} height={height || 350}>
      <Box className={classes.cardHeader}>
        <Typography>{title}</Typography>
      </Box>
      <Box className={classes.cardBody} onDoubleClick={onDblClick}>
        <Line data={data} options={options} onElementsClick={onClick} />
      </Box>
      <Box className={classes.cardFooter}>
        <Typography variant="body2" component="h2">{updatedDate}</Typography>
      </Box>
    </Root>
  );
};

export default LineChart;
