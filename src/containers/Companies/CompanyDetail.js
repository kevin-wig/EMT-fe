import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import { useFormik } from 'formik';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useCompany } from '../../context/company.context';
import { useSnackbar } from '../../context/snack.context';
import { companySchema } from '../../validations/company.schema';
import { pick } from '../../utils/pick';
import CommonTextField from '../../components/Forms/CommonTextField';
import CommonSelect from '../../components/Forms/CommonSelect';
import CountrySelect from '../../components/Forms/CountrySelect';
import ListGroup from '../../components/Widgets/ListGroup';
import DetailCard from '../../components/Cards/DetailCard';

import { PACKAGE_TYPES_OPTIONS } from '../../constants/PackageTypes';
import { useAuth } from '../../context/auth.context';
import { SUPER_ADMIN } from '../../constants/UserRoles';
import SailingIcon from '@mui/icons-material/Sailing';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddImo from '../../assets/images/add_imo.svg';

const PREFIX = 'CompaniesDetail';
const classes = {
  root: `${PREFIX}-root`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  gridContainer: `${PREFIX}-grid-container`,
  detailCard: `${PREFIX}-detail-card`,
  detailCardWrapper: `${PREFIX}-detail-card-wrapper`,
};

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.gridContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  [`& .${classes.input}`]: {
    width: '100%',
    margin: 0,
  },
  [`& .${classes.wrapper}`]: {
    marginBottom: '1rem',
  },
  [`& .${classes.detailCardWrapper}`]: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '2rem',
  },
  [`& .${classes.detailCard}`]: {
    marginBottom: '2rem',
  },
}));

