import type { MOU } from 'src/types/mou';
import type { User, UserProfileForm, UserProfilePreview } from 'src/types/user';

import { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Chip,
  Avatar,
  Button,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';

import { ENDPOINTS } from 'src/api/endpoint';
import { get, post } from 'src/api/apiClient';

import OtpModal from 'src/sections/mouManagment/otp-modal';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

type City = {
  _id: string;
  city: string;
};

export default function ProfileView() {
  // =====================================================
  // USER + ROLE
  // =====================================================

  const user: User | null = (() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  })();

  const isOrganizer = user?.roleId === 3;

  // =====================================================
  // STATE
  // =====================================================

  const [cities, setCities] = useState<City[]>([]);

  const [form, setForm] = useState<UserProfileForm>({
    name: '',
    phone: '',
    location: '',
    password: '',
  });

  const [mou, setMou] = useState<MOU | null>(null);
  const [mouLoading, setMouLoading] = useState(true);

  const [image, setImage] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);

  const [preview, setPreview] = useState<UserProfilePreview>({
    image: null,
    banner: null,
  });

  const [loading, setLoading] = useState(false);
  const [openOtp, setOpenOtp] = useState(false);

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    if (!user?._id) return;

    const load = async () => {
      const requests: Promise<any>[] = [
        get(ENDPOINTS.GET_PROFILE(user._id)),
        get(ENDPOINTS.GET_CITY),
      ];

      if (isOrganizer) {
        requests.push(get(ENDPOINTS.GET_MY_MOU, { authRequired: true }));
      }

      const [profileRes, cityRes, mouRes] = await Promise.all(requests);

      const u = profileRes.data.profile;

      setCities(cityRes.data.data);

      setForm({
        name: u.name || '',
        phone: u.phone ? String(u.phone) : '',
        location: u.location?._id || '',
        password: '',
      });

      setPreview({
        image: u.image || null,
        banner: u.bannerImage || null,
      });

      if (isOrganizer && mouRes) {
        setMou(mouRes.data.data);
        setMouLoading(false);
      }
    };

    load();
  }, [user?._id]);

  // =====================================================
  // SUBMIT PROFILE
  // =====================================================

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('password', form.password);
      fd.append('location', form.location);

      if (image) fd.append('image', image);
      if (banner) fd.append('bannerImage', banner);

      await post(ENDPOINTS.EDIT_PROFILE, fd, {
        authRequired: true,
      });

      alert('Profile updated successfully');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // IMAGE HELPER
  // =====================================================

  const img = (v?: string | null) => {
    if (!v) return undefined;
    if (v.startsWith('blob:')) return v;
    return IMAGE_BASE_URL + v;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <Box sx={{ px: 4, pb: 6, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" mb={4}>
        Profile Settings
      </Typography>

      {/* ================================================= */}
      {/* PROFILE HEADER                                   */}
      {/* ================================================= */}

      <Card sx={{ borderRadius: 6, mb: 6, overflow: 'hidden' }}>
        <Box
          sx={{
            width: '100%',
            aspectRatio: '12 / 5',
            backgroundImage: preview.banner
              ? `url(${img(preview.banner)})`
              : 'linear-gradient(135deg,#4f46e5,#3b82f6)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <Button
            component="label"
            size="small"
            variant="contained"
            sx={{ position: 'absolute', top: 20, right: 20 }}
          >
            Change Banner
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setBanner(f);
                setPreview((p) => ({
                  ...p,
                  banner: URL.createObjectURL(f),
                }));
              }}
            />
          </Button>
        </Box>

        <Box
          sx={{
            px: 4,
            py: 3,
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            backgroundColor: '#fff',
          }}
        >
          <Avatar
            src={img(preview.image)}
            sx={{
              width: 150,
              height: 150,
              border: '6px solid white',
            }}
          />

          <Box>
            <Typography variant="h6">{form.name || 'Your Name'}</Typography>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Profile picture
            </Typography>

            <Button component="label" size="small" variant="outlined">
              Change Avatar
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImage(f);
                  setPreview((p) => ({
                    ...p,
                    image: URL.createObjectURL(f),
                  }));
                }}
              />
            </Button>
          </Box>
        </Box>
      </Card>

      {/* ================================================= */}
      {/* ACCOUNT FORM                                     */}
      {/* ================================================= */}

      <Card sx={{ p: 5, borderRadius: 6, maxWidth: 900 }}>
        <Typography variant="h6" mb={1}>
          Account Information
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={4}>
          Update your personal details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Phone" value={form.phone} disabled />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="City"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            >
              {cities.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              size="large"
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={18} /> : null}
            >
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* ================================================= */}
      {/* MOU — ORGANIZER ONLY                              */}
      {/* ================================================= */}

      {isOrganizer && (
        <Card sx={{ p: 5, borderRadius: 6, maxWidth: 900, mt: 6 }}>
          <Typography variant="h6" mb={1}>
            Memorandum of Understanding (MOU)
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Legal agreement required to use platform features
          </Typography>

          {mouLoading && <CircularProgress />}

          {!mouLoading && mou && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip
                  label={mou.status}
                  color={
                    mou.status === 'signed'
                      ? 'success'
                      : mou.status === 'otp_sent'
                      ? 'warning'
                      : 'default'
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Signed At</Typography>
                <Typography>
                  {mou.signedAt
                    ? new Date(mou.signedAt).toLocaleDateString()
                    : '-'}
                </Typography>
              </Grid>

              {mou.pdfUrl && (
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    href={mou.pdfUrl}
                    target="_blank"
                  >
                    View MOU PDF
                  </Button>
                </Grid>
              )}

              {mou.status !== 'signed' && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={() => setOpenOtp(true)}
                  >
                    Sign MOU
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </Card>
      )}

      {/* ================================================= */}
      {/* OTP MODAL                                        */}
      {/* ================================================= */}

      <OtpModal
        open={openOtp}
        onClose={() => setOpenOtp(false)}
        reload={async () => {
          const res = await get(ENDPOINTS.GET_MY_MOU, {
            authRequired: true,
          });
          setMou(res.data.data);
        }}
      />
    </Box>
  );
}
