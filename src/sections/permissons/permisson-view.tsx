import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';
import { DashboardContent } from 'src/layouts/dashboard';

type User = {
  _id: string;
  name: string;
  email: string;
  permissions?: Record<string, boolean>;
  eventUploadLimit?: number;
  socialUploadLimit?: number;
};

const PERMISSIONS = ['EDIT_EVENTS', 'POSTER_UPLOAD', 'VIEW_ANALYTICS'];

export default function OrganizerPermissionsView() {
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<User | null>(null);
  const [permissionState, setPermissionState] = useState<Record<string, boolean>>({});
  const [eventUploadLimit, setEventUploadLimit] = useState('0');
  const [socialUploadLimit, setSocialUploadLimit] = useState('0');

  const fetchOrganizers = async () => {
    const res = await get(ENDPOINTS.GET_USERS, {
      params: { roleId: 3 },
    });

    setUsers(res.data.users);
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const openEditor = (user: User) => {
    setSelected(user);
    setPermissionState(user.permissions || {});
    setEventUploadLimit(String(user.eventUploadLimit ?? 0));
    setSocialUploadLimit(String(user.socialUploadLimit ?? 0));
    setOpen(true);
  };

  const togglePermission = (key: string) => {
    setPermissionState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const savePermissions = async () => {
    if (!selected) return;
    const normalizedEventLimit = Math.max(0, Math.floor(Number(eventUploadLimit) || 0));
    const normalizedSocialLimit = Math.max(0, Math.floor(Number(socialUploadLimit) || 0));

    await post(
      `${ENDPOINTS.UPDATE_USER_PERMISSIONS}/${selected._id}`,
      {
        permissions: permissionState,
        eventUploadLimit: normalizedEventLimit,
        socialUploadLimit: normalizedSocialLimit,
      },
      { authRequired: true }
    );

    setOpen(false);
    fetchOrganizers();
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Organizer Permissions</Typography>
      </Box>

      {users.map((user) => (
        <Box
          key={user._id}
          sx={{
            p: 2,
            mb: 1,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography fontWeight={600}>{user.name}</Typography>
            <Typography variant="body2">{user.email}</Typography>
          </Box>

          <Button variant="outlined" onClick={() => openEditor(user)}>
            Edit Permissions
          </Button>
        </Box>
      ))}

      {/* Permission Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Permissions</DialogTitle>

        <DialogContent>
          {PERMISSIONS.map((perm) => (
            <FormControlLabel
              key={perm}
              control={
                <Checkbox
                  checked={!!permissionState[perm]}
                  onChange={() => togglePermission(perm)}
                />
              }
              label={perm.replace('_', ' ')}
            />
          ))}

          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Event Upload Limit"
            value={eventUploadLimit}
            onChange={(e) => setEventUploadLimit(e.target.value)}
            inputProps={{ min: 0 }}
            helperText="0 means unlimited"
          />

          <TextField
            fullWidth
            margin="normal"
            type="number"
            label="Social Upload Limit"
            value={socialUploadLimit}
            onChange={(e) => setSocialUploadLimit(e.target.value)}
            inputProps={{ min: 0 }}
            helperText="0 means unlimited"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={savePermissions}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
