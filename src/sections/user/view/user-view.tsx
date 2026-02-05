import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';

import { Box, Card, MenuItem, TextField, Typography } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { useAlert } from 'src/components/alerts/AlertProvider';

import { getUsersApi } from '../user-api';
import { userColumns, type UserRow } from '../user-table-columns';

const roles = [
  { label: 'All Users', value: 0 },
  { label: 'Super Admin', value: 1 },
  { label: 'Organization', value: 2 },
  { label: 'Event Organizer', value: 3 },
  { label: 'Student', value: 4 },
];

export function UserView() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleId, setRoleId] = useState<number | 0>(0);

  const { setAlert } = useAlert();

  const fetchUsers = async (role?: number) => {
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
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = (value: number) => {
    setRoleId(value);
    fetchUsers(value === 0 ? undefined : value);
  };

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

        {/* <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          New User
        </Button> */}
      </Box>

      <Card>
        <DataTable
          columns={userColumns}
          data={users}
          progressPending={loading}
          pagination
          highlightOnHover
          responsive
          persistTableHead
        />
      </Card>
    </DashboardContent>
  );
}
