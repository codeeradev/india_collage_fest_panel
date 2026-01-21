import { useState, useEffect } from 'react';

import { Stack, MenuItem, TextField } from '@mui/material';

import { get } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

interface City {
  _id: string;
  city: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Props {
  search: string;
  city: string;
  category: string;
  onSearch: (v: string) => void;
  onCity: (v: string) => void;
  onCategory: (v: string) => void;
}

export default function EventToolbar({
  search,
  city,
  category,
  onSearch,
  onCity,
  onCategory,
}: Props) {
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    get(ENDPOINTS.GET_CITY).then((res) =>
      setCities(res.data.data || [])
    );

    get(ENDPOINTS.GET_CATEGORY).then((res) =>
      setCategories(res.data.category || [])
    );
  }, []);

  return (
    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
      {/* SEARCH */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search event"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />

      {/* CITY DROPDOWN */}
      <TextField
        select
        fullWidth
        size="small"
        label="City"
        value={city}
        onChange={(e) => onCity(e.target.value)}
      >
        <MenuItem value="">All Cities</MenuItem>
        {cities.map((c) => (
          <MenuItem key={c._id} value={c._id}>
            {c.city}
          </MenuItem>
        ))}
      </TextField>

      {/* CATEGORY DROPDOWN */}
      <TextField
        select
        fullWidth
        size="small"
        label="Category"
        value={category}
        onChange={(e) => onCategory(e.target.value)}
      >
        <MenuItem value="">All Categories</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c._id} value={c._id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
