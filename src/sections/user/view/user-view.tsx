import DataTable from 'react-data-table-component';
import { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Card,
  Stack,
  Button,
  Dialog,
  Checkbox,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';
import { DashboardContent } from 'src/layouts/dashboard';

import { useAlert } from 'src/components/alerts/AlertProvider';

import { getUsersApi } from '../user-api';
import { ROLE_LABEL, userColumns, type UserRow } from '../user-table-columns';

const roles = [
  { label: 'All Users', value: 0 },
  { label: 'Super Admin', value: 1 },
  { label: 'Organization', value: 2 },
  { label: 'Event Organizer', value: 3 },
  { label: 'Student', value: 4 },
];

const PERMISSIONS = ['EDIT_EVENTS', 'POSTER_UPLOAD', 'VIEW_ANALYTICS'];

type EditFormState = {
  name: string;
  email: string;
  phone: string;
  status: boolean;
  eventUploadLimit: string;
  socialUploadLimit: string;
  permissions: Record<string, boolean>;
};

const DEFAULT_EDIT_FORM: EditFormState = {
  name: '',
  email: '',
  phone: '',
  status: true,
  eventUploadLimit: '0',
  socialUploadLimit: '0',
  permissions: {},
};

export function UserView() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roleId, setRoleId] = useState<number | 0>(0);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>(DEFAULT_EDIT_FORM);

  const { setAlert } = useAlert();

  const fetchUsers = useCallback(
    async (role?: number) => {
      try {
        setLoading(true);
        setAlert('loading', 'Loading users...');

        const data = await getUsersApi(role);
        setUsers(data);

        setAlert('success', 'Users loaded successfully');
      } catch {
        setAlert('error', 'Failed to load users');
      } finally {
        setLoading(false);
      }
    },
    [setAlert]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = (value: number) => {
    setRoleId(value);
    fetchUsers(value === 0 ? undefined : value);
  };

  const openEditModal = (user: UserRow) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone != null ? String(user.phone) : '',
      status: Boolean(user.status),
      eventUploadLimit: String(user.eventUploadLimit ?? 0),
      socialUploadLimit: String(user.socialUploadLimit ?? 0),
      permissions: user.permissions || {},
    });
    setOpenEdit(true);
  };

  const closeEditModal = () => {
    setOpenEdit(false);
    setSelectedUser(null);
    setEditForm(DEFAULT_EDIT_FORM);
  };

  const togglePermission = (key: string) => {
    setEditForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const saveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      setSaving(true);

      const payload: Record<string, any> = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        status: editForm.status,
      };

      if (selectedUser.roleId === 3) {
        payload.permissions = editForm.permissions;
        payload.eventUploadLimit = Math.max(
          0,
          Math.floor(Number(editForm.eventUploadLimit) || 0)
        );
        payload.socialUploadLimit = Math.max(
          0,
          Math.floor(Number(editForm.socialUploadLimit) || 0)
        );
      }

      await post(ENDPOINTS.ADMIN_EDIT_USER(selectedUser._id), payload, {
        authRequired: true,
      });

      setAlert('success', 'User updated successfully');
      closeEditModal();
      fetchUsers(roleId === 0 ? undefined : roleId);
    } catch (error: any) {
      setAlert('error', error?.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    ...userColumns,
    {
      name: 'Action',
      width: '120px',
      cell: (row: UserRow) => (
        <Button
          size="small"
          variant="outlined"
          disabled={row.roleId === 1}
          onClick={() => openEditModal(row)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Users
        </Typography>

        <TextField
          select
          size="small"
          value={roleId}
          sx={{ width: 220 }}
          onChange={(e) => handleRoleChange(Number(e.target.value))}
        >
          {roles.map((role) => (
            <MenuItem key={role.label} value={role.value}>
              {role.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Card>
        <DataTable
          columns={columns}
          data={users}
          progressPending={loading}
          pagination
          highlightOnHover
          responsive
          persistTableHead
        />
      </Card>

      <Dialog open={openEdit} onClose={closeEditModal} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit User {selectedUser ? `- ${ROLE_LABEL[selectedUser.roleId] ?? 'User'}` : ''}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              fullWidth
            />

            <TextField
              select
              label="Status"
              value={editForm.status ? 'active' : 'inactive'}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  status: e.target.value === 'active',
                }))
              }
              fullWidth
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            {selectedUser?.roleId === 3 && (
              <>
                <Typography variant="subtitle2">Permissions</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  {PERMISSIONS.map((perm) => (
                    <FormControlLabel
                      key={perm}
                      control={
                        <Checkbox
                          checked={Boolean(editForm.permissions[perm])}
                          onChange={() => togglePermission(perm)}
                        />
                      }
                      label={perm.replace(/_/g, ' ')}
                    />
                  ))}
                </Box>

                <TextField
                  type="number"
                  label="Event Upload Limit"
                  value={editForm.eventUploadLimit}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      eventUploadLimit: e.target.value,
                    }))
                  }
                  inputProps={{ min: 0 }}
                  helperText="0 means unlimited"
                  fullWidth
                />

                <TextField
                  type="number"
                  label="Social Upload Limit"
                  value={editForm.socialUploadLimit}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      socialUploadLimit: e.target.value,
                    }))
                  }
                  inputProps={{ min: 0 }}
                  helperText="0 means unlimited"
                  fullWidth
                />
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeEditModal}>Cancel</Button>
          <Button variant="contained" onClick={saveUserChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
