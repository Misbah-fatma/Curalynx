import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
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
  Rating,
  Stack,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";

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

export default function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/reviews`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reviews");
      setReviews(data.reviews || []);
    } catch (err) {
      showSnack(err.message || "Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter(
      (review) =>
        review.name?.toLowerCase().includes(q) ||
        review.comment?.toLowerCase().includes(q) ||
        review.product?.name?.toLowerCase().includes(q)
    );
  }, [reviews, search]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const stats = useMemo(() => {
    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    return { total: reviews.length, avg, fiveStar };
  }, [reviews]);

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/reviews/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      showSnack("Review deleted");
      setDeleteTarget(null);
    } catch (err) {
      showSnack(err.message || "Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Reviews
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor customer feedback across all medicines.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<RateReviewOutlinedIcon />}
              label={`${stats.total} total`}
              sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
            />
            <Chip
              label={`Avg ${stats.avg.toFixed(1)} ★`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`${stats.fiveStar} five-star`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
          }}
        >
          <TextField
            size="small"
            placeholder="Search by customer, comment, or product…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ mb: 2.5 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
            <Box py={8} textAlign="center">
              <CircularProgress size={32} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box py={6} textAlign="center">
              <Typography color="text.secondary">No reviews found.</Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Review</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((review) => (
                      <TableRow key={review._id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              variant="rounded"
                              src={review.product?.image || undefined}
                              sx={{ width: 44, height: 44, bgcolor: "#ecfdf5" }}
                            >
                              {(review.product?.name || "?").charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} fontSize={14}>
                                {review.product?.name || "Deleted product"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {review.product?.category || "—"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600} fontSize={14}>
                            {review.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Rating value={review.rating || 0} readOnly size="small" />
                            <Typography fontSize={13} color="text.secondary">
                              {review.rating}/5
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 320 }}>
                          <Typography
                            fontSize={13}
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {review.comment}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontSize={13}>{formatDate(review.createdAt)}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete review">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(review)}
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

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filtered.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(+e.target.value);
                  setPage(0);
                }}
                sx={{ mt: 1, borderTop: "1px solid #e2e8f0", pt: 1 }}
              />
            </>
          )}
        </Paper>
      </Stack>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        sx={{ zIndex: 2100 }}
      >
        <DialogTitle>Delete review?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove the review by{" "}
            <strong>{deleteTarget?.name}</strong>
            {deleteTarget?.product?.name
              ? ` on ${deleteTarget.product.name}`
              : ""}
            .
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
