import type { MOU } from 'src/types/mou';

import { useEffect, useState } from 'react';

import { get } from 'src/api/apiClient';
import { ENDPOINTS } from 'src/api/endpoint';

import MOUTable from './mou-table';

export default function MOUView() {
  const [rows, setRows] = useState<MOU[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await get(ENDPOINTS.GET_CITY);
    setRows(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <MOUTable
      rows={rows}
      onReload={load}
    />
  );
}
