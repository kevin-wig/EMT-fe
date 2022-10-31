import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';
import { Redirect } from 'react-router';

import { useAuth } from '../context/auth.context';

const PrivateRoute = ({
  layout: L, component: C, user, props: cProps, path, role = [], ...rest
}) => {
  const { me, isAuthorized } = useAuth();
  const authorized = !!me && isAuthorized;

  return (
    <Route
      {...rest}
      render={(props) => (authorized ? (
        <>
          {
            role.length === 0 || role.includes(me.userRole.role) ?
              <L>
                <C {...props} {...cProps} match={rest.computedMatch}/>
              </L>
            :
              <Redirect to="/forbidden" />
          }
        </>
        
      ) : (
        <Redirect to="/auth/login" />
      ))}
    />
  );
};

PrivateRoute.propTypes = {
  layout: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
  user: PropTypes.object,
  path: PropTypes.string,
  props: PropTypes.object,
};

PrivateRoute.defaultProps = {
  user: null,
  path: '',
  props: {},
};

export default PrivateRoute;
