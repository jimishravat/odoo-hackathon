/**
 * Main App Component
 * Sets up providers and routing
 */

import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import theme from './styles/theme';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import AppRoutes from './routes/AppRoutes';
import { initializeStorage } from './utils/storageManager';
import initialData from './data/initialData.json';

function App() {
  // Initialize localStorage on app load
  useEffect(() => {
    initializeStorage(initialData);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
