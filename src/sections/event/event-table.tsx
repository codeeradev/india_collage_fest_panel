import DataTable from 'react-data-table-component';

import { Switch, IconButton } from '@mui/material';

import { post } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

import { Iconify } from 'src/components/iconify';

import type { Event } from '../../types/event';

interface Props {
  rows: Event[];
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  onReload: () => void;
  onEdit: (event: Event) => void;   
}

export default function EventTable({
  rows,
  page,
  total,
  onPageChange,
  onReload,
  onEdit,
}: Props) {
  const columns = [
    {
      name: 'Title',
      selector: (row: Event) => row.title,
      sortable: true,
    },
    {
      name: 'City',
      selector: (row: Event) => row.location?.city || '-',
    },
    {
      name: 'Category',
      selector: (row: Event) => row.category?.name || '-',
    },
    {
      name: 'Featured',
      cell: (row: Event) => (
        <Switch
          checked={row.isFeatured}
          onChange={async (e) => {
            await post(
              ENDPOINTS.EDIT_EVENT(row._id),
              { isFeatured: e.target.checked },
              { authRequired: true }
            );
            onReload();
          }}
        />
      ),
    },
{
  name: 'Action',
  cell: (row: Event) => (
    <IconButton onClick={() => onEdit(row)}>
      <Iconify icon="solar:pen-bold" />
    </IconButton>
  ),
}
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      pagination
      paginationServer
      paginationTotalRows={total}
      paginationPerPage={10}
      paginationDefaultPage={page}
      onChangePage={onPageChange}
      highlightOnHover
      responsive
    />
  );
}
