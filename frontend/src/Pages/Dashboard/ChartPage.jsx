import React from "react";
import PropTypes from "prop-types";
import { Paper, Typography, Box, Divider, Skeleton } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const GRADIENTS = [
  { id: "overviewGrad0", start: "#4f46e5", end: "#7c3aed" },
  { id: "overviewGrad1", start: "#06b6d4", end: "#0284c7" },
  { id: "overviewGrad2", start: "#f59e0b", end: "#ea580c" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          px: 2,
          py: 1.5,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={700} color="primary.main">
          {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function DashboardChart({ stats, loading }) {
  const data = [
    { name: "Products", count: stats?.products ?? 0 },
    { name: "Users", count: stats?.users ?? 0 },
    { name: "Orders", count: stats?.orders ?? 0 },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        bgcolor: "#fff",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5} mb={1}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BarChartIcon sx={{ color: "#fff", fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            Overview
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Products, users &amp; orders at a glance
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <Skeleton variant="rounded" sx={{ flex: 1, minHeight: 220 }} />
      ) : (
        <Box sx={{ flex: 1, minHeight: 220, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 16, left: -8, bottom: 4 }}
              barCategoryGap="28%"
            >
              <defs>
                {GRADIENTS.map((g) => (
                  <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={g.start} stopOpacity={1} />
                    <stop offset="100%" stopColor={g.end} stopOpacity={0.75} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13, fill: "#64748b", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#${GRADIENTS[index % GRADIENTS.length].id})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}

DashboardChart.propTypes = {
  stats: PropTypes.shape({
    products: PropTypes.number,
    users: PropTypes.number,
    orders: PropTypes.number,
    revenue: PropTypes.number,
    pendingOrders: PropTypes.number,
    lowStock: PropTypes.number,
  }),
  loading: PropTypes.bool,
};
