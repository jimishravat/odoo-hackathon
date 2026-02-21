/**
 * Register Page
 * User registration with form validation and mock data integration
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';
import { ROUTES, USER_ROLES } from '../constants';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError } = useAuth();
  const { showNotification } = useApp();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: USER_ROLES.DRIVER, // Default role
    phone: '',
    licenseNumber: '', // Only for drivers
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // List of available roles for registration
  const availableRoles = [
    { value: USER_ROLES.DRIVER, label: 'Driver' },
    { value: USER_ROLES.OPERATIONS_OFFICER, label: 'Operations Officer' },
    { value: USER_ROLES.MAINTENANCE_OFFICER, label: 'Maintenance Officer' },
  ];

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

    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Role validation
    if (!formData.role) {
      errors.role = 'Please select a role';
    }

    // License number validation (for drivers)
    if (formData.role === USER_ROLES.DRIVER) {
      if (!formData.licenseNumber.trim()) {
        errors.licenseNumber = 'License number is required for drivers';
      } else if (formData.licenseNumber.trim().length < 5) {
        errors.licenseNumber = 'Please enter a valid license number';
      }
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
      };

      // Add license number only for drivers
      if (formData.role === USER_ROLES.DRIVER) {
        registrationData.licenseNumber = formData.licenseNumber.trim();
      }

      await register(registrationData);

      // Show success message
      setSuccessMessage('Registration successful! Redirecting to dashboard...');
      showNotification('Registration successful!', 'success');

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      showNotification(errorMessage, 'error');
      setValidationErrors({ form: errorMessage });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
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
              Create Your Account
            </Typography>
          </Box>

          {/* Success Alert */}
          {successMessage && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              icon={<CheckCircleIcon />}
            >
              {successMessage}
            </Alert>
          )}

          {/* Error Alert */}
          {authError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authError}
            </Alert>
          )}

          {/* Form Validation Error */}
          {validationErrors.form && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {validationErrors.form}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Name Fields Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={Boolean(validationErrors.firstName)}
                helperText={validationErrors.firstName}
                margin="normal"
                placeholder="John"
                autoComplete="given-name"
              />

              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={Boolean(validationErrors.lastName)}
                helperText={validationErrors.lastName}
                margin="normal"
                placeholder="Doe"
                autoComplete="family-name"
              />
            </Box>

            {/* Email Field */}
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
              placeholder="john.doe@example.com"
              autoComplete="email"
            />

            {/* Phone Field */}
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={Boolean(validationErrors.phone)}
              helperText={validationErrors.phone}
              margin="normal"
              placeholder="9876543210"
              autoComplete="tel"
            />

            {/* Role Selection */}
            <FormControl
              fullWidth
              margin="normal"
              error={Boolean(validationErrors.role)}
            >
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Role"
              >
                {availableRoles.map((roleOption) => (
                  <MenuItem key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </MenuItem>
                ))}
              </Select>
              {validationErrors.role && (
                <Typography
                  sx={{
                    color: '#d32f2f',
                    fontSize: '0.75rem',
                    mt: 0.5,
                    ml: 1.75,
                  }}
                >
                  {validationErrors.role}
                </Typography>
              )}
            </FormControl>

            {/* License Number Field - Only for Drivers */}
            {formData.role === USER_ROLES.DRIVER && (
              <TextField
                fullWidth
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                error={Boolean(validationErrors.licenseNumber)}
                helperText={validationErrors.licenseNumber}
                margin="normal"
                placeholder="DL123456789"
                autoComplete="off"
              />
            )}

            {/* Password Field */}
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={Boolean(validationErrors.confirmPassword)}
              helperText={validationErrors.confirmPassword}
              margin="normal"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Password Requirements Info */}
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 600 }}>
                Password Requirements:
              </Typography>
              <Typography variant="caption" display="block">
                ✓ At least 6 characters
              </Typography>
              <Typography variant="caption" display="block">
                ✓ Contains uppercase letters (A-Z)
              </Typography>
              <Typography variant="caption" display="block">
                ✓ Contains lowercase letters (a-z)
              </Typography>
              <Typography variant="caption" display="block">
                ✓ Contains numbers (0-9)
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Account'}
            </Button>
          </Box>

          {/* Footer - Link to Login */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link
                href={ROUTES.LOGIN}
                sx={{ cursor: 'pointer', fontWeight: 600, color: '#2196F3' }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>

          {/* Demo Info Box */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="caption" display="block" sx={{ mb: 1, fontWeight: 600, color: '#1976D2' }}>
              Demo Mode:
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: '#1565c0' }}>
              You can register with any details. New users will be created in mock data.
            </Typography>
            <Typography variant="caption" display="block" sx={{ color: '#1565c0' }}>
              After registration, you'll be logged in and taken to the dashboard.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
