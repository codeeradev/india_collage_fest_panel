import DataTable from 'react-data-table-component';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { get } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { BlogAddModal } from '../blog-add-modal';

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

export function BlogView() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get(ENDPOINTS.ADMIN_GET_BLOGS, { authRequired: true });
      setBlogs(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const filteredBlogs = useMemo(
    () =>
      blogs.filter((b) => {
        const matchesSearch = String(b.title || '')
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus =
          status === 'all' ||
          (status === 'published' && b.isPublished) ||
          (status === 'draft' && !b.isPublished);
        return matchesSearch && matchesStatus;
      }),
    [blogs, search, status]
  );

  const columns = [
    {
      name: 'Title',
      selector: (row: any) => row.title,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Slug',
      selector: (row: any) => row.slug,
      sortable: true,
      grow: 2,
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <Chip size="small" label={row.isPublished ? 'Published' : 'Draft'} color={row.isPublished ? 'success' : 'default'} />
      ),
    },
    {
      name: 'Published',
      selector: (row: any) => formatDate(row.publishedAt || row.createdAt),
    },
    {
      name: 'Action',
      cell: (row: any) => (
        <Button size="small" onClick={() => { setSelectedBlog(row); setOpenAdd(true); }}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <DashboardContent>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Blogs
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => { setSelectedBlog(null); setOpenAdd(true); }}
        >
          New Blog
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <TextField
          size="small"
          placeholder="Search blog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 280 }}
        />

        <TextField
          size="small"
          select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          sx={{ width: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="published">Published</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
        </TextField>
      </Box>

      <DataTable
        columns={columns as any}
        data={filteredBlogs}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      <BlogAddModal
        open={openAdd}
        blog={selectedBlog}
        onClose={() => { setOpenAdd(false); setSelectedBlog(null); }}
        onSuccess={(_message) => {
          loadBlogs();
        }}
      />
    </DashboardContent>
  );
}
