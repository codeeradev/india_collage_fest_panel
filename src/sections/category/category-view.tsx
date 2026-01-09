import type { ICategory } from 'src/types/category';

import DataTable from 'react-data-table-component';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { get } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { CategoryAddModal } from './category-add-modal';
import { SubCategoryAddModal } from './subcategory-add-modal';

// ----------------------------------------------------------------------

export function CategoryView() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<ICategory | null>(null);

  const [mode, setMode] = useState<'category' | 'subcategory'>('category');
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [openSubAdd, setOpenSubAdd] = useState(false);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

  // ===============================
  // LOAD CATEGORIES
  // ===============================
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get(ENDPOINTS.GET_CATEGORY, { authRequired: true });
      setCategories(res.data.category || []);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===============================
  // LOAD SUB CATEGORIES
  // ===============================
  const loadSubCategories = async (category: ICategory) => {
    try {
      setLoading(true);
      setActiveCategory(category);

      const res = await get(
        ENDPOINTS.GET_SUBCATEGORY_BY_CATEGORY(category._id),
        { authRequired: true }
      );

      setSubCategories(res.data.subCategories || []);
      setMode('subcategory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ===============================
  // CATEGORY COLUMNS
  // ===============================
  const categoryColumns = [
    {
      name: 'Icon',
      width: '80px',
      cell: (row: ICategory) => (
        <Avatar
          src={row.icon ? `${IMAGE_BASE_URL}${row.icon}` : ''}
          variant="rounded"
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      name: 'Name',
      selector: (row: ICategory) => row.name,
      sortable: true,
    },
    {
      name: 'Sub Categories',
      cell: (row: ICategory) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => loadSubCategories(row)}
        >
          {row.subCategoryCount ?? 0}
        </Button>
      ),
    },
    {
      name: 'Status',
      cell: (row: ICategory) => (row.isActive ? 'Active' : 'Inactive'),
    },
    {
      name: 'Featured',
      cell: (row: ICategory) => (row.isFeatured ? 'Yes' : 'No'),
    },
  ];

  // ===============================
  // SUB CATEGORY COLUMNS
  // ===============================
  const subCategoryColumns = [
    {
      name: 'Icon',
      width: '80px',
      cell: (row: any) => (
        <Avatar
          src={row.icon ? `${IMAGE_BASE_URL}${row.icon}` : ''}
          variant="rounded"
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      name: 'Name',
      selector: (row: any) => row.name,
      sortable: true,
    },
    {
      name: 'Status',
      cell: (row: any) => (row.isActive ? 'Active' : 'Inactive'),
    },
    {
      name: 'Featured',
      cell: (row: any) => (row.isFeatured ? 'Yes' : 'No'),
    },
  ];

  return (
    <DashboardContent>
      {/* HEADER */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {mode === 'category'
            ? 'Categories'
            : `Sub Categories of ${activeCategory?.name}`}
        </Typography>

        {mode === 'subcategory' && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenSubAdd(true)}
          >
            New Sub Category
          </Button>
        )}

        {mode === 'category' && (
          <Button
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setOpenAdd(true)}
          >
            New Category
          </Button>
        )}
      </Box>

      {/* BACK BUTTON */}
      {mode === 'subcategory' && (
        <Button
          sx={{ mb: 2 }}
          variant="outlined"
          onClick={() => {
            setMode('category');
            setSubCategories([]);
            setActiveCategory(null);
          }}
        >
          Back to Categories
        </Button>
      )}

      {/* TABLE */}
      <DataTable
        columns={mode === 'category' ? categoryColumns : subCategoryColumns}
        data={mode === 'category' ? categories : subCategories}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      {/* MODALS */}
      <CategoryAddModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={loadCategories}
      />

      <SubCategoryAddModal
        open={openSubAdd}
        category={activeCategory}
        onClose={() => setOpenSubAdd(false)}
        onSuccess={() => loadSubCategories(activeCategory!)}
      />
    </DashboardContent>
  );
}
