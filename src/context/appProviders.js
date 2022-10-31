import React from 'react';

import { AuthProvider } from './auth.context';
import { CompanyProvider } from './company.context';
import { UserProvider } from './user.context';
import { NotifyProvider } from './snack.context';
import { FleetProvider } from './fleet.context';
import { VesselProvider } from './vessel.context';

function AppProviders({ children }) {
  return (
    <NotifyProvider>
      <UserProvider>
        <CompanyProvider>
          <FleetProvider>
            <VesselProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </VesselProvider>
          </FleetProvider>
        </CompanyProvider>
      </UserProvider>
    </NotifyProvider>
  );
}

export default AppProviders;
