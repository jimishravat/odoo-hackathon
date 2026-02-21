/**
 * Login Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';
import { ROUTES } from '../constants';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const { showNotification } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      showNotification('Login successful!', 'success');
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      showNotification(err.message || 'Login failed', 'error');
    }
  };

  // Test credentials for demo
  const testCredentials = [
    { email: 'admin@fleetflow.com', password: 'admin123', role: 'Admin' },
    { email: 'manager@fleetflow.com', password: 'manager123', role: 'Manager' },
    { email: 'driver@fleetflow.com', password: 'driver123', role: 'Driver' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                margin: '0 auto 1rem',
              }}
            >
              F
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              FleetFlow
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Fleet Management System
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(validationErrors.email)}
              helperText={validationErrors.email}
              margin="normal"
              placeholder="Enter your email"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={Boolean(validationErrors.password)}
              helperText={validationErrors.password}
              margin="normal"
              placeholder="Enter your password"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>

          {/* Demo Credentials Info */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 600 }}>
              Test Accounts:
            </Typography>
            {testCredentials.map((cred, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="caption" display="block" sx={{ fontWeight: 500 }}>
                  {cred.role}
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                  {cred.email}
                </Typography>
                <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
                  {cred.password}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account?{' '}
              <Link
                href={ROUTES.REGISTER}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              >
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
