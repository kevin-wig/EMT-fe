import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router';
import { useFormik } from 'formik';

import { useCompany } from '../../context/company.context';
import { useFleet } from '../../context/fleet.context';
import { useSnackbar } from '../../context/snack.context';
import { useVessel } from '../../context/vessel.context';
import CommonTextField from '../../components/Forms/CommonTextField';
import CommonSelect from '../../components/Forms/CommonSelect';
import CommonButton from '../../components/Buttons/CommonButton';
import CommonDatePicker from '../../components/Forms/DatePicker';
import Dropzone from '../../components/Forms/Dropzone';
import { vesselSchema } from '../../validations/vessel.schema';
import { useAuth } from '../../context/auth.context';
import { SUPER_ADMIN } from '../../constants/UserRoles';

const PREFIX = 'VesselDetail';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  card: `${PREFIX}-card`,
  cardHeader: `${PREFIX}-card-header`,
  cardBody: `${PREFIX}-card-body`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  action: `${PREFIX}-action`,
  city: `${PREFIX}-city`,
  fuel: `${PREFIX}-fuel`,
  gridContainer: `${PREFIX}-grid-container`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    '& .MuiDivider-root': {
      flexGrow: '1',
      borderColor: theme.palette.border.secondary,
    },
  },
  [`& .${classes.title}`]: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.card}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    height: '100%',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',

    '&.speed': {
      background: theme.palette.primary.main,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
    },
  },
  [`& .${classes.cardHeader}`]: {
    padding: '0.75rem 1.5rem',
    margin: 0,
  },
  [`& .${classes.cardBody}`]: {
    padding: 0,
    fontSize: '0.9rem',
    flexGrow: 1,
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
  [`& .${classes.city}`]: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    color: theme.palette.primary.main,
    '& .MuiDivider-root': {
      margin: '0 1rem',
    },
  },
  [`& .${classes.fuel}`]: {
    border: '1px solid',
    borderColor: theme.palette.border.secondary,
    borderRadius: '0.5rem',
    '& div': {
      padding: '0.5rem 1rem',
    },
    '& h2': {
      fontWeight: '800',
    },
  },
  [`& .${classes.gridContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const CreateVessel = () => {
  const { me } = useAuth();
  const isSuperAdmin = me?.userRole?.role === SUPER_ADMIN;
  const { vesselTypes, createVessel, getVesselTypes, loading } = useVessel();
  const { companies, getCompanies } = useCompany();
  const { fleets, getFleets } = useFleet();
  
  const { notify } = useSnackbar();

  const history = useHistory();

  const [files, setFiles] = useState([]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      companyId: '',
      fleet: '',
      vesselType: '',
      imo: '',
      dwt: '',
      netTonnage: '',
      grossTonnage: '',
      propulsionPower: '',
      powerOutput: '',
      dateOfBuilt: '',
      iceClass: '',
      eedi: '',
      eexi: '',
    },
    validationSchema: vesselSchema,
    onSubmit: (values) => {
      const createVesselData = Object.entries(values).reduce((obj, value) => {
        if (value[1]) {
          obj = { ...obj, [value[0]]: value[1] };
          return obj;
        }
        return obj;
      }, {});

      if (!isSuperAdmin) {
        createVesselData.companyId = me.companyId;
      }
      createVessel(createVesselData)
        .then(() => {
          notify('Created successfully!');
          history.push('/vessels');
        })
        .catch((err) => {
          if (err?.response?.data) {
            notify(err.response.data.message, 'error');
          }
        });
    },
  });

  useEffect(() => {
    getVesselTypes();
    getCompanies();
    getFleets();
  }, [getCompanies, getFleets, getVesselTypes]);

  const handleChangeFiles = (files, parsedResult) => {
    setFiles(files);
    formik.setValues({ ...formik.values, ...parsedResult });
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">Vessel details</Typography>
      </Box>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} md={8} lg={6} xl={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardBody}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Net tonnage</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter Net tonnage"
                        {...formik.getFieldProps('netTonnage')}
                        error={formik.touched.netTonnage && formik.errors.netTonnage}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography component="p">Contact Email address</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter email address"
                        {...formik.getFieldProps('email')}
                        error={formik.touched.email && formik.errors.email}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Gross tonnage</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter Gross tonnage"
                        {...formik.getFieldProps('grossTonnage')}
                        error={formik.touched.grossTonnage && formik.errors.grossTonnage}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  {isSuperAdmin && (
                    <Grid item xs={12} md={6}>
                      <Box className={classes.wrapper}>
                        <Typography component="p">Company</Typography>
                        <CommonSelect
                          className={classes.input}
                          options={companies}
                          optionLabel="name"
                          optionValue="id"
                          {...formik.getFieldProps('companyId')}
                        />
                      </Box>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Power Output</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter Power Output"
                        {...formik.getFieldProps('powerOutput')}
                        error={formik.touched.powerOutput && formik.errors.powerOutput}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Fleet</Typography>
                      <CommonSelect
                        className={classes.input}
                        options={fleets}
                        optionLabel="name"
                        optionValue="id"
                        {...formik.getFieldProps('fleet')}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Main Propulsion Power</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter Propulsion Power"
                        {...formik.getFieldProps('propulsionPower')}
                        error={formik.touched.propulsionPower && formik.errors.propulsionPower}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Vessel Type</Typography>
                      <CommonSelect
                        className={classes.input}
                        options={vesselTypes}
                        optionLabel="name"
                        optionValue="id"
                        {...formik.getFieldProps('vesselTypeId')}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>Date built</Typography>
                      <CommonDatePicker
                        className={classes.input}
                        placeholder="Enter Date built"
                        {...formik.getFieldProps('dateOfBuilt')}
                        onChange={(value) => formik.setFieldValue('dateOfBuilt', value)}
                        error={formik.touched.dateOfBuilt && formik.errors.dateOfBuilt}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>IMO</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter IMO"
                        {...formik.getFieldProps('imo')}
                        error={formik.touched.imo && formik.errors.imo}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>ICE Class</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter ICE Class"
                        {...formik.getFieldProps('iceClass')}
                        error={formik.touched.iceClass && formik.errors.iceClass}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Typography>DWT</Typography>
                      <CommonTextField
                        className={classes.input}
                        placeholder="Enter DWT"
                        {...formik.getFieldProps('dwt')}
                        error={formik.touched.dwt && formik.errors.dwt}
                        loading={loading}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box className={classes.wrapper}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography>EEDI</Typography>
                          <CommonTextField
                            type="number"
                            className={classes.input}
                            placeholder="Enter EEDI"
                            {...formik.getFieldProps('eedi')}
                            error={formik.touched.eedi && formik.errors.eedi}
                            loading={loading}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography>EEXI</Typography>
                          <CommonTextField
                            type="number"
                            className={classes.input}
                            placeholder="Enter EEXI"
                            {...formik.getFieldProps('eexi')}
                            error={formik.touched.eexi && formik.errors.eexi}
                            loading={loading}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
                <div className={classes.action}>
                  <CommonButton
                    variant="normal"
                    onClick={() => history.push('/vessels')}
                  >
                    Back
                  </CommonButton>
                  <CommonButton type="submit">Save</CommonButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Root>
  );
};

export default CreateVessel;
