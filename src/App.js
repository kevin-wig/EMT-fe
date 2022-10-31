import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';

import theme from './theme';
import Routes from './routes';
import AppProviders from "./context/appProviders";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AppProviders>
          <Routes />
        </AppProviders>
      </Router>
    </ThemeProvider>
  );
}

export default App;
