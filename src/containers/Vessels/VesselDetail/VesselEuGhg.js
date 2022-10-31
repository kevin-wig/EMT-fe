import React, { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/material/styles/useTheme';

import { useVessel } from '../../../context/vessel.context';
import InfoCard from '../../../components/Cards/InfoCard';
import BarChart from '../../../components/Charts/BarChart';

const PREFIX = 'VesselGhg';
const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {},
}));

const VesselEuGhg = ({ id, selectedYear }) => {
  const { getGhg, loading } = useVessel();

  const theme = useTheme();

  const [actual, setActual] = useState(0);
  const [target, setTarget] = useState(0);
  const [excess, setExcess] = useState(0);
  const [missing, setMissing] = useState(0);

  const data = useMemo(() => ({
    labels: [
      'Target',
      'Actual',
      missing === 0 ? 'Excess' : 'Missing',
    ],
    datasets: [
      {
        label: 'Compliance units',
        backgroundColor: theme.palette.primary.main,
        data: [target, actual, missing === 0 ? excess : missing],
        barPercentage: 0.3,
        categoryPercentage: 0.3,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [actual, target, excess, missing]);

  useEffect(() => {
    getGhg(id, selectedYear).then((res) => {
      const data = res.data || {};
      setActual(data.attained || '');
      setTarget(data.required || '');

      if (data.required >= data.attained) {
        setExcess(data.required - data.attained);
        setMissing(0);
      } else {
        setExcess(0);
        setMissing(data.attained - data.required);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  return (
    <Root className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="GHGs Actual" subTitle={selectedYear} value={actual || '0'} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="GHGs Target" subTitle={selectedYear} value={`€${target || 0}`} loading={loading} />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard
            title={`${missing === 0 ? 'Excess' : 'Missing'} Compliance Units`}
            subTitle={selectedYear}
            value={(missing === 0 ? excess : missing) || '0'}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3} xl={3}>
          <InfoCard title="Total Penalties" subTitle={selectedYear} value={'0'} color="primary" loading={loading} />
        </Grid>
        <Grid item xs={12}>
          <BarChart title="Compliance Units" updatedAt="Updated yesterday at 11:59 PM" data={data} />
        </Grid>
      </Grid>
    </Root>
  );
};

export default VesselEuGhg;
