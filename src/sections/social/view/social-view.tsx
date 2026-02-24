import { useSearchParams } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';

import {
  Box,
  Card,
  Chip,
  Grid,
  List,
  Alert,
  Stack,
  Avatar,
  Button,
  Dialog,
  Divider,
  Checkbox,
  ListItem,
  MenuItem,
  TextField,
  CardHeader,
  Typography,
  CardContent,
  DialogTitle,
  ListItemText,
  DialogActions,
  DialogContent,
  FormControlLabel,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { API_BASE_URL } from 'src/api/endpoint';
import { DashboardContent } from 'src/layouts/dashboard';

import { getToken, getTokenPayload } from 'src/auth/auth';

import {
  getMetaPages,
  getMyPosters,
  rejectPoster,
  submitPoster,
  approvePoster,
  getActivePage,
  saveMetaToken,
  setActivePage,
  getMetaLoginUrl,
  getPosterRequests,
} from '../social-api';

// ----------------------------------------------------------------------

type PageItem = {
  _id: string;
  name?: string;
  page_id?: string;
  instagram_id?: string | null;
};

type SocialPostItem = {
  _id: string;
  caption?: string;
  image?: string;
  platforms?: string[];
  status?: string;
  rejectionReason?: string | null;
  error?: string | null;
  userId?: { name?: string; email?: string; image?: string };
};

const platformLabel: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
};

const statusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'info';
    case 'published':
      return 'success';
    case 'rejected':
      return 'error';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

