import type { TableColumn } from 'react-data-table-component';

export interface UserRow {
  _id: string;
  name?: string;
  email?: string;
  phone?: number | string;
  roleId: number;
  status?: boolean;
  permissions?: Record<string, boolean>;
  eventUploadLimit?: number;
  socialUploadLimit?: number;
  mouSigned?: boolean;
  mouId?: string | null;
  createdAt?: string;
}

export const ROLE_LABEL: Record<number, string> = {
  1: 'Super Admin',
  2: 'Organization',
  3: 'Event Organizer',
  4: 'Student',
  5: 'Guest',
};

export const userColumns: TableColumn<UserRow>[] = [
  {
    name: 'Name',
    selector: row => row.name || '—',
    sortable: true,
  },

  {
    name: 'Email',
    selector: row => row.email || '—',
    wrap: true,
  },

  {
    name: 'Role',
    selector: row => ROLE_LABEL[row.roleId] ?? 'Unknown',
    sortable: true,
  },

  {
    name: 'Status',
    selector: row => (row.status ? 'Active' : 'Inactive'),
    sortable: true,
  },

  // ✅ MOU ONLY FOR ORGANISER
  {
    name: 'MOU',
    cell: row => {
      if (row.roleId !== 3) return '—';
      return row.mouSigned ? 'Signed' : 'Pending';
    },
  },

  {
    name: 'Created',
    selector: row =>
      row.createdAt
        ? new Date(row.createdAt).toLocaleDateString()
        : '—',
    sortable: true,
  },
];
