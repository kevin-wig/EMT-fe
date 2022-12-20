import React, { useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import { useHistory } from 'react-router';

import { useCompany } from '../../context/company.context';
import { useFleet } from '../../context/fleet.context';
import { useSnackbar } from '../../context/snack.context';
import { useVessel } from '../../context/vessel.context';
import { fleetSchema } from '../../validations/fleet.schema';
import CommonTextField from '../../components/Forms/CommonTextField';
import CommonSelect from '../../components/Forms/CommonSelect';
import CommonButton from '../../components/Buttons/CommonButton';
import MultiSelect from '../../components/Forms/MultiSelect';
import { useAuth } from '../../context/auth.context';
import { SUPER_ADMIN } from '../../constants/UserRoles';

const PREFIX = 'CreateFleet';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  cardHeader: `${PREFIX}-card-header`,
  cardBody: `${PREFIX}-card-body`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  action: `${PREFIX}-action`,
  gridContainer: `${PREFIX}-grid-container`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.title}`]: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.card}`]: {
    padding: '1.5rem',
    color: '#495057',
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
  },
  [`& .${classes.cardHeader}`]: {
    padding: '0.75rem 1.5rem',
    margin: '0',
  },
  [`& .${classes.cardBody}`]: {
    padding: '0',
    fontSize: '0.9rem',
    '& p': {
      marginBottom: '0.5rem',
    },
  },
  [`& .${classes.input}`]: {
    width: '100%',
    margin: '0',
  },
  [`& .${classes.wrapper}`]: {
    marginBottom: '1rem',
  },
  [`& .${classes.action}`]: {
    display: 'flex',
    marginTop: '1.5rem',

    '& .MuiButton-root': {
      marginBottom: '1rem',
      '&:nth-of-type(2)': {
        marginLeft: 'auto',
        marginRight: '0.5rem',
      },
    },
  },
  [`& .${classes.gridContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const CreateFleet = () => {
  const { companies, getCompanies } = useCompany();
  const { createFleet, loading } = useFleet();
  const { vessels, getVessels } = useVessel();
  const { notify } = useSnackbar();
  const { me } = useAuth();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;

  const history = useHistory();

  const formik = useFormik({
    initialValues: {
      name: '',
      company: '',
      vessels: [],
    },
    validationSchema: fleetSchema,
    onSubmit: async (values) => {
      values.company = me.companyId;
      createFleet(values)
        .then(() => {
          notify('Created successfully!');
          history.push('/fleets');
        })
        .catch((err) => {
          if (err?.response?.data) {
            notify(err.response.data.message, 'error');
          }
        });
    },
  });

  const companyId = formik.values.company;
  const vesselList = useMemo(() => vessels.filter((vessel) => vessel.companyId === companyId), [companyId, vessels]);

  useEffect(() => {
    getCompanies().then((res) => {
      if (res?.length > 0) {
        formik.setFieldValue('company', res[0].id);
      }
    });

    getVessels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) {
      formik.setFieldValue('company', me.companyId);
    }
  }, [isSuperAdmin, me]);

  useEffect(() => {
    if (companyId) {
      formik.setFieldValue('vessels', vesselList.map((vessel) => vessel.id));
    }
  }, [companyId, vesselList]);

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">Fleet Create</Typography>
      </Box>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} md={6} lg={4} xl={3}>
          <Card className={classes.card}>
            <CardContent className={classes.cardBody}>
              <form onSubmit={formik.handleSubmit}>
                <Box className={classes.wrapper}>
                  <Typography component="p">Name</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Enter name"
                    {...formik.getFieldProps('name')}
                    error={formik.touched.name && formik.errors.name}
                    loading={loading}
                  />
                </Box>
                {isSuperAdmin && (
                  <Box className={classes.wrapper}>
                    <Typography component="p">Company</Typography>
                    <CommonSelect
                      className={classes.input}
                      options={companies}
                      optionLabel="name"
                      optionValue="id"
                      {...formik.getFieldProps('company')}
                    />
                  </Box>
                )}
                <Box className={classes.wrapper}>
                  <Typography component="p">Vessel</Typography>
                  <MultiSelect
                    className={classes.input}
                    options={vesselList}
                    optionLabel="name"
                    optionValue="id"
                    {...formik.getFieldProps('vessels')}
                    onChange={(value) => {
                      formik.setFieldValue('vessels', value);
                    }}
                  />
                </Box>
                <Box className={classes.action}>
                  <CommonButton
                    variant="normal" onClick={() => history.push('/fleets')}
                  >
                    Back
                  </CommonButton>
                  <CommonButton type="submit">Save</CommonButton>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Root>
  );
};

export default CreateFleet;
