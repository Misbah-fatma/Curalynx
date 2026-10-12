import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonIcon from "@mui/icons-material/Person";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddBoxIcon from "@mui/icons-material/AddBox";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DashboardChart from "./ChartPage";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function StatCard({ label, value, sublabel, icon, gradient, loading }) {
  return (
    <Box
      sx={{
        background: gradient,
        borderRadius: 3,
        p: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        },
        color: "#fff",
        overflow: "hidden",
        position: "relative",
        height: "100%",
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{ opacity: 0.85, fontWeight: 500, mb: 0.5, letterSpacing: 0.5 }}
        >
          {label}
        </Typography>
        {loading ? (
          <Skeleton variant="text" width={80} height={48} sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
        ) : (
          <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.1 }}>
            {value}
          </Typography>
        )}
        {sublabel && (
          <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5, display: "block" }}>
            {sublabel}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 32, color: "#fff" } })}
      </Box>
      <Box
        sx={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.07)",
          right: -40,
          bottom: -50,
        }}
      />
    </Box>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sublabel: PropTypes.string,
  icon: PropTypes.element.isRequired,
  gradient: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

const QUICK_ACTIONS = [
  { label: "Add Product", path: "/products/add", icon: <AddBoxIcon />, color: "#4f46e5" },
  { label: "View Products", path: "/products/view", icon: <InventoryIcon />, color: "#7c3aed" },
  { label: "Manage Users", path: "/users/view", icon: <PersonIcon />, color: "#06b6d4" },
  { label: "All Orders", path: "/orders/all", icon: <ListAltIcon />, color: "#f59e0b" },
];

function QuickActions({ onNavigate }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
        Quick Actions
      </Typography>
      <Stack spacing={1.25} sx={{ flex: 1 }}>
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.path}
            fullWidth
            variant="outlined"
            onClick={() => onNavigate(action.path)}
            sx={{
              flex: 1,
              minHeight: 52,
              px: 1.5,
              borderRadius: 2,
              borderColor: "#e2e8f0",
              color: "text.primary",
              textTransform: "none",
              justifyContent: "flex-start",
              gap: 1.25,
              "&:hover": {
                borderColor: action.color,
                bgcolor: `${action.color}0d`,
              },
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: `${action.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: action.color,
                flexShrink: 0,
              }}
            >
              {action.icon}
            </Box>
            <Typography variant="body2" fontWeight={600} textAlign="left">
              {action.label}
            </Typography>
          </Button>
        ))}
      </Stack>
    </Paper>
  );
}

QuickActions.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

function getStatusColor(status) {
  switch (status) {
    case "PENDING_VERIFICATION":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
}

function RecentOrders({ onNavigate }) {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BASEURL}/orders/recent`, {
          headers: authHeaders(),
        });
        const data = await res.json();
        if (res.ok) setOrders(data.orders || []);
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Recent Orders
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Latest activity across your store
          </Typography>
        </Box>
        <Button
          size="small"
          endIcon={<ArrowForwardIcon />}
          onClick={() => onNavigate("/orders/all")}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          View all
        </Button>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : orders.length === 0 ? (
        <Box textAlign="center" py={4}>
          <ListAltIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">No orders yet</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {orders.map((order) => (
            <Box
              key={order._id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#f8fafc",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                transition: "background 0.15s",
                "&:hover": { bgcolor: "#f1f5f9" },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {order.userId?.name || "Unknown customer"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(order.items ?? []).length} item(s) ·{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "—"}
                </Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
                <Typography variant="body2" fontWeight={700} color="primary.main">
                  ${(order.amount ?? 0).toFixed(2)}
                </Typography>
                <Chip
                  label={(order.status ?? "UNKNOWN").replace(/_/g, " ")}
                  color={getStatusColor(order.status)}
                  size="small"
                  sx={{ fontSize: 11 }}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}

RecentOrders.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};

function LowStockAlert({ count, onNavigate }) {
  if (!count) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: "1px solid #fde68a",
        bgcolor: "#fffbeb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <WarningAmberIcon sx={{ color: "#d97706" }} />
        <Box>
          <Typography variant="body2" fontWeight={600} color="#92400e">
            Low stock alert
          </Typography>
          <Typography variant="caption" color="#b45309">
            {count} product{count !== 1 ? "s" : ""} running low on inventory (≤10 units)
          </Typography>
        </Box>
      </Stack>
      <Button
        size="small"
        variant="outlined"
        onClick={() => onNavigate("/products/view")}
        sx={{
          textTransform: "none",
          borderColor: "#d97706",
          color: "#d97706",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        Review
      </Button>
    </Paper>
  );
}

LowStockAlert.propTypes = {
  count: PropTypes.number.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default function DashboardOverview({ onNavigate }) {
  const [stats, setStats] = React.useState({
    products: 0,
    users: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
    lowStock: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const base = process.env.REACT_APP_BASEURL;
        const headers = authHeaders();

        const [productsRes, usersRes, ordersRes] = await Promise.all([
          fetch(`${base}/products/count`, { headers }),
          fetch(`${base}/auth/count`, { headers }),
          fetch(`${base}/orders/stats`, { headers }),
        ]);

        const [productsData, usersData, ordersData] = await Promise.all([
          productsRes.json(),
          usersRes.json(),
          ordersRes.json(),
        ]);

        setStats({
          products: productsRes.ok ? productsData.count : 0,
          lowStock: productsRes.ok ? productsData.lowStock ?? 0 : 0,
          users: usersRes.ok ? usersData.count : 0,
          orders: ordersRes.ok ? ordersData.count : 0,
          revenue: ordersRes.ok ? ordersData.totalRevenue : 0,
          pendingOrders: ordersRes.ok ? ordersData.pendingOrders : 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatRevenue = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Welcome back 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Here&apos;s what&apos;s happening with your pharmacy today.
        </Typography>
      </Box>

      <LowStockAlert count={stats.lowStock} onNavigate={onNavigate} />

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Total Products"
            value={stats.products}
            sublabel={stats.lowStock ? `${stats.lowStock} low stock` : "In catalog"}
            icon={<ShoppingCartIcon />}
            gradient="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Total Users"
            value={stats.users}
            sublabel="Registered accounts"
            icon={<PersonIcon />}
            gradient="linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Total Orders"
            value={stats.orders}
            sublabel={stats.pendingOrders ? `${stats.pendingOrders} pending` : "All time"}
            icon={<ListAltIcon />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            label="Total Revenue"
            value={formatRevenue(stats.revenue)}
            sublabel="Lifetime earnings"
            icon={<AttachMoneyIcon />}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2.5,
          mb: 3,
          width: "100%",
          alignItems: "stretch",
          minHeight: { md: 320 },
        }}
      >
        <Box
          sx={{
            flex: { xs: "none", md: "3 1 0" },
            width: { xs: "100%", md: "auto" },
            minWidth: 0,
            display: "flex",
          }}
        >
          <DashboardChart stats={stats} loading={loading} />
        </Box>
        <Box
          sx={{
            flex: { xs: "none", md: "1 1 0" },
            width: { xs: "100%", md: "auto" },
            minWidth: 0,
            display: "flex",
          }}
        >
          <QuickActions onNavigate={onNavigate} />
        </Box>
      </Box>

      <Box sx={{ pb: 4, width: "100%" }}>
        <RecentOrders onNavigate={onNavigate} />
      </Box>
    </Box>
  );
}

DashboardOverview.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
