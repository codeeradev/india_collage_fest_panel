import type { MOU } from 'src/types/mou';

import DataTable from 'react-data-table-component';

import { Chip, Button, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// --------------------------------------------------
// STATIC FALLBACK DATA
// --------------------------------------------------

const STATIC_MOU_DATA: MOU[] = [
  {
    _id: '1',
    mouNumber: 'MOU-2026-001',
    organization: {
      name: 'CodeEra Technologies',
      email: 'codeera@gmail.com',
    },
    status: 'signed',
    pdfUrl: '/dummy/mou.pdf',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    mouNumber: 'MOU-2026-002',
    organization: {
      name: 'EventX Pvt Ltd',
      email: 'eventx@gmail.com',
    },
    status: 'otp_sent',
    pdfUrl: '/dummy/mou.pdf',
    createdAt: new Date().toISOString(),
  },
];

// --------------------------------------------------

export default function MOUTable({
  rows,
  onReload,
}: {
  rows: MOU[];
  onReload: () => void;
}) {
  // ✅ REAL DATA CHECK (IMPORTANT)
  const tableData =
    rows?.some((r) => r?.mouNumber) ? rows : STATIC_MOU_DATA;

  const columns = [
    {
      name: 'MOU No',
      selector: (r: MOU) => r.mouNumber || '-',
      sortable: true,
    },
    {
      name: 'Organization',
      selector: (r: MOU) => r.organization?.name || '-',
    },
    {
      name: 'Status',
      cell: (r: MOU) =>
        r.status ? (
          <Chip
            label={r.status}
            size="small"
            color={
              r.status === 'signed'
                ? 'success'
                : r.status === 'otp_sent'
                ? 'warning'
                : 'default'
            }
          />
        ) : (
          '-'
        ),
    },
    {
      name: 'Action',
      cell: (row: MOU) => (
        <>
          <IconButton>
            <Iconify icon="solar:eye-bold" />
          </IconButton>

          {row.status !== 'signed' && (
            <Button
              size="small"
              variant="contained"
              sx={{ ml: 1 }}
            >
              Sign
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tableData}
      pagination
      highlightOnHover
      responsive
      noDataComponent="No MOU records found"
    />
  );
}
