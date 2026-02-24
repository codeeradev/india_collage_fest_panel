import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { getToken, getTokenPayload } from 'src/auth/auth';

import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import {
  getUserDashboard,
  getSocialDashboard,
  getAdminDashboardStats,
} from '../dashboard-api';

// ----------------------------------------------------------------------

type VisitSeriesItem = {
  dateKey?: string;
  count?: number;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const toMetric = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toFlatChart = (value: number) => ({
  categories: WEEK_DAYS,
  series: Array(WEEK_DAYS.length).fill(toMetric(value)),
});

const toStatusColor = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return 'success';
    case 'pending':
      return 'warning';
    case 'rejected':
      return 'error';
    case 'resubmitted':
      return 'info';
    default:
      return 'default';
  }
};

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const formatVisitLabel = (value?: string) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export function OverviewAnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminStats, setAdminStats] = useState<any>(null);
  const [organizerDashboard, setOrganizerDashboard] = useState<any>(null);
  const [socialTotals, setSocialTotals] = useState<any>(null);

  const token = getToken();
  const payload = token ? getTokenPayload(token) : null;
  const roleId = payload?.roleId;
  const isOrganizer = roleId === 3;

  const currentUserName = useMemo(() => {
    try {
      const userJson = localStorage.getItem('user');
      const user = userJson ? JSON.parse(userJson) : null;
      return user?.name || '';
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        if (isOrganizer) {
          const data = await getUserDashboard();
          if (isMounted) setOrganizerDashboard(data);
          return;
        }

        const [statsResult, socialResult] = await Promise.allSettled([
          getAdminDashboardStats(),
          getSocialDashboard(),
        ]);

        if (!isMounted) return;

        if (statsResult.status === 'fulfilled') {
          setAdminStats(statsResult.value);
        } else {
          throw statsResult.reason;
        }

        if (socialResult.status === 'fulfilled') {
          setSocialTotals(socialResult.value?.totals || null);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [isOrganizer]);

  const roleWidgets = useMemo(() => {
    if (isOrganizer && organizerDashboard?.stats) {
      const stats = organizerDashboard.stats;
      return [
        {
          title: 'Total events',
          total: toMetric(stats.total),
          color: 'primary' as const,
          icon: <img alt="Total events" src="/assets/icons/glass/ic-glass-bag.svg" />,
        },
        {
          title: 'Approved',
          total: toMetric(stats.approved),
          color: 'success' as const,
          icon: <img alt="Approved" src="/assets/icons/glass/ic-glass-message.svg" />,
        },
        {
          title: 'Pending',
          total: toMetric(stats.pending),
          color: 'warning' as const,
          icon: <img alt="Pending" src="/assets/icons/glass/ic-glass-buy.svg" />,
        },
        {
          title: 'Rejected',
          total: toMetric(stats.rejected),
          color: 'error' as const,
          icon: <img alt="Rejected" src="/assets/icons/glass/ic-glass-message.svg" />,
        },
        {
          title: 'Resubmitted',
          total: toMetric(stats.resubmitted),
          color: 'info' as const,
          icon: <img alt="Resubmitted" src="/assets/icons/glass/ic-glass-users.svg" />,
        },
        {
          title: 'Upcoming',
          total: toMetric(stats.upcoming),
          color: 'secondary' as const,
          icon: <img alt="Upcoming" src="/assets/icons/glass/ic-glass-bag.svg" />,
        },
      ];
    }

    if (!adminStats) return [];

    return [
      {
        title: 'Total users',
        total: toMetric(adminStats.totalUsers),
        color: 'primary' as const,
        icon: <img alt="Total users" src="/assets/icons/glass/ic-glass-users.svg" />,
      },
      {
        title: 'Organisers',
        total: toMetric(adminStats.totalOrganisers),
        color: 'info' as const,
        icon: <img alt="Organisers" src="/assets/icons/glass/ic-glass-users.svg" />,
      },
      {
        title: 'Events',
        total: toMetric(adminStats.totalEvents),
        color: 'warning' as const,
        icon: <img alt="Events" src="/assets/icons/glass/ic-glass-bag.svg" />,
      },
      {
        title: 'Categories',
        total: toMetric(adminStats.totalCategories),
        color: 'success' as const,
        icon: <img alt="Categories" src="/assets/icons/glass/ic-glass-buy.svg" />,
      },
      {
        title: 'Cities',
        total: toMetric(adminStats.totalCities),
        color: 'secondary' as const,
        icon: <img alt="Cities" src="/assets/icons/glass/ic-glass-message.svg" />,
      },
      {
        title: 'Pending events',
        total: toMetric(adminStats.pendingEventApprovals),
        color: 'error' as const,
        icon: <img alt="Pending events" src="/assets/icons/glass/ic-glass-message.svg" />,
      },
      {
        title: 'Pending organisers',
        total: toMetric(adminStats.pendingOrganizerApprovals),
        color: 'error' as const,
        icon: <img alt="Pending organisers" src="/assets/icons/glass/ic-glass-message.svg" />,
      },
      {
        title: 'Website visits',
        total: toMetric(adminStats.totalVisits),
        color: 'info' as const,
        icon: <img alt="Website visits" src="/assets/icons/glass/ic-glass-users.svg" />,
      },
      {
        title: 'Today visits',
        total: toMetric(adminStats.todayVisits),
        color: 'warning' as const,
        icon: <img alt="Today visits" src="/assets/icons/glass/ic-glass-buy.svg" />,
      },
    ];
  }, [adminStats, isOrganizer, organizerDashboard?.stats]);

  const socialWidgets = useMemo(() => {
    if (!socialTotals) return [];

    return [
      {
        title: 'Social likes',
        total: toMetric(socialTotals.likes),
        color: 'info' as const,
        icon: <img alt="Social likes" src="/assets/icons/glass/ic-glass-message.svg" />,
      },
      {
        title: 'Social comments',
        total: toMetric(socialTotals.comments),
        color: 'warning' as const,
        icon: <img alt="Social comments" src="/assets/icons/glass/ic-glass-message.svg" />,
      },
      {
        title: 'Social views',
        total: toMetric(socialTotals.views),
        color: 'success' as const,
        icon: <img alt="Social views" src="/assets/icons/glass/ic-glass-bag.svg" />,
      },
    ];
  }, [socialTotals]);

  const visitChart = useMemo(() => {
    if (isOrganizer || !adminStats?.visitSeries?.length) return null;

    return {
      categories: adminStats.visitSeries.map((item: VisitSeriesItem) => formatVisitLabel(item.dateKey)),
      series: [
        {
          name: 'Visits',
          data: adminStats.visitSeries.map((item: VisitSeriesItem) => toMetric(item.count)),
        },
      ],
    };
  }, [adminStats, isOrganizer]);

  if (loading) {
    return (
      <DashboardContent maxWidth="xl">
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="xl">
      <Stack spacing={1.5} sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4">Hi{currentUserName ? `, ${currentUserName}` : ''} Welcome back</Typography>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>

      <Grid container spacing={3}>
        {roleWidgets.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <AnalyticsWidgetSummary
              title={item.title}
              total={item.total}
              percent={0}
              color={item.color}
              icon={item.icon}
              chart={toFlatChart(item.total)}
            />
          </Grid>
        ))}

        {socialWidgets.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
            <AnalyticsWidgetSummary
              title={item.title}
              total={item.total}
              percent={0}
              color={item.color}
              icon={item.icon}
              chart={toFlatChart(item.total)}
            />
          </Grid>
        ))}

        {isOrganizer && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Latest events" />
              <Divider />
              <Box sx={{ p: 0 }}>
                <List disablePadding>
                  {organizerDashboard?.latestEvents?.length ? (
                    organizerDashboard.latestEvents.map((event: any) => (
                      <ListItem
                        key={event._id}
                        divider
                        secondaryAction={
                          <Chip
                            size="small"
                            label={event.approvalStatus || 'unknown'}
                            color={toStatusColor(event.approvalStatus) as any}
                          />
                        }
                      >
                        <ListItemText
                          primary={event.title}
                          secondary={`Start: ${formatDate(event.start_date)} | End: ${formatDate(event.end_date)}`}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <ListItemText primary="No recent events" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Card>
          </Grid>
        )}

        {!isOrganizer && visitChart && (
          <Grid size={{ xs: 12 }}>
            <AnalyticsWebsiteVisits
              title="Website visits"
              subheader={`Last ${toMetric(adminStats?.visitDays) || visitChart.categories.length} days`}
              chart={visitChart}
            />
          </Grid>
        )}
      </Grid>
    </DashboardContent>
  );
}
