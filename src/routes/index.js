import React, { useEffect } from 'react';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import asyncComponent from './AsyncComponent';
import { COMPANY_EDITOR, SUPER_ADMIN } from "../constants/UserRoles";
import Forbidden from "../components/Forbidden";
import { useAuth } from '../context/auth.context';
import { useHistory } from 'react-router';

const AuthLayout = asyncComponent(() => import("../components/Layout/AuthLayout"));
const Layout = asyncComponent(() => import("../components/Layout"));
const SignIn = asyncComponent(() => import("../containers/Auth/SignIn"));
const Companies = asyncComponent(() => import("../containers/Companies"));
const CompanyDetail = asyncComponent(() => import("../containers/Companies/CompanyDetail"));
const ComparisonReport = asyncComponent(() => import("../containers/ComparisonReport"));
const Fleet = asyncComponent(() => import("../containers/Fleet"));
const FleetDetail = asyncComponent(() => import("../containers/Fleet/FleetDetail"));
const Users = asyncComponent(() => import("../containers/Users"));
const UserDetail = asyncComponent(() => import("../containers/Users/UserDetail"));
const Vessels = asyncComponent(() => import("../containers/Vessels"));
const VesselDetail = asyncComponent(() => import("../containers/Vessels/VesselDetail"));
const Voyage = asyncComponent(() => import("../containers/Voyage"));
const Dashboard = asyncComponent(() => import("../containers/Dashboard"));
const CreateVessel = asyncComponent(() => import("../containers/Vessels/CreateVessel"));
const CreateFleet = asyncComponent(() => import("../containers/Fleet/CreateFleet"));
const ForgotPassword = asyncComponent(() => import("../containers/Auth/ForgotPassword"));
const ResetPassword = asyncComponent(() => import("../containers/Auth/ResetPassword"));
const VerifyEmail = asyncComponent(() => import("../containers/Auth/VerifyEmail"));
const VoyageDetail = asyncComponent(() => import("../containers/Voyage/VoyageDetail"));

const whitelist = [
  '/auth',
];

const Routes = () => {
  const { logout } = useAuth();
  const history = useHistory();
  const router = useLocation();
  let timeout = null;

  const logoutAction = () => {
     logout();
     history.push('/auth/login');
  };

  const restartAutoReset = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      logoutAction();
    }, 1000 * 3600);
  };

  const onMouseMove = () => {
    restartAutoReset();
  };

  useEffect(() => {
    // Whitelist routes
    let preventReset = false;
    for (const path of whitelist) {
      if (path.startsWith(router.pathname)) {
        preventReset = true;
      }
    }
    if (preventReset) {
      return;
    }

    // initiate timeout
    restartAutoReset();

    // listen for mouse events
    window.addEventListener('mousemove', onMouseMove);

    // cleanup mouse events and time out
    return () => {
      if (timeout) {
        clearTimeout(timeout);
        window.removeEventListener('mousemove', onMouseMove);
      }
    };
  }, [router.pathname]);

  return (
    <Switch>
      <Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />

      <PublicRoute
        path="/auth/login"
        component={SignIn}
        layout={AuthLayout}
      />

      <PublicRoute
        path="/auth/forgot-password"
        component={ForgotPassword}
        layout={AuthLayout}
      />

      <PublicRoute
        exact
        path="/auth/reset-password/:token"
        component={ResetPassword}
        layout={AuthLayout}
      />

      <PublicRoute
        path="/auth/verify/:token"
        component={VerifyEmail}
        layout={AuthLayout}
      />
    
      <PrivateRoute
        path="/forbidden"
        component={Forbidden}
        layout={AuthLayout}
      />

      <PrivateRoute
        path="/dashboard"
        component={Dashboard}
        layout={Layout}
      />

      <PrivateRoute
        path="/comparison-report"
        component={ComparisonReport}
        layout={Layout}
      />

      <PrivateRoute
        path="/vessels"
        exact
        component={Vessels}
        layout={Layout}
      />

      <PrivateRoute
        path="/vessels/create"
        exact
        component={CreateVessel}
        layout={Layout}
      />

      <PrivateRoute
        path="/vessels/:id"
        exact
        component={VesselDetail}
        layout={Layout}
      />

      <PrivateRoute
        path="/profile"
        component={UserDetail}
        layout={Layout}
      />

      <PrivateRoute
        path="/users"
        exact
        component={Users}
        layout={Layout}
        role={[SUPER_ADMIN, COMPANY_EDITOR]}
      />

      <PrivateRoute
        path="/users/create"
        exact
        component={UserDetail}
        layout={Layout}
        role={[SUPER_ADMIN]}
      />

      <PrivateRoute
        path="/users/:id"
        exact
        component={UserDetail}
        layout={Layout}
        role={[SUPER_ADMIN, COMPANY_EDITOR]}
      />

      <PrivateRoute
        path="/fleets"
        exact
        component={Fleet}
        layout={Layout}
      />

      <PrivateRoute
        path="/fleets/create"
        exact
        component={CreateFleet}
        layout={Layout}
      />

      <PrivateRoute
        path="/fleets/:id"
        exact
        component={FleetDetail}
        layout={Layout}
      />

      <PrivateRoute
        path="/companies"
        exact
        component={Companies}
        layout={Layout}
        role={[SUPER_ADMIN, COMPANY_EDITOR]}
      />

      <PrivateRoute
        path="/companies/create"
        exact
        component={CompanyDetail}
        layout={Layout}
        role={[SUPER_ADMIN]}
      />

      <PrivateRoute
        path="/companies/:id"
        exact
        component={CompanyDetail}
        layout={Layout}
        role={[SUPER_ADMIN, COMPANY_EDITOR]}
      />

      <PrivateRoute
        path="/voyage"
        exact
        component={Voyage}
        layout={Layout}
      />

      <PrivateRoute
        path="/voyage/create"
        exact
        component={VoyageDetail}
        layout={Layout}
      />

      <PrivateRoute
        path="/voyage/:id"
        exact
        component={VoyageDetail}
        layout={Layout}
      />
    </Switch>
  );
};

export default Routes;
