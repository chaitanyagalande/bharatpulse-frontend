import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { profileAPI } from "../services/api";
import type { CityRequest, PasswordUpdateRequest, UsernameUpdateRequest } from "../types";
import { Alert, Box, Button, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Paper, Switch, TextField, Typography } from "@mui/material";

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [cityForm, setCityForm] = useState({ city: user?.city || '' });
  const [usernameForm, setUsernameForm] = useState({ newUsername: user?.username || '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState({
    city: false,
    username: false,
    password: false,
    mode: false,
    delete: false,
  });

  const handleCityUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, city: true });
    setError('');
    setMessage('');

    try {
      await profileAPI.updateCity(cityForm as CityRequest);
      setMessage('City updated successfully!');
      if (user) {
        updateUser({ ...user, city: cityForm.city });
      }
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update city');
    } finally {
      setLoading({ ...loading, city: false });
    }
  };

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, username: true });
    setError('');
    setMessage('');

    try {
      await profileAPI.updateUsername(usernameForm as UsernameUpdateRequest);
      setMessage('Username updated successfully!');
      if (user) {
        updateUser({ ...user, username: usernameForm.newUsername });
      }
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update username');
    } finally {
      setLoading({ ...loading, username: false });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ ...loading, password: true });
    setError('');
    setMessage('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading({ ...loading, password: false });
      return;
    }

    try {
      const passwordData: PasswordUpdateRequest = {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      };
      await profileAPI.updatePassword(passwordData);
      setMessage('Password updated successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data || 'Failed to update password');
    } finally {
      setLoading({ ...loading, password: false });
    }
  };

  const handleModeToggle = async () => {
    if (!user) return;
    
    setLoading({ ...loading, mode: true });
    try {
      const newMode = await profileAPI.toggleMode();
      updateUser({ ...user, mode: newMode });
      setMessage(`Mode changed to ${newMode}`);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to toggle mode');
    } finally {
      setLoading({ ...loading, mode: false });
    }
  };

  const handleDeleteAccount = async () => {
    setLoading({ ...loading, delete: true });
    try {
      await profileAPI.deleteAccount();
      logout();
    } catch (err: any) {
      setError(err.response?.data || 'Failed to delete account');
      setLoading({ ...loading, delete: false });
      setDeleteDialogOpen(false);
    }
  };

  if (!user) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Profile Settings
        </Typography>

        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography><strong>Username:</strong> {user.username}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>City:</strong> {user.city}</Typography>
            <Typography><strong>Mode:</strong> {user.mode}</Typography>
          </Box>
        </Paper>

        {/* Mode Toggle */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            App Mode
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={user.mode === 'EXPLORE'}
                onChange={handleModeToggle}
                disabled={loading.mode}
              />
            }
            label={`Current mode: ${user.mode} (Switch to ${user.mode === 'LOCAL' ? 'EXPLORE' : 'LOCAL'})`}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            LOCAL: View polls from your city (results hidden until you vote) | EXPLORE: View polls from your city with results visible
          </Typography>
        </Paper>

        {/* Update City */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Update City
          </Typography>
          <Box component="form" onSubmit={handleCityUpdate}>
            <TextField
              fullWidth
              label="New City"
              value={cityForm.city}
              onChange={(e) => setCityForm({ city: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading.city}
            >
              {loading.city ? 'Updating...' : 'Update City'}
            </Button>
          </Box>
        </Paper>

        {/* Update Username */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Update Username
          </Typography>
          <Box component="form" onSubmit={handleUsernameUpdate}>
            <TextField
              fullWidth
              label="New Username"
              value={usernameForm.newUsername}
              onChange={(e) => setUsernameForm({ newUsername: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading.username}
            >
              {loading.username ? 'Updating...' : 'Update Username'}
            </Button>
          </Box>
        </Paper>

        {/* Update Password */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Update Password
          </Typography>
          <Box component="form" onSubmit={handlePasswordUpdate}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading.password}
            >
              {loading.password ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </Paper>

        {/* Delete Account */}
        <Paper sx={{ p: 3, border: '2px solid', borderColor: 'error.main' }}>
          <Typography variant="h6" gutterBottom color="error">
            Danger Zone
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete My Account
          </Button>
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete your account? This action cannot be undone.
              All your polls and votes will be permanently removed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAccount} 
              color="error"
              disabled={loading.delete}
            >
              {loading.delete ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Profile;

