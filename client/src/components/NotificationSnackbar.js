/**
 * Notification Snackbar Component
 */

import { Snackbar, Alert } from '@mui/material';
import { useApp } from '../hooks/useApp';

const NotificationSnackbar = () => {
  const { notification, hideNotification } = useApp();

  if (!notification) return null;

  return (
    <Snackbar
      open={Boolean(notification)}
      autoHideDuration={6000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={hideNotification}
        severity={notification.severity}
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
