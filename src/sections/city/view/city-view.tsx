import DataTable from 'react-data-table-component';
import { useMemo, useState, useEffect, useCallback } from 'react';

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

type AlertState = {
  message: string;
  severity: 'success' | 'error';
};

export function CityView() {
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);
  const [csvUploading, setCsvUploading] = useState(false);

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

  const escapeCsv = (value: unknown) => {
    if (value == null) return '';
    const stringValue = String(value);
    if (/[",\n\r]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleDownloadCsvSample = () => {
    const headers = ['city', 'description', 'featured', 'latitude', 'longitude'];
    const rows = cities.map((city) => {
      const featured = city.featured ?? city.popular ?? '';
      return [
        city.city ?? '',
        city.description ?? '',
        featured === '' ? '' : Boolean(featured),
        city.latitude ?? '',
        city.longitude ?? '',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => escapeCsv(cell)).join(',')),
    ].join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cities_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const handleUploadCsv = async (file: File) => {
    if (!file) return;

    setCsvUploading(true);
    try {
      const formData = new FormData();
      formData.append('csv', file);

      const res = await post(ENDPOINTS.ADD_CITY_CSV, formData, {
        authRequired: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = res.data?.data;
      const summary =
        result && typeof result === 'object'
          ? `Created: ${result.createdCount ?? 0}, Existing: ${result.skippedExisting ?? 0}, Invalid: ${result.skippedInvalid ?? 0}, Duplicates: ${result.skippedDuplicateInFile ?? 0}`
          : '';

      setAlert({
        message: summary ? `${res.data.message}. ${summary}` : res.data.message || 'CSV uploaded',
        severity: 'success',
      });

      await loadCities();
    } catch (error: any) {
      setAlert({
        message: error?.response?.data?.message || 'Failed to upload CSV',
        severity: 'error',
      });
    } finally {
      setCsvUploading(false);
    }
  };

  const toggleStatus = async (row: any) => {
    if (statusLoadingId) return;

    try {
      setStatusLoadingId(row._id);

      const res = await post(
        ENDPOINTS.EDIT_CITY(row._id),
        { is_active: !row.is_active },
        { authRequired: true }
      );

      setAlert({
        message: res.data.message || 'Status updated',
        severity: 'success',
      });

      await loadCities();
    } finally {
      setStatusLoadingId(null);
    }
  };

  const filteredCities = useMemo(
    () =>
      cities.filter((city) => {
        const matchSearch = String(city.city ?? '')
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchStatus =
          status === 'all' ||
          (status === 'active' && city.is_active) ||
          (status === 'inactive' && !city.is_active);

        return matchSearch && matchStatus;
      }),
    [cities, search, status]
  );

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
      name: 'Featured',
      selector: (row: any) => (row.featured ?? row.popular ? 'Yes' : 'No'),
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Cities
        </Typography>

        <Button
          component="label"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-upward-fill" />}
          disabled={csvUploading}
        >
          Upload CSV
          <input
            hidden
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) handleUploadCsv(file);
            }}
          />
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
          onClick={handleDownloadCsvSample}
        >
          Download CSV Sample
        </Button>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setOpenAdd(true)}
        >
          New City
        </Button>
      </Box>

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
          onChange={(event) => setSearch(event.target.value)}
          sx={{ width: 260 }}
        />

        <TextField
          size="small"
          select
          value={status}
          onChange={(event) => setStatus(event.target.value as 'all' | 'active' | 'inactive')}
          sx={{ width: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </Box>

      <DataTable
        columns={columns}
        data={filteredCities}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      <CityAddModal
        open={openAdd}
        city={selectedCity}
        onClose={() => {
          setOpenAdd(false);
          setSelectedCity(null);
        }}
        onSuccess={(message: string) => {
          setAlert({ message, severity: 'success' });
          loadCities();
        }}
      />

      <Snackbar open={!!alert} autoHideDuration={3000} onClose={() => setAlert(null)}>
        <Alert
          severity={alert?.severity || 'success'}
          onClose={() => setAlert(null)}
        >
          {alert?.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
}
