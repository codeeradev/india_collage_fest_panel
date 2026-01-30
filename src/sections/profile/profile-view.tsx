import type { MOU } from 'src/types/mou';
import type { User, UserProfileForm, UserProfilePreview } from 'src/types/user';

import { useState, useEffect } from 'react';

import {
  Box,
  Card,
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

import MouPreviewModal from '../mouManagment/mou-preview-modal';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL;

/* ===================================================== */
/* EXACT GRID REPLACEMENT — FLEXBOX (1:1 MUI GRID)       */
/* ===================================================== */

const GridContainer = ({
  spacing = 3,
  children,
}: {
  spacing?: number;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      margin: `-${spacing * 4}px`,
    }}
  >
    {children}
  </Box>
);

const GridItem = ({
  xs = 12,
  md,
  children,
}: {
  xs?: number;
  md?: number;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      padding: `${3 * 4}px`,
      width: {
        xs: `${(xs / 12) * 100}%`,
        md: md ? `${(md / 12) * 100}%` : undefined,
      },
    }}
  >
    {children}
  </Box>
);

/* ===================================================== */

type City = {
  _id: string;
  city: string;
};

export default function ProfileView() {
  const user: User | null = (() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  })();

  const isOrganizer = user?.roleId === 3;

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

  const [openPreview, setOpenPreview] = useState(false);
  const [previewPdf, setPreviewPdf] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!user?._id) return;

    const load = async () => {
      const req: Promise<any>[] = [get(ENDPOINTS.GET_PROFILE(user._id)), get(ENDPOINTS.GET_CITY)];

      if (isOrganizer) {
        req.push(get(ENDPOINTS.GET_MY_MOU, { authRequired: true }));
      }

      const [profileRes, cityRes, mouRes] = await Promise.all(req);

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

  /* ================= SUBMIT ================= */

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

      await post(ENDPOINTS.EDIT_PROFILE, fd, { authRequired: true });

      alert('Profile updated successfully');
    } finally {
      setLoading(false);
    }
  };

  const img = (v?: string | null) => {
    if (!v) return undefined;
    if (v.startsWith('blob:')) return v;
    return IMAGE_BASE_URL + v;
  };

  const openMouPreview = async () => {
    try {
      setPreviewLoading(true);

      const res = await get(ENDPOINTS.PREVIEW_MOU, {
        authRequired: true,
        responseType: 'blob',
      });

      const file = new Blob([res.data], {
        type: 'application/pdf',
      });

      const url = URL.createObjectURL(file);

      setPreviewPdf(url);
      setOpenPreview(true);
    } catch (err) {
      alert('Failed to load PDF preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Box sx={{ px: 4, pb: 6, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" mb={4}>
        Profile Settings
      </Typography>

      {/* ================= BANNER + PROFILE ================= */}

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

      {/* ================= ACCOUNT FORM ================= */}

      <Card sx={{ p: 5, borderRadius: 6, maxWidth: 900 }}>
        <Typography variant="h6" mb={1}>
          Account Information
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={4}>
          Update your personal details
        </Typography>

        <GridContainer spacing={3}>
          <GridItem xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </GridItem>

          <GridItem xs={12} md={6}>
            <TextField fullWidth label="Phone" value={form.phone} disabled />
          </GridItem>

          <GridItem xs={12} md={6}>
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
          </GridItem>

          <GridItem xs={12}>
            <TextField
              fullWidth
              label="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </GridItem>

          <GridItem xs={12}>
            <Button
              size="large"
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              startIcon={loading ? <CircularProgress size={18} /> : null}
            >
              Save Changes
            </Button>
          </GridItem>
        </GridContainer>
      </Card>

      {/* ================= MOU ================= */}

      {isOrganizer && (
        <Card sx={{ p: 5, borderRadius: 6, maxWidth: 900, mt: 6 }}>
          <Typography variant="h6" mb={1}>
            Memorandum of Understanding (MOU)
          </Typography>

          {mouLoading && <CircularProgress />}

          {!mouLoading && mou && (
            <GridContainer spacing={3}>
              <GridItem xs={12} md={6}>
                <Typography variant="subtitle2">Status</Typography>
                <Chip label={mou.status} />
              </GridItem>

              <GridItem xs={12} md={6}>
                <Typography variant="subtitle2">Signed At</Typography>
                <Typography>
                  {mou.signedAt ? new Date(mou.signedAt).toLocaleDateString() : '-'}
                </Typography>
              </GridItem>

              <GridItem xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={openMouPreview}
                    disabled={previewLoading}
                    startIcon={previewLoading ? <CircularProgress size={18} /> : null}
                  >
                    {previewLoading ? 'Loading...' : 'Preview MOU'}
                  </Button>

                  {mou.status !== 'signed' && (
                    <Button
                      variant="contained"
                      onClick={async () => {
                        await post(ENDPOINTS.SEND_MOU_OTP, {}, { authRequired: true });
                        setOpenOtp(true);
                      }}
                    >
                      Sign MOU
                    </Button>
                  )}

                  {mou.signedPdfUrl && (
                    <Button
                      variant="outlined"
                      href={`${IMAGE_BASE_URL}${mou.signedPdfUrl}`}
                      target="_blank"
                    >
                      Download Signed MOU
                    </Button>
                  )}
                </Box>
              </GridItem>
            </GridContainer>
          )}
        </Card>
      )}
      <MouPreviewModal
        open={openPreview}
        pdfUrl={previewPdf}
        onClose={() => setOpenPreview(false)}
      />

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
