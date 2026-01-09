import DataTable from 'react-data-table-component';
import { useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { CityAddModal } from '../city-add-modal';

// ----------------------------------------------------------------------

export function CityView() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [alert, setAlert] = useState<string | null>(null);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  // ===============================
  // LOAD CITIES
  // ===============================
  const loadCities = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get(ENDPOINTS.GET_CITY, { authRequired: true });
      setCities(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  // ===============================
  // STATUS TOGGLE (FIXED METHOD + LOADER)
  // ===============================
  const toggleStatus = async (row: any) => {
    if (statusLoadingId) return;

    try {
      setStatusLoadingId(row._id);

      const res = await post(
        ENDPOINTS.EDIT_CITY(row._id),
        { is_active: !row.is_active },
        { authRequired: true }
      );

      setAlert(res.data.message || 'Status updated');
      loadCities();
    } finally {
      setStatusLoadingId(null);
    }
  };

  // ===============================
  // SEARCH + FILTER
  // ===============================
  const filteredCities = useMemo(
    () =>
      cities.filter((c) => {
        const matchSearch = c.city
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchStatus =
          status === 'all' ||
          (status === 'active' && c.is_active) ||
          (status === 'inactive' && !c.is_active);

        return matchSearch && matchStatus;
      }),
    [cities, search, status]
  );

  // ===============================
  // TABLE COLUMNS
  // ===============================
  const columns = [
    {
      name: 'City',
      selector: (row: any) => row.city,
      sortable: true,
    },
    {
      name: 'Latitude',
      selector: (row: any) => row.latitude,
    },
    {
      name: 'Longitude',
      selector: (row: any) => row.longitude,
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <Chip
          clickable
          size="small"
          label={
            statusLoadingId === row._id
              ? 'Updating...'
              : row.is_active
              ? 'Active'
              : 'Inactive'
          }
          color={row.is_active ? 'success' : 'default'}
          onClick={() => toggleStatus(row)}
        />
      ),
    },
    {
      name: 'Action',
      cell: (row: any) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedCity(row);
            setOpenAdd(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <DashboardContent>
      {/* HEADER */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Cities
        </Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenAdd(true)}
        >
          New City
        </Button>
      </Box>

      {/* SEARCH + FILTER BAR */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <TextField
          size="small"
          placeholder="Search city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 260 }}
        />

        <TextField
          size="small"
          select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          sx={{ width: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={filteredCities}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      {/* ADD / EDIT MODAL */}
      <CityAddModal
        open={openAdd}
        city={selectedCity}
        onClose={() => {
          setOpenAdd(false);
          setSelectedCity(null);
        }}
        onSuccess={(msg: string) => {
          setAlert(msg);
          loadCities();
        }}
      />

      {/* ALERT */}
      <Snackbar
        open={!!alert}
        autoHideDuration={3000}
        onClose={() => setAlert(null)}
      >
        <Alert severity="success" onClose={() => setAlert(null)}>
          {alert}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
