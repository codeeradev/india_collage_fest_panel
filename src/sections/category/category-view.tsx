import type { ICategory } from 'src/types/category';

import DataTable from 'react-data-table-component';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
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
  const [activeSubCategory, setActiveSubCategory] = useState<any | null>(null);

  const [mode, setMode] = useState<'category' | 'subcategory'>('category');
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [openSubAdd, setOpenSubAdd] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const imageBaseUrl = import.meta.env.VITE_IMAGE_URL;

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await get(ENDPOINTS.GET_CATEGORY, { authRequired: true });
      setCategories(res.data.category || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubCategories = async (category: ICategory) => {
    try {
      setLoading(true);

      setActiveCategory(category);
      setSelectedCategoryId(category._id);

      const res = await get(ENDPOINTS.GET_SUBCATEGORY_BY_CATEGORY(category._id), {
        authRequired: true,
      });

      setSubCategories(res.data.subCategories || []);
      setMode('subcategory');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDropdown = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    const category = categories.find((item) => item._id === categoryId);
    if (!category) return;

    setActiveCategory(category);
    setLoading(true);

    const res = await get(ENDPOINTS.GET_SUBCATEGORY_BY_CATEGORY(categoryId), {
      authRequired: true,
    });

    setSubCategories(res.data.subCategories || []);
    setMode('subcategory');
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categoryColumns = [
    {
      name: 'Icon',
      width: '80px',
      cell: (row: ICategory) => (
        <Avatar
          src={row.icon ? `${imageBaseUrl}${row.icon}` : ''}
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
        <Button size="small" variant="outlined" onClick={() => loadSubCategories(row)}>
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
    {
      name: 'Actions',
      width: '120px',
      cell: (row: ICategory) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setActiveCategory(row);
            setOpenAdd(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const subCategoryColumns = [
    {
      name: 'Icon',
      width: '80px',
      cell: (row: any) => (
        <Avatar
          src={row.icon ? `${imageBaseUrl}${row.icon}` : ''}
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
    {
      name: 'Actions',
      width: '120px',
      cell: (row: any) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setActiveSubCategory(row);
            setOpenSubAdd(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <DashboardContent>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {mode === 'category' ? 'Categories' : `Sub Categories of ${activeCategory?.name}`}
        </Typography>

        {mode === 'category' && (
          <TextField
            select
            size="small"
            label="View Sub Categories"
            sx={{ width: 260 }}
            value={selectedCategoryId}
            onChange={(event) => handleCategoryDropdown(event.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
        )}

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
            onClick={() => {
              setActiveCategory(null);
              setOpenAdd(true);
            }}
          >
            New Category
          </Button>
        )}
      </Box>

      {mode === 'subcategory' && (
        <Button
          sx={{ mb: 2 }}
          variant="outlined"
          onClick={() => {
            setMode('category');
            setSubCategories([]);
            setActiveCategory(null);
            setSelectedCategoryId('');
          }}
        >
          Back to Categories
        </Button>
      )}

      <DataTable
        columns={mode === 'category' ? categoryColumns : subCategoryColumns}
        data={mode === 'category' ? categories : subCategories}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      <CategoryAddModal
        open={openAdd}
        category={activeCategory}
        onClose={() => {
          setOpenAdd(false);
          setActiveCategory(null);
        }}
        onSuccess={loadCategories}
      />

      <SubCategoryAddModal
        open={openSubAdd}
        category={activeCategory}
        subCategory={activeSubCategory}
        onClose={() => {
          setOpenSubAdd(false);
          setActiveSubCategory(null);
        }}
        onSuccess={() => {
          if (activeCategory) loadSubCategories(activeCategory);
        }}
      />
    </DashboardContent>
  );
}