export function SocialView() {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  const token = getToken();
  const payload = token ? getTokenPayload(token) : null;
  const roleId = payload?.roleId;
  const isAdmin = roleId === 1;

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pages, setPages] = useState<PageItem[]>([]);
  const [activePage, setActivePageState] = useState<PageItem | null>(null);
  const [pendingPosts, setPendingPosts] = useState<SocialPostItem[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);

  const [caption, setCaption] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['facebook', 'instagram']);
  const [file, setFile] = useState<File | null>(null);
  const [myPosts, setMyPosts] = useState<SocialPostItem[]>([]);

  const imageSrc = useMemo(
    () => (path?: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${API_BASE_URL}${path}`;
    },
    []
  );

  const redirectUri = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/social`;
  }, []);

  const loadAdminData = async () => {
    const [pageList, active, requests] = await Promise.all([
      getMetaPages(false),
      getActivePage(),
      getPosterRequests('pending'),
    ]);

    setPages(pageList);
    setActivePageState(active);
    setPendingPosts(requests);
  };

  const loadOrganizerData = async () => {
    const posts = await getMyPosters();
    setMyPosts(posts);

    try {
      const active = await getActivePage();
      setActivePageState(active);
    } catch {
      setActivePageState(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setPageLoading(true);
        setError('');

        if (isAdmin) {
          await loadAdminData();
        } else {
          await loadOrganizerData();
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load');
      } finally {
        setPageLoading(false);
      }
    };

    load();
  }, [isAdmin]);

  useEffect(() => {
    const handleOAuth = async () => {
      if (!isAdmin || !code) return;
      try {
        setLoading(true);
        setError('');
        await saveMetaToken(code, redirectUri || undefined);
        setSuccess('Meta connected successfully');
        router.replace('/social');
        await loadAdminData();
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Meta connection failed');
      } finally {
        setLoading(false);
      }
    };

    handleOAuth();
  }, [code, isAdmin, redirectUri, router]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');
      const url = await getMetaLoginUrl(redirectUri || undefined);
      window.location.href = url;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to start Meta login');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPages = async () => {
    try {
      setLoading(true);
      const pageList = await getMetaPages(true);
      setPages(pageList);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to refresh pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = async (pageId: string) => {
    try {
      setLoading(true);
      await setActivePage(pageId);
      const active = await getActivePage();
      setActivePageState(active);
      setSuccess('Active page updated');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to set active page');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPoster = async () => {
    try {
      if (!file) {
        setError('Poster image is required');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      const fd = new FormData();
      fd.append('caption', caption);
      fd.append('platforms', JSON.stringify(platforms));
      fd.append('image', file);

      await submitPoster(fd);
      setSuccess('Poster submitted for approval');
      setCaption('');
      setFile(null);
      setPlatforms(['facebook', 'instagram']);

      await loadOrganizerData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit poster');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await approvePoster(id);
      await loadAdminData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;

    try {
      setProcessingId(rejectId);
      await rejectPoster(rejectId, rejectReason);
      setRejectOpen(false);
      setRejectReason('');
      setRejectId(null);
      await loadAdminData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Reject failed');
    } finally {
      setProcessingId(null);
    }
  };

  if (pageLoading) {
    return (
      <DashboardContent>
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4">Social Integration</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Stack>

      {isAdmin ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader title="Meta Connection" />
              <CardContent>
                <Stack spacing={2}>
                  <Button variant="contained" color="inherit" onClick={handleConnect} disabled={loading}>
                    Connect Meta
                  </Button>

                  <Button variant="outlined" onClick={handleRefreshPages} disabled={loading}>
                    Refresh Pages
                  </Button>

                  <TextField
                    select
                    label="Select Active Page"
                    value={activePage?._id || ''}
                    onChange={(event) => handleSelectPage(event.target.value)}
                  >
                    {pages.map((page) => (
                      <MenuItem key={page._id} value={page._id}>
                        {page.name || page.page_id}
                      </MenuItem>
                    ))}
                  </TextField>

                  {activePage && (
                    <Box>
                      <Typography variant="subtitle2">Active Page</Typography>
                      <Typography variant="body2">{activePage.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {activePage.page_id}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Pending Posters" />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  {pendingPosts.length ? (
                    pendingPosts.map((post) => (
                      <ListItem key={post._id} divider alignItems="flex-start">
                        <Avatar
                          variant="rounded"
                          src={imageSrc(post.image)}
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />

                        <ListItemText
                          primary={post.caption || 'Untitled'}
                          secondary={
                            post.userId?.name
                              ? `By ${post.userId?.name} (${post.userId?.email || ''})`
                              : 'Organizer'
                          }
                        />

                        <Stack spacing={1} sx={{ minWidth: 140 }}>
                          <Button
                            variant="contained"
                            size="small"
                            color="inherit"
                            onClick={() => handleApprove(post._id)}
                            disabled={processingId === post._id}
                          >
                            Approve
                          </Button>

                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => {
                              setRejectId(post._id);
                              setRejectOpen(true);
                            }}
                            disabled={processingId === post._id}
                          >
                            Reject
                          </Button>
                        </Stack>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No pending posters" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardHeader title="Upload Poster" />
              <CardContent>
                <Stack spacing={2}>
                  <TextField
                    label="Caption"
                    multiline
                    rows={3}
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                  />

                  <Stack direction="row" spacing={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={platforms.includes('facebook')}
                          onChange={(event) => {
                            setPlatforms((prev) =>
                              event.target.checked
                                ? prev.includes('facebook')
                                  ? prev
                                  : [...prev, 'facebook']
                                : prev.filter((platform) => platform !== 'facebook')
                            );
                          }}
                        />
                      }
                      label="Facebook"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={platforms.includes('instagram')}
                          onChange={(event) => {
                            setPlatforms((prev) =>
                              event.target.checked
                                ? prev.includes('instagram')
                                  ? prev
                                  : [...prev, 'instagram']
                                : prev.filter((platform) => platform !== 'instagram')
                            );
                          }}
                        />
                      }
                      label="Instagram"
                    />
                  </Stack>

                  <Button component="label" variant="outlined">
                    {file ? 'Change Image' : 'Upload Image'}
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(event) => setFile(event.target.files?.[0] || null)}
                    />
                  </Button>

                  {file && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {file.name}
                    </Typography>
                  )}

                  {activePage && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Posting to: {activePage.name || activePage.page_id}
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    color="inherit"
                    onClick={handleSubmitPoster}
                    disabled={loading}
                  >
                    Submit for Approval
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardHeader title="My Posters" />
              <Divider />
              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  {myPosts.length ? (
                    myPosts.map((post) => (
                      <ListItem key={post._id} divider>
                        <Avatar
                          variant="rounded"
                          src={imageSrc(post.image)}
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />

                        <ListItemText
                          primary={post.caption || 'Untitled'}
                          secondary={
                            post.platforms?.length
                              ? post.platforms.map((platform) => platformLabel[platform] || platform).join(', ')
                              : 'Facebook, Instagram'
                          }
                        />

                        <Chip label={post.status || 'pending'} color={statusColor(post.status) as any} />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No posters yet" />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Poster</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setRejectOpen(false)} color="inherit">
            Cancel
          </Button>

          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
