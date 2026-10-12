import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
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

export default function InboxMessages() {
  const [tab, setTab] = useState(0);
  const [messages, setMessages] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const base = process.env.REACT_APP_BASEURL;
      const [msgRes, subRes] = await Promise.all([
        fetch(`${base}/contact/messages`, { headers: authHeaders() }),
        fetch(`${base}/contact/newsletter/subscribers`, {
          headers: authHeaders(),
        }),
      ]);

      const msgData = await msgRes.json();
      const subData = await subRes.json();

      if (!msgRes.ok) throw new Error(msgData.message || "Failed to load contacts");
      if (!subRes.ok)
        throw new Error(subData.message || "Failed to load subscribers");

      setMessages(msgData.messages || []);
      setSubscribers(subData.subscribers || []);
    } catch (err) {
      showSnack(err.message || "Failed to load inbox", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setPage(0);
  }, [search, tab]);

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.isRead).length,
    [messages]
  );

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.subject?.toLowerCase().includes(q) ||
        m.message?.toLowerCase().includes(q)
    );
  }, [messages, search]);

  const filteredSubscribers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email?.toLowerCase().includes(q));
  }, [subscribers, search]);

  const rows = tab === 0 ? filteredMessages : filteredSubscribers;
  const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      try {
        await fetch(
          `${process.env.REACT_APP_BASEURL}/contact/messages/${message._id}/read`,
          {
            method: "PATCH",
            headers: authHeaders(),
          }
        );
        setMessages((prev) =>
          prev.map((m) =>
            m._id === message._id ? { ...m, isRead: true } : m
          )
        );
      } catch {
        /* ignore mark-read errors */
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const isContact = deleteTarget.kind === "contact";
      const url = isContact
        ? `${process.env.REACT_APP_BASEURL}/contact/messages/${deleteTarget.id}`
        : `${process.env.REACT_APP_BASEURL}/contact/newsletter/subscribers/${deleteTarget.id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      if (isContact) {
        setMessages((prev) => prev.filter((m) => m._id !== deleteTarget.id));
        if (selectedMessage?._id === deleteTarget.id) setSelectedMessage(null);
      } else {
        setSubscribers((prev) =>
          prev.filter((s) => s._id !== deleteTarget.id)
        );
      }
      showSnack(isContact ? "Contact message deleted" : "Subscriber removed");
    } catch (err) {
      showSnack(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
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
              Inbox
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contact form messages and newsletter subscriptions in one place.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<MailOutlineIcon />}
              label={`${messages.length} contacts`}
              sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
            />
            <Chip
              label={`${unreadCount} unread`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              icon={<CampaignOutlinedIcon />}
              label={`${subscribers.length} newsletter`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
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
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{ mb: 2, borderBottom: "1px solid #e2e8f0" }}
          >
            <Tab
              icon={<MailOutlineIcon />}
              iconPosition="start"
              label="From Contact Form"
            />
            <Tab
              icon={<CampaignOutlinedIcon />}
              iconPosition="start"
              label="From Newsletter"
            />
          </Tabs>

          <TextField
            size="small"
            placeholder={
              tab === 0
                ? "Search name, email, subject..."
                : "Search subscriber email..."
            }
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
          ) : tab === 0 ? (
            filteredMessages.length === 0 ? (
              <Alert severity="info">No contact form messages yet.</Alert>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Source</TableCell>
                        <TableCell>From</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Received</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paged.map((message) => (
                        <TableRow
                          key={message._id}
                          hover
                          sx={{
                            bgcolor: message.isRead ? "transparent" : "#f8fafc",
                            cursor: "pointer",
                          }}
                          onClick={() => openMessage(message)}
                        >
                          <TableCell>
                            <Chip
                              size="small"
                              label="Contact"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={message.isRead ? 500 : 700}>
                              {message.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {message.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={message.isRead ? 500 : 700}>
                              {message.subject}
                            </Typography>
                          </TableCell>
                          <TableCell>{formatDate(message.createdAt)}</TableCell>
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Delete">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  setDeleteTarget({
                                    kind: "contact",
                                    id: message._id,
                                  })
                                }
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredMessages.length}
                  page={page}
                  onPageChange={(_, p) => setPage(p)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                />
              </>
            )
          ) : filteredSubscribers.length === 0 ? (
            <Alert severity="info">No newsletter subscribers yet.</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Subscribed</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((sub) => (
                      <TableRow key={sub._id} hover>
                        <TableCell>
                          <Chip
                            size="small"
                            label="Newsletter"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={sub.status || "active"}
                            color={
                              sub.status === "active" ? "success" : "default"
                            }
                          />
                        </TableCell>
                        <TableCell>{formatDate(sub.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Remove">
                            <IconButton
                              color="error"
                              onClick={() =>
                                setDeleteTarget({
                                  kind: "newsletter",
                                  id: sub._id,
                                })
                              }
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredSubscribers.length}
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

      <Dialog
        open={Boolean(selectedMessage)}
        onClose={() => setSelectedMessage(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <MarkEmailReadOutlinedIcon color="primary" />
            <span>Contact Message</span>
            <Chip size="small" label="From Contact Form" color="primary" />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMessage && (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                From
              </Typography>
              <Typography fontWeight={700}>
                {selectedMessage.name} &lt;{selectedMessage.email}&gt;
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subject
              </Typography>
              <Typography fontWeight={600}>{selectedMessage.subject}</Typography>
              <Typography variant="body2" color="text.secondary">
                Message
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: "#f8fafc", whiteSpace: "pre-wrap" }}
              >
                {selectedMessage.message}
              </Paper>
              <Typography variant="caption" color="text.secondary">
                Received {formatDate(selectedMessage.createdAt)}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMessage(null)}>Close</Button>
          {selectedMessage && (
            <Button
              color="error"
              onClick={() =>
                setDeleteTarget({
                  kind: "contact",
                  id: selectedMessage._id,
                })
              }
            >
              Delete
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.kind === "contact"
              ? "Delete this contact form message? This cannot be undone."
              : "Remove this newsletter subscriber?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
