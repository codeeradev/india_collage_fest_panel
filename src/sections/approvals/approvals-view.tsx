import type { IApproval } from 'src/types/approval';

import DataTable from 'react-data-table-component';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function ApprovalsView() {
  const [approvals, setApprovals] = useState<IApproval[]>([]);
  const [loading, setLoading] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  // reject modal states
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<IApproval | null>(null);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

  // ===============================
  // LOAD APPROVALS
  // ===============================
  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);

      const res = await get(`${ENDPOINTS.GET_APPROVALS_REQUEST}?organiser=true`, {
        authRequired: true,
      });

      setApprovals(res.data.organiserRequests || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  // ===============================
  // APPROVE
  // ===============================
  const approveRequest = async (approvalId: string) => {
    try {
      setProcessingId(approvalId);

      await post(
        ENDPOINTS.APPROVAL_ACTION,
        {
          approvalId,
          action: 'approved',
        },
        { authRequired: true }
      );

      setApprovals((prev) => prev.filter((item) => item._id !== approvalId));
    } finally {
      setProcessingId(null);
    }
  };

  // ===============================
  // OPEN REJECT MODAL
  // ===============================
  const openRejectModal = (row: IApproval) => {
    setSelectedApproval(row);
    setRejectReason('');
    setOpenReject(true);
  };

  // ===============================
  // SUBMIT REJECT
  // ===============================
  const submitReject = async () => {
    if (!selectedApproval) return;

    try {
      setProcessingId(selectedApproval._id);

      await post(
        ENDPOINTS.APPROVAL_ACTION,
        {
          approvalId: selectedApproval._id,
          action: 'rejected',
          reason: rejectReason,
        },
        { authRequired: true }
      );

      setApprovals((prev) => prev.filter((item) => item._id !== selectedApproval._id));

      setOpenReject(false);
      setSelectedApproval(null);
      setRejectReason('');
    } finally {
      setProcessingId(null);
    }
  };

  // ===============================
  // TABLE COLUMNS
  // ===============================
  const columns = [
    {
      name: 'User',
      cell: (row: IApproval) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={row.user_id?.image ? `${IMAGE_BASE_URL}${row.user_id?.image}` : ''}
            sx={{ width: 36, height: 36 }}
          />
          {row.user_id?.name}
        </Box>
      ),
    },
    {
      name: 'Email',
      selector: (row: IApproval) => row.user_id?.email,
    },
    {
      name: 'Phone',
      selector: (row: IApproval) => row.user_id?.phone,
    },
    {
      name: 'Type',
      selector: (row: IApproval) => row.type,
      width: '120px',
    },
    {
      name: 'Status',
      cell: (row: IApproval) => (
        <Chip
          label={row.status}
          size="small"
          color={
            row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'error' : 'warning'
          }
        />
      ),
    },
    {
      name: 'Requested At',
      selector: (row: IApproval) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      name: 'Action',
      width: '200px',
      cell: (row: IApproval) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            color="success"
            variant="contained"
            disabled={processingId === row._id}
            onClick={() => approveRequest(row._id)}
          >
            Approve
          </Button>

          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={processingId === row._id}
            onClick={() => openRejectModal(row)}
          >
            Reject
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <DashboardContent>
      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Organiser Approval Requests</Typography>
      </Box>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={approvals}
        progressPending={loading}
        pagination
        highlightOnHover
        responsive
      />

      {/* ===========================
            REJECT MODAL
          =========================== */}
      <Dialog open={openReject} onClose={() => setOpenReject(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Organizer</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reject reason"
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenReject(false)}>Cancel</Button>

          <Button
            variant="contained"
            color="error"
            disabled={!rejectReason.trim()}
            onClick={submitReject}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
