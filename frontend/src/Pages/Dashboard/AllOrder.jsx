import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  ORDER_STATUSES,
  ORDER_STATUS_META,
  TRACKING_STEPS,
  getStatusLabel,
} from "../../constants/orderStatuses";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const chipColor = (status) => ORDER_STATUS_META[status]?.color || "default";

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/orders/allOrders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
      setOrders(data.orders || []);
    } catch (err) {
      showSnack(err.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const userName = order.userId?.name || "";
      const userEmail = order.userId?.email || "";
      const addrEmail = order.address?.email || "";
      return (
        order._id?.toLowerCase().includes(q) ||
        userName.toLowerCase().includes(q) ||
        userEmail.toLowerCase().includes(q) ||
        addrEmail.toLowerCase().includes(q) ||
        order.status?.toLowerCase().includes(q) ||
        order.paymentMethod?.toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  const paged = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getNextSuggestedStatus = (current) => {
    if (current === "CANCELLED" || current === "COMPLETED" || current === "DELIVERED") {
      return current;
    }
    const idx = TRACKING_STEPS.indexOf(current);
    if (idx >= 0 && idx < TRACKING_STEPS.length - 1) {
      return TRACKING_STEPS[idx + 1];
    }
    return "PAYMENT_VERIFIED";
  };

  const openOrder = (order) => {
    setSelected(order);
    setNextStatus(getNextSuggestedStatus(order.status || "PENDING_VERIFICATION"));
    setNote("");
    setConfirming(false);
  };

  const closeDrawer = () => {
    setSelected(null);
    setConfirming(false);
    setNote("");
  };

  const activeStepIndex = useMemo(() => {
    if (!selected) return -1;
    if (selected.status === "COMPLETED") return TRACKING_STEPS.length - 1;
    if (selected.status === "CANCELLED") return -1;
    return TRACKING_STEPS.indexOf(selected.status);
  }, [selected]);

  const updateStatus = async () => {
    if (!selected || !nextStatus) return;
    if (nextStatus === selected.status) {
      showSnack("Choose a different status to update", "warning");
      setConfirming(false);
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/orders/${selected._id}/status`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ status: nextStatus, note }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Failed to update status (${res.status})`);
      }

      const updated = data.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
      setSelected(updated);
      setNextStatus(getNextSuggestedStatus(updated.status));
      setConfirming(false);
      setNote("");
      showSnack(
        data.emailSent
          ? `Status updated to ${getStatusLabel(nextStatus)} — customer emailed`
          : `Status updated to ${getStatusLabel(nextStatus)}`
      );
    } catch (err) {
      showSnack(err.message || "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box sx={{ py: { xs: 1, md: 1.5 } }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Orders & Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update fulfillment steps — each change emails the customer.
            </Typography>
          </Box>
          <Chip
            icon={<LocalShippingOutlinedIcon />}
            label={`${orders.length} orders`}
            sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <TextField
            size="small"
            placeholder="Search order ID, customer, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, maxWidth: 420, width: "100%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress size={32} />
            </Box>
          ) : filtered.length === 0 ? (
            <Alert severity="info">No orders found.</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Tracking</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((order) => (
                      <TableRow key={order._id} hover>
                        <TableCell>
                          <Typography fontSize={13} fontWeight={600}>
                            #{String(order._id).slice(-8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {order.userId?.name ||
                            order.address?.fullName ||
                            "Unknown"}
                          <Typography variant="body2" color="text.secondary">
                            {order.address?.email ||
                              order.userId?.email ||
                              "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {(order.items ?? []).slice(0, 2).map((item) => (
                            <Typography key={item._id || item.name} fontSize={13}>
                              {item.name} × {item.qty}
                            </Typography>
                          ))}
                          {(order.items?.length || 0) > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{order.items.length - 2} more
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          ${Number(order.amount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Typography fontSize={13} textTransform="capitalize">
                            {order.paymentMethod || "—"}
                          </Typography>
                          <Chip
                            size="small"
                            label={order.paymentStatus || "pending"}
                            variant="outlined"
                            sx={{ mt: 0.5, textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getStatusLabel(order.status)}
                            color={chipColor(order.status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openOrder(order)}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                          >
                            Track / Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </Paper>
      </Stack>

      <Drawer
        anchor="right"
        open={Boolean(selected)}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 460 },
            p: 0,
            zIndex: (theme) => theme.zIndex.modal + 2,
          },
        }}
        ModalProps={{
          sx: { zIndex: (theme) => theme.zIndex.modal + 1 },
        }}
      >
        {selected && (
          <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0" }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Order Tracking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  #{String(selected._id).slice(-8).toUpperCase()}
                </Typography>
              </Box>
              <IconButton onClick={closeDrawer}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Box sx={{ p: 2.5, overflow: "auto", flex: 1 }}>
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={getStatusLabel(selected.status)}
                    color={chipColor(selected.status)}
                    sx={{ fontWeight: 700 }}
                  />
                  <Chip
                    label={`Payment: ${selected.paymentStatus || "pending"}`}
                    variant="outlined"
                    sx={{ textTransform: "capitalize" }}
                  />
                </Stack>

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    Where it has reached
                  </Typography>
                  {selected.status === "CANCELLED" ? (
                    <Alert severity="error">This order was cancelled.</Alert>
                  ) : (
                    <Stepper
                      activeStep={Math.max(activeStepIndex, 0)}
                      orientation="vertical"
                    >
                      {TRACKING_STEPS.map((step) => (
                        <Step
                          key={step}
                          completed={
                            activeStepIndex >= TRACKING_STEPS.indexOf(step)
                          }
                        >
                          <StepLabel>
                            <Typography fontWeight={600} fontSize={13}>
                              {getStatusLabel(step)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ORDER_STATUS_META[step]?.description}
                            </Typography>
                          </StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Customer
                  </Typography>
                  <Typography fontSize={14}>
                    {selected.address?.fullName ||
                      selected.userId?.name ||
                      "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selected.address?.email || selected.userId?.email || "—"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selected.address?.phone || "—"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Update status
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    Choosing a status and saving will email the customer with
                    this tracking step.
                  </Typography>

                  <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                    <InputLabel>Order status</InputLabel>
                    <Select
                      label="Order status"
                      value={nextStatus}
                      onChange={(e) => {
                        setNextStatus(e.target.value);
                        setConfirming(false);
                      }}
                      disabled={updating}
                    >
                      {ORDER_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {getStatusLabel(status)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    label="Note for customer (optional)"
                    placeholder="e.g. Shipped via courier, tracking #ABC123"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    sx={{ mb: 1.5 }}
                    disabled={updating}
                  />

                  {!confirming ? (
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={
                        !nextStatus ||
                        updating ||
                        nextStatus === selected.status
                      }
                      onClick={() => setConfirming(true)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {nextStatus === selected.status
                        ? "Select a new status above"
                        : nextStatus === "ORDER_IN_PROCESS"
                          ? "Set Order in Process & Email"
                          : `Update to ${getStatusLabel(nextStatus)} & Email`}
                    </Button>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "#f8fafc",
                        borderColor: "#c7d2fe",
                      }}
                    >
                      <Typography fontWeight={700} mb={0.5}>
                        Confirm & send email?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={1.5}>
                        Change from{" "}
                        <strong>{getStatusLabel(selected.status)}</strong> to{" "}
                        <strong>{getStatusLabel(nextStatus)}</strong>. The
                        customer will be emailed this update.
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          disabled={updating}
                          onClick={() => setConfirming(false)}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={updating}
                          onClick={updateStatus}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          {updating ? "Updating..." : "Confirm & Send Email"}
                        </Button>
                      </Stack>
                    </Paper>
                  )}
                </Box>

                {(selected.statusHistory || []).length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>
                      History
                    </Typography>
                    <Stack spacing={1}>
                      {[...(selected.statusHistory || [])]
                        .reverse()
                        .map((entry, idx) => (
                          <Paper
                            key={`${entry.status}-${entry.at}-${idx}`}
                            variant="outlined"
                            sx={{ p: 1.25, borderRadius: 2 }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Typography fontSize={13} fontWeight={700}>
                                {getStatusLabel(entry.status)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(entry.at)}
                              </Typography>
                            </Stack>
                            {entry.note && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                              >
                                {entry.note}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
