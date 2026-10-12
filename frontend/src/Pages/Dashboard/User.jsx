import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const getOrderStatusColor = (status) => {
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
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const formatAddress = (addr) =>
  [
    addr.addressLine1,
    addr.addressLine2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.country, addr.zipCode].filter(Boolean).join(" · "),
  ]
    .filter(Boolean)
    .join(", ");

function DetailRow({ label, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
      sx={{ py: 1 }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 110 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} textAlign="right">
        {value || "—"}
      </Typography>
    </Stack>
  );
}

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", text: "" });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/auth/users`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q) ||
        user.role?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const openUser = async (userId, tab = 0) => {
    setSelectedId(userId);
    setActiveTab(tab);
    setDrawerOpen(true);
    setFeedback({ type: "", text: "" });
    setDetailLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/auth/users/${userId}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load user");

      setDetail(data.user);
      setOrders(data.orders || []);
      setEditForm({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        role: data.user.role || "user",
      });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
      setDetail(null);
      setOrders([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedId(null);
    setDetail(null);
    setOrders([]);
    setFeedback({ type: "", text: "" });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveUser = async () => {
    if (!selectedId) return;
    setSaving(true);
    setFeedback({ type: "", text: "" });

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/auth/users/${selectedId}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(editForm),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setDetail(data.user);
      setFeedback({ type: "success", text: "User updated successfully" });
      await fetchUsers();
      setActiveTab(0);
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const askDeleteUser = (user) => {
    setDeleteTarget(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    setFeedback({ type: "", text: "" });

    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/auth/users/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setDeleteTarget(null);
      if (selectedId === deleteTarget._id) {
        closeDrawer();
      }
      await fetchUsers();
      setFeedback({ type: "success", text: "User deleted successfully" });
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Customers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View profiles, addresses, and order history. Edit account details
              anytime.
            </Typography>
          </Box>
          <TextField
            size="small"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: { sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {feedback.text && !drawerOpen && (
          <Alert
            severity={feedback.type === "success" ? "success" : "error"}
            sx={{ mb: 2 }}
            onClose={() => setFeedback({ type: "", text: "" })}
          >
            {feedback.text}
          </Alert>
        )}

        {loading ? (
          <Box py={6} textAlign="center">
            <CircularProgress size={32} />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Typography color="text.secondary" py={4} textAlign="center">
            No users found.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Spent</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => openUser(user._id, 0)}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: "#0f766e",
                            fontSize: 14,
                            fontWeight: 700,
                          }}
                        >
                          {initials(user.name)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} fontSize={14}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.addresses?.length || 0} address
                            {(user.addresses?.length || 0) === 1 ? "" : "es"}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={14}>{user.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.phone || "No phone"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={user.role || "user"}
                        color={user.role === "admin" ? "secondary" : "default"}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{user.orderCount || 0}</Typography>
                    </TableCell>
                    <TableCell>{formatMoney(user.totalSpent)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View details">
                        <IconButton
                          size="small"
                          onClick={() => openUser(user._id, 0)}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit user">
                        <IconButton
                          size="small"
                          onClick={() => openUser(user._id, 2)}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete user">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => askDeleteUser(user)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeDrawer}
        ModalProps={{
          keepMounted: false,
          sx: { zIndex: 2000 },
        }}
        slotProps={{
          backdrop: {
            sx: { zIndex: 1999 },
          },
        }}
        sx={{
          zIndex: 2000,
          "& .MuiDrawer-paper": {
            zIndex: 2000,
          },
        }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 480, md: 560 },
            bgcolor: "#f8fafc",
            zIndex: 2000,
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              px: 3,
              py: 2.5,
              bgcolor: "#fff",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: "#0f766e",
                    fontWeight: 700,
                  }}
                >
                  {initials(detail?.name || "")}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                    {detail?.name || "Customer"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detail?.email || "Loading…"}
                  </Typography>
                  {detail && (
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip
                        size="small"
                        label={detail.role || "user"}
                        sx={{ textTransform: "capitalize" }}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${orders.length} order${orders.length === 1 ? "" : "s"}`}
                      />
                    </Stack>
                  )}
                </Box>
              </Stack>
              <IconButton onClick={closeDrawer} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              sx={{ mt: 2, minHeight: 40 }}
              variant="fullWidth"
            >
              <Tab
                icon={<PersonOutlineIcon fontSize="small" />}
                iconPosition="start"
                label="Profile"
                sx={{ minHeight: 40, textTransform: "none" }}
              />
              <Tab
                icon={<ReceiptLongOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Orders"
                sx={{ minHeight: 40, textTransform: "none" }}
              />
              <Tab
                icon={<EditOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Edit"
                sx={{ minHeight: 40, textTransform: "none" }}
              />
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            {feedback.text && (
              <Alert
                severity={feedback.type === "success" ? "success" : "error"}
                sx={{ mb: 2 }}
                onClose={() => setFeedback({ type: "", text: "" })}
              >
                {feedback.text}
              </Alert>
            )}

            {detailLoading ? (
              <Box py={8} textAlign="center">
                <CircularProgress size={32} />
              </Box>
            ) : !detail ? (
              <Typography color="text.secondary">Unable to load user.</Typography>
            ) : (
              <>
                {activeTab === 0 && (
                  <Stack spacing={2.5}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0" }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        mb={1}
                        color="text.secondary"
                      >
                        ACCOUNT
                      </Typography>
                      <DetailRow label="Full name" value={detail.name} />
                      <Divider />
                      <DetailRow label="Email" value={detail.email} />
                      <Divider />
                      <DetailRow label="Phone" value={detail.phone} />
                      <Divider />
                      <DetailRow label="Role" value={detail.role} />
                      <Divider />
                      <DetailRow label="Joined" value={formatDateTime(detail.createdAt)} />
                      <Divider />
                      <DetailRow
                        label="Updated"
                        value={formatDateTime(detail.updatedAt)}
                      />
                    </Paper>

                    <Paper
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0" }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        mb={1.5}
                      >
                        <LocalShippingOutlinedIcon fontSize="small" color="action" />
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color="text.secondary"
                        >
                          SAVED ADDRESSES ({detail.addresses?.length || 0})
                        </Typography>
                      </Stack>

                      {!detail.addresses?.length ? (
                        <Typography variant="body2" color="text.secondary">
                          No addresses saved yet.
                        </Typography>
                      ) : (
                        <Stack spacing={1.5}>
                          {detail.addresses.map((addr, index) => (
                            <Box
                              key={addr._id || index}
                              sx={{
                                p: 1.75,
                                borderRadius: 2,
                                bgcolor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {(addr.fullName || addr.phone || addr.email) && (
                                <Typography fontWeight={600} fontSize={14} mb={0.5}>
                                  {addr.fullName || "Recipient"}
                                  {addr.phone ? ` · ${addr.phone}` : ""}
                                </Typography>
                              )}
                              {addr.email && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  mb={0.5}
                                >
                                  {addr.email}
                                </Typography>
                              )}
                              <Typography variant="body2" color="text.secondary">
                                {formatAddress(addr)}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>

                    <Button
                      variant="outlined"
                      startIcon={<EditOutlinedIcon />}
                      onClick={() => setActiveTab(2)}
                    >
                      Edit this user
                    </Button>
                  </Stack>
                )}

                {activeTab === 1 && (
                  <Stack spacing={1.5}>
                    {orders.length === 0 ? (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          textAlign: "center",
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography color="text.secondary">
                          This customer has not placed any orders yet.
                        </Typography>
                      </Paper>
                    ) : (
                      orders.map((order) => (
                        <Paper
                          key={order._id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            mb={1.5}
                          >
                            <Box>
                              <Typography fontWeight={700} fontSize={14}>
                                {formatMoney(order.amount)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDateTime(order.createdAt)}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                              <Chip
                                size="small"
                                label={(order.status || "UNKNOWN").replaceAll("_", " ")}
                                color={getOrderStatusColor(order.status)}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                label={`Pay: ${order.paymentStatus || "pending"}`}
                                color={getPaymentStatusColor(order.paymentStatus)}
                                sx={{ textTransform: "capitalize" }}
                              />
                            </Stack>
                          </Stack>

                          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                            Order ID: {order._id}
                          </Typography>

                          <Stack spacing={0.5} mb={1.5}>
                            {(order.items || []).map((item, idx) => (
                              <Stack
                                key={`${order._id}-${idx}`}
                                direction="row"
                                justifyContent="space-between"
                              >
                                <Typography fontSize={13}>
                                  {item.name} × {item.qty}
                                </Typography>
                                <Typography fontSize={13} color="text.secondary">
                                  {formatMoney(item.price * item.qty)}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>

                          <Divider sx={{ my: 1.25 }} />

                          <DetailRow
                            label="Payment"
                            value={(order.paymentMethod || "—").toUpperCase()}
                          />
                          {order.paymentId && (
                            <DetailRow label="Payment ID" value={order.paymentId} />
                          )}
                          {order.address && (
                            <Box mt={1}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                mb={0.5}
                              >
                                Delivered to
                              </Typography>
                              <Typography fontSize={13}>
                                {order.address.fullName
                                  ? `${order.address.fullName} · `
                                  : ""}
                                {formatAddress(order.address)}
                              </Typography>
                              {(order.address.phone || order.address.email) && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  mt={0.5}
                                >
                                  {[order.address.phone, order.address.email]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Paper>
                      ))
                    )}
                  </Stack>
                )}

                {activeTab === 2 && (
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} mb={2}>
                      Edit customer
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Full name"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="Phone"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleEditChange}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        select
                        label="Role"
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        fullWidth
                        size="small"
                      >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                      </TextField>

                    <Stack direction="row" spacing={1.5} pt={1}>
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => askDeleteUser(detail)}
                          disabled={saving || deleting}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={saveUser}
                          disabled={saving || !editForm.name.trim() || !editForm.email.trim()}
                          sx={{ bgcolor: "#0f766e", "&:hover": { bgcolor: "#0d9488" } }}
                        >
                          {saving ? "Saving…" : "Save changes"}
                        </Button>
                      </Stack>
                      <Button
                        variant="text"
                        fullWidth
                        onClick={() => setActiveTab(0)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </>
            )}
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        sx={{ zIndex: 2100 }}
      >
        <DialogTitle>Delete user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove{" "}
            <strong>{deleteTarget?.name || "this user"}</strong>
            {deleteTarget?.email ? ` (${deleteTarget.email})` : ""}. Their past
            orders will remain in the system, but the account will no longer be
            accessible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDeleteUser}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete user"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
