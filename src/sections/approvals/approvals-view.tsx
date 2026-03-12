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

  const [filterType, setFilterType] = useState<'organiser' | 'event'>('organiser');

  // reason modal (reject / resubmit)
  const [openReasonModal, setOpenReasonModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [reasonAction, setReasonAction] = useState<'rejected' | 'resubmitted'>('rejected');
  const [selectedApproval, setSelectedApproval] = useState<IApproval | null>(null);

  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

  // ===============================
  // LOAD APPROVALS
  // ===============================
  const loadApprovals = useCallback(async () => {
    try {
      setLoading(true);

      const query =
        filterType === 'organiser'
          ? `${ENDPOINTS.GET_APPROVALS_REQUEST}?organiser=true`
          : `${ENDPOINTS.GET_APPROVALS_REQUEST}?event=true`;

      const res = await get(query, { authRequired: true });

      setApprovals(
        filterType === 'organiser'
          ? res.data.organiserRequests || []
          : res.data.eventRequests || []
      );
    } finally {
      setLoading(false);
    }
  }, [filterType]);

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
          type: filterType === 'organiser' ? 'organizer' : 'event',
        },
        { authRequired: true }
      );

      setApprovals((prev) => prev.filter((item) => item._id !== approvalId));
    } finally {
      setProcessingId(null);
    }
  };

  // ===============================
  // OPEN REASON MODAL
  // ===============================
  const openReasonActionModal = (
    row: IApproval,
    action: 'rejected' | 'resubmitted'
  ) => {
    setSelectedApproval(row);
    setActionReason('');
    setReasonAction(action);
    setOpenReasonModal(true);
  };

  // ===============================
  // SUBMIT REASON ACTION
  // ===============================
  const submitReasonAction = async () => {
    if (!selectedApproval) return;

    try {
      setProcessingId(selectedApproval._id);

      await post(
        ENDPOINTS.APPROVAL_ACTION,
        {
          approvalId: selectedApproval._id,
          action: reasonAction,
          reason: actionReason,
          type: filterType === 'organiser' ? 'organizer' : 'event',
        },
        { authRequired: true }
      );

      setApprovals((prev) => prev.filter((item) => item._id !== selectedApproval._id));

      setOpenReasonModal(false);
      setSelectedApproval(null);
      setActionReason('');
      setReasonAction('rejected');
    } finally {
      setProcessingId(null);
    }
  };

  // ===============================
  // TABLE COLUMNS
  // ===============================
  const columns = [
    {
      name: 'User / Event',
      cell: (row: any) =>
        filterType === 'organiser' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={row.user_id?.image ? `${IMAGE_BASE_URL}${row.user_id?.image}` : ''}
              sx={{ width: 36, height: 36 }}
            />
            {row.user_id?.name}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <strong>{row.title}</strong>
            <span style={{ fontSize: 12, color: '#666' }}>
              {row.user_id?.name}
            </span>
          </Box>
        ),
    },
    {
      name: filterType === 'organiser' ? 'Email' : 'Category',
      selector: (row: any) =>
        filterType === 'organiser'
          ? row.user_id?.email
          : row.category?.name,
    },
    {
      name: 'Status',
      cell: () => (
        <Chip label="pending" size="small" color="warning" />
      ),
      width: '120px',
    },
    {
      name: 'Requested At',
      selector: (row: any) =>
        new Date(row.createdAt).toLocaleDateString(),
    },
    {
      name: 'Action',
      width: '300px',
      cell: (row: any) => (
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
            color="warning"
            variant="outlined"
            disabled={processingId === row._id}
            onClick={() => openReasonActionModal(row, 'resubmitted')}
          >
            Resubmit
          </Button>

          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={processingId === row._id}
            onClick={() => openReasonActionModal(row, 'rejected')}
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
        <Typography variant="h4">
          {filterType === 'organiser'
            ? 'Organiser Approval Requests'
            : 'Event Approval Requests'}
        </Typography>
      </Box>

      {/* FILTER */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          label="Request Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          SelectProps={{ native: true }}
          size="small"
        >
          <option value="organiser">Organisers</option>
          <option value="event">Events</option>
        </TextField>
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

      {/* REJECT / RESUBMIT MODAL */}
      <Dialog
        open={openReasonModal}
        onClose={() => setOpenReasonModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reasonAction === 'rejected' ? 'Reject' : 'Resubmit'}{' '}
          {filterType === 'organiser' ? 'Organizer' : 'Event'}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={reasonAction === 'rejected' ? 'Reject reason' : 'Resubmit reason'}
            placeholder={
              reasonAction === 'rejected'
                ? 'Enter rejection reason...'
                : 'Enter resubmit reason...'
            }
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenReasonModal(false)}>Cancel</Button>

          <Button
            variant="contained"
            color={reasonAction === 'rejected' ? 'error' : 'warning'}
            disabled={!actionReason.trim()}
            onClick={submitReasonAction}
          >
            {reasonAction === 'rejected' ? 'Reject' : 'Resubmit'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
