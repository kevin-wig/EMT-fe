import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useFormik } from 'formik';
import { useHistory } from 'react-router';

import { useUser } from '../../context/user.context';
import { useAuth } from '../../context/auth.context';
import { useCompany } from '../../context/company.context';
import { pick } from '../../utils/pick';
import { userSchema } from '../../validations/user.schema';
import CommonTextField from '../../components/Forms/CommonTextField';
import CommonButton from '../../components/Buttons/CommonButton';
import CommonSelect from '../../components/Forms/CommonSelect';
import { COMPANY_EDITOR, SUPER_ADMIN } from '../../constants/UserRoles';

const PREFIX = 'UserDetail';
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  gridContainer: `${PREFIX}-grid-container`,
  card: `${PREFIX}-card`,
  cardHeader: `${PREFIX}-card-header`,
  cardBody: `${PREFIX}-card-body`,
  input: `${PREFIX}-card-input`,
  wrapper: `${PREFIX}-wrapper`,
  action: `${PREFIX}-action`,
  changePassword: `${PREFIX}-changePassword`,
  checkWrapper: `${PREFIX}-checkWrapper`,
  label: `${PREFIX}-label`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.title}`]: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  [`& .${classes.gridContainer}`]: {
    display: 'flex',
    justifyContent: 'center',
  },
  [`& .${classes.card}`]: {
    boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important',
    padding: '1.5rem',
  },
  [`& .${classes.cardHeader}`]: {
    padding: '0.75rem 1.5rem',
    margin: '0',
  },
  [`& .${classes.cardBody}`]: {
    padding: 0,
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
  [`& .${classes.checkWrapper}`]: {
    display: 'flex',
    alignItems: 'center',
  },
  [`& .${classes.label}`]: {
    marginBottom: '0 !important',
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
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
  [`& .${classes.changePassword}`]: {
    width: 'min-width',
    marginTop: '0.5rem',
    display: 'flex',
    '& span': {
      color: theme.palette.primary.main,
      cursor: 'pointer',
    },
  },
}));

const UserDetail = ({ match }) => {
  const { me } = useAuth();
  const { companies, getCompanies } = useCompany();
  const { getUser, roles, getRoles, updateUser, removeUser, createUser, loading, requestChangePassword } = useUser();
  const [currentUser, setCurrentUser] = useState();
  const history = useHistory();
  const visibleRoles = (roles || []).filter((role) => role.role !== SUPER_ADMIN);

  const isProfilePage = useMemo(() => {
    return match?.path === '/profile';
  }, [match?.path]);

  const isEditEnable = useMemo(() => {
    return [SUPER_ADMIN, COMPANY_EDITOR].includes(me?.userRole?.role);
  }, [me?.userRole?.role]);

  const pageTitle = isProfilePage
    ? 'Profile' : isEditEnable
      ? (isNaN(match?.params?.id) ? 'User Create' : 'User Update')
      : 'User View';

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      companyId: '',
      userRole: '',
      isActive: false,
    },
    validationSchema: userSchema,
    onSubmit: async (values) => {
      if (match?.params.id) {
        updateUser(match?.params.id, (pick(values, ['firstname', 'lastname', 'email', 'companyId', 'userRole', 'isActive'])))
          .then(() => {
            // history.push('/users');
          });
      } else {
        createUser(values).then(() => history.push('/users'));
      }
    },
  });

  const selectedRoleId = formik.getFieldProps('userRole').value;
  const selectedRole = useMemo(() => {
    return roles?.find((role) => role.id === selectedRoleId)?.role;
  }, [selectedRoleId]);

  useEffect(() => {
    if (selectedRole === SUPER_ADMIN) {
      formik.setFieldValue('companyId', '');
    }
  }, [selectedRole]);

  useEffect(() => {
    if (isEditEnable) {
      const isCreate = isNaN(match?.params?.id);
      getCompanies().then((res) => {
        if (res?.length > 0 && !isCreate) {
          formik.setFieldValue('companyId', res[0].id);
        }
      });

      getRoles().then((res) => {
        if (res?.length > 0 && !isCreate) {
          formik.setFieldValue('userRole', res[0].id);
        }
      });
    }

    if (match?.params.id) {
      getUser(match?.params.id).then((res) => {
        const user = res.data;
        setCurrentUser(user);
        formik.setValues({
          ...pick(user, ['firstname', 'lastname', 'email', 'isActive']),
          companyId: user?.companyId || '',
          userRole: user.userRole?.id || '',
        });
      });
    } else if (!isEditEnable && !isProfilePage) {
      goBack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditEnable, isProfilePage, match?.params?.id]);

  useEffect(() => {
    if (isProfilePage) {
      setCurrentUser(me);
      formik.setValues({
        ...pick(me, ['firstname', 'lastname', 'email', 'isActive']),
        companyId: me.companyId,
        userRole: me.userRole?.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfilePage]);

  const goBack = useCallback(() => {
    if (isEditEnable) {
      history.push('/users');
    } else {
      if (history.length > 0) {
        history.goBack();
      } else {
        history.push('/dashboard');
      }
    }
  }, [isEditEnable, history]);

  const handleDelete = () => {
    removeUser(match?.params.id).then(() => history.push('/users'));
  };

  const handleChangePassword = () => {
    requestChangePassword(currentUser.email);
  };

  const tempRoleOption = currentUser ? [currentUser?.userRole] : [];
  const tempCompanyOption = currentUser ? [currentUser?.company] : [];

  return (
    <Root className={classes.root}>
      <Box className={classes.title}>
        <Typography variant="title">{pageTitle}</Typography>
      </Box>
      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item xs={12} md={8} lg={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardBody}>
              <form onSubmit={formik.handleSubmit}>
                <Box className={classes.wrapper}>
                  <Typography component="p">First name</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Enter first name"
                    disabled={!isEditEnable}
                    {...formik.getFieldProps('firstname')}
                    error={formik.touched.firstname && formik.errors.firstname}
                    loading={loading}
                  />
                </Box>
                <Box className={classes.wrapper}>
                  <Typography component="h2">Last name</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Enter last name"
                    disabled={!isEditEnable}
                    {...formik.getFieldProps('lastname')}
                    error={formik.touched.lastname && formik.errors.lastname}
                    loading={loading}
                  />
                </Box>
                <Box className={classes.wrapper}>
                  <Typography component="p">Email</Typography>
                  <CommonTextField
                    className={classes.input}
                    placeholder="Enter email"
                    disabled={!isEditEnable}
                    {...formik.getFieldProps('email')}
                    error={formik.touched.email && formik.errors.email}
                    loading={loading}
                  />
                  {(isEditEnable || isProfilePage) && (
                    <Box className={classes.changePassword}>
                      <span onClick={() => handleChangePassword()}>Send change password email</span>
                    </Box>
                  )}
                </Box>
                {selectedRole !== SUPER_ADMIN && (
                  <Box className={classes.wrapper}>
                    <Typography component="p">Company</Typography>
                    <CommonSelect
                      className={classes.input}
                      options={isEditEnable ? (companies?.length > 0 ? companies : tempCompanyOption) : tempCompanyOption}
                      optionLabel="name"
                      optionValue="id"
                      {...formik.getFieldProps('companyId')}
                      disabled={!isEditEnable || me.userRole?.role !== SUPER_ADMIN}
                    />
                  </Box>
                )}
                <Box className={classes.wrapper}>
                  <Typography component="p">Role</Typography>
                  <CommonSelect
                    className={classes.input}
                    options={visibleRoles}
                    optionLabel="role"
                    optionValue="id"
                    disabled={!isEditEnable || isProfilePage}
                    {...formik.getFieldProps('userRole')}
                  />
                </Box>
                {isEditEnable && (
                  <Box className={classes.checkWrapper}>
                    <Typography component="p" className={classes.label}>Active</Typography>
                    <Checkbox checked={formik.getFieldProps('isActive').value} {...formik.getFieldProps('isActive')} />
                  </Box>
                )}
                <Box className={classes.action}>
                  <CommonButton
                    variant="normal"
                    onClick={() => goBack()}
                  >
                    Back
                  </CommonButton>
                  {isEditEnable && (
                    <>
                      {(match?.params?.id && match.params.id !== 'create') && !isProfilePage && (
                        <CommonButton color="secondary" onClick={handleDelete}>Delete</CommonButton>
                      )}
                      <CommonButton type="submit">Save</CommonButton>
                    </>
                  )}
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Root>
  );
};

export default UserDetail;
