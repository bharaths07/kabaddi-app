import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../routes';
import { AppProviders } from './AppProviders';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
};

export default App;