const CompanyDetail = ({ match }) => {
  const { me } = useAuth();
  const {
    getCompany,
    updateCompany,
    removeCompany,
    createCompany,
    createVesselOnboardingLink,
    deleteVesselOnboardingLink,
    loading,
  } = useCompany();

  const { notify } = useSnackbar();

  const [company, setCompany] = useState({});

  const [imo, setImo] = useState('');

  const [validationError, setValidationError] = useState('');

  const [isSearching, setIsSearching] = useState(false);

  const [rawImoList, setRawImoList] = useState([]);

  const history = useHistory();

  const isEditEnable = useMemo(() => {
    return [SUPER_ADMIN].includes(me?.userRole?.role);
  }, [me?.userRole?.role]);

  const formik = useFormik({
    initialValues: {
      name: '',
      primaryContactName: '',
      primaryContactEmailAddress: '',
      packageType: '',
      country: '',
      contactPhoneNumber: '',
      limitVesselOnboarding: company?.limitVesselOnboarding ?? false,
    },
    validationSchema: companySchema,
    onSubmit: async (values) => {
      if (match.params.id && match.params.id !== 'create') {
        updateCompany(match.params.id, values)
          .then(() => {
            notify('Updated successfully!');
            history.push('/companies');
          })
          .catch((err) => {
            if (err?.response?.data) {
              notify(err.response.data.message, 'error');
            }
          });
      } else {
        createCompany(values)
          .then(() => {
            notify('Created successfully!');
            history.push('/companies');
          })
          .catch((err) => {
            if (err?.response?.data) {
              notify(err.response.data.message, 'error');
            }
          });
      }
    },
  });

  useEffect(() => {
    if (match.params.id && match.params.id !== 'create') {
      getCompany(match.params.id).then((res) => {
        setCompany(res);
        formik.setValues(
          pick(res, [
            'name',
            'primaryContactName',
            'primaryContactEmailAddress',
            'packageType',
            'country',
            'contactPhoneNumber',
            'limitVesselOnboarding',
          ])
        );
        setRawImoList(res?.vesselOnboardingLinks);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = () => {
    removeCompany(match.params.id).then(() => {
      notify('Removed successfully!');
      history.push('/companies');
    });
  };

  const handleImoChange = (event) => {
    setValidationError('');
    setImo(event.target.value);
  };

  const handleAddImo = () => {
    if (imo?.length === 0) {
      setIsSearching(false);
      return;
    }
    if (isNaN(imo)) {
      setValidationError('IMO must be a number.');
      return;
    }
    if (imo.length < 7 || imo.length > 7) {
      setValidationError('IMO must consist of 7 digits.');
      return;
    }
    const vesselOnboardingLinkObj = {
      company_id: company.id,
      imo: imo,
    };
    createVesselOnboardingLink(vesselOnboardingLinkObj)
      .then(() => {
        getCompany(match.params.id).then((res) => {
          setCompany({
            ...company,
            vesselOnboardingLinks: res.vesselOnboardingLinks,
          });
          setRawImoList(res.vesselOnboardingLinks);
        });
        notify('IMO Link added successfully!');
      })
      .then(() => setImo(''))
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
      });
  };

  const handleSearchImo = () => {
    setIsSearching(true);
  };

  const handleDeleteImo = (imo) => {
    deleteVesselOnboardingLink(imo)
      .then(() => {
        getCompany(match.params.id).then((res) => {
          setCompany({
            ...company,
            vesselOnboardingLinks: res.vesselOnboardingLinks,
          });
          setRawImoList(res.vesselOnboardingLinks);
        });
        notify('IMO Link removed successfully!');
      })
      .catch((err) => {
        if (err?.response?.data) {
          notify(err.response.data.message, 'error');
        }
      });
  };

  const handleImoSearch = (event) => {
    let searchValue = event.target.value;
    if (searchValue.length === 0) {
      setCompany({ ...company, vesselOnboardingLinks: rawImoList });
    }

    let filteredImoList = [...rawImoList];

    filteredImoList = filteredImoList.filter(function (vessel) {
      return vessel?.imo?.indexOf(searchValue) > -1 || !searchValue;
    });

    setCompany({ ...company, vesselOnboardingLinks: filteredImoList });
  };

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant='title'>Company details</Typography>
      </Box>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} md={8} lg={6}>
          <DetailCard
            onBack={() => history.push('/companies')}
            onDelete={
              match.params.id && match.params.id !== 'create' && handleDelete
            }
            onSubmit={formik.handleSubmit}
            disableAction={!isEditEnable}
          >
            {match.params.id && match.params.id !== 'create' && (
              <Box className={classes.detailCardWrapper}>
                <ListGroup
                  topLabel='Company Name'
                  topValue={company?.name}
                  bottomLabel='Registered Personnel'
                  bottomValue={company?.users?.length}
                  className={classes.detailCard}
                  loading={loading}
                />
                <ListGroup
                  topLabel='Number of Vessels'
                  topValue={company?.vessels?.length}
                  bottomLabel='Number of Fleets'
                  bottomValue={company?.fleets?.length}
                  className={classes.detailCard}
                  loading={loading}
                />
              </Box>
            )}
            <Box className={classes.wrapper}>
              <Typography component='p'>Name</Typography>
              <CommonTextField
                className={classes.input}
                placeholder='Enter name'
                {...formik.getFieldProps('name')}
                error={formik.touched.name && formik.errors.name}
                loading={loading}
                disabled={!isEditEnable}
              />
            </Box>
            <Box className={classes.wrapper}>
              <Typography>Contact name</Typography>
              <CommonTextField
                className={classes.input}
                placeholder='Enter contact name'
                {...formik.getFieldProps('primaryContactName')}
                error={
                  formik.touched.primaryContactName &&
                  formik.errors.primaryContactName
                }
                loading={loading}
                disabled={!isEditEnable}
              />
            </Box>
            <Box className={classes.wrapper}>
              <Typography>Contact Email address</Typography>
              <CommonTextField
                className={classes.input}
                placeholder='name@example.com'
                {...formik.getFieldProps('primaryContactEmailAddress')}
                error={
                  formik.touched.primaryContactEmailAddress &&
                  formik.errors.primaryContactEmailAddress
                }
                loading={loading}
                disabled={!isEditEnable}
              />
            </Box>
            <Box className={classes.wrapper}>
              <Typography>Contact Package type</Typography>
              <CommonSelect
                className={classes.input}
                options={PACKAGE_TYPES_OPTIONS}
                optionLabel='label'
                optionValue='key'
                {...formik.getFieldProps('packageType')}
                error={formik.touched.packageType && formik.errors.packageType}
                loading={loading}
                disabled={!isEditEnable}
              />
            </Box>
            <Box className={classes.wrapper}>
              <Typography>Country</Typography>
              <CountrySelect
                {...formik.getFieldProps('country')}
                onChange={(value) => formik.setFieldValue('country', value)}
                error={formik.touched.country && formik.errors.country}
                disabled={!isEditEnable}
              />
            </Box>
            <Box className={classes.wrapper}>
              <Typography>Contact Phone number</Typography>
              <CommonTextField
                className={classes.input}
                placeholder='Enter phone number'
                {...formik.getFieldProps('contactPhoneNumber')}
                error={
                  formik.touched.contactPhoneNumber &&
                  formik.errors.contactPhoneNumber
                }
                loading={loading}
                disabled={!isEditEnable}
              />
            </Box>
            {isEditEnable && (
              <>
                <Box className={classes.wrapper}>
                  <Typography>
                    Limit Vessels Onboarding{' '}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik?.values?.limitVesselOnboarding}
                        />
                      }
                      label=''
                      name='limitVesselOnboarding'
                      onChange={formik.handleChange}
                    />
                  </Typography>
                </Box>

                {formik?.values?.limitVesselOnboarding && (
                  <Box className={classes.wrapper}>
                    <Typography>Enter vessel's IMO to limit</Typography>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                      }}
                    >
                      {isSearching ? (
                        <TextField
                          id='outlined-basic'
                          label='Search...'
                          variant='outlined'
                          style={{
                            width: '80%',
                            marginBottom: '1rem',
                            marginTop: '1rem',
                          }}
                          onKeyUp={handleImoSearch}
                        />
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            width: '80%',
                            marginBottom: '1rem',
                            marginTop: '1rem',
                          }}
                        >
                          <TextField
                            id='outlined-basic'
                            label='Type IMO to link...'
                            variant='outlined'
                            style={{ width: '100%' }}
                            onChange={handleImoChange}
                          />
                          {validationError && (
                            <Typography
                              variant='h6'
                              style={{
                                marginTop: '1rem',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                verticalAlign: 'middle',
                              }}
                              color='error'
                            >
                              <ErrorOutlineIcon
                                fontSize='small'
                                style={{
                                  verticalAlign: 'middle',
                                  marginRight: '0.2rem',
                                  marginTop: '-0.2rem',
                                }}
                              />
                              {validationError}
                            </Typography>
                          )}
                        </div>
                      )}

                      <IconButton
                        aria-label='add'
                        color='primary'
                        style={{ marginLeft: '1rem' }}
                        onClick={handleAddImo}
                      >
                        <AddIcon />
                      </IconButton>

                      <IconButton
                        aria-label='search'
                        color='secondary'
                        style={{ marginLeft: '1rem' }}
                        onClick={handleSearchImo}
                      >
                        <SearchIcon />
                      </IconButton>
                    </div>
                    {company?.vesselOnboardingLinks?.length === 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={AddImo}
                          alt='Add Imo'
                          style={{ width: '50%' }}
                        ></img>
                        <Typography variant='h6' component='div'>
                          No vessel IMOs linked to this company.
                        </Typography>
                      </div>
                    )}
                    {company?.vesselOnboardingLinks.length !== 0 && (
                      <Typography
                        variant='h6'
                        component='div'
                        style={{ marginTop: '1rem' }}
                      >
                        <i>
                          {company?.vesselOnboardingLinks.length} Vessel(s)
                          linked for this company
                        </i>
                      </Typography>
                    )}
                    <List
                      style={{
                        maxHeight: 200,
                        overflow: 'auto',
                        marginTop: '0.5rem',
                      }}
                    >
                      {company?.vesselOnboardingLinks?.map((link) => {
                        return (
                          <ListItem
                            key={link?.link_id}
                            secondaryAction={
                              <IconButton
                                edge='end'
                                aria-label='delete'
                                color='error'
                                onClick={(e) => handleDeleteImo(link?.imo)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon style={{ color: '#5C636A' }}>
                              <SailingIcon fontSize='large' />
                            </ListItemIcon>
                            <ListItemText
                              primary={link?.imo}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>
                )}
              </>
            )}
          </DetailCard>
        </Grid>
      </Grid>
    </Root>
  );
};

export default CompanyDetail;
