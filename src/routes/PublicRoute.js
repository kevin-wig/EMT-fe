import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { Redirect } from 'react-router';

import { useAuth } from '../context/auth.context';

const PublicRoute = ({
  layout: L, component: C, user, props: cProps, ...rest
}) => {
  const { me, isAuthorized } = useAuth();
  const authorized = !!me && isAuthorized;

  return (
    <Route
      {...rest}
      render={(props) => (!authorized ? (
        <L>
          <C {...props} {...cProps} match={rest.computedMatch} />
        </L>
      ) : (
        <Redirect to="/" />
      ))}
    />
  );
};

PublicRoute.propTypes = {
  layout: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  user: PropTypes.object,
  props: PropTypes.object,
};

PublicRoute.defaultProps = {
  user: null,
  props: {},
};

export default PublicRoute;
