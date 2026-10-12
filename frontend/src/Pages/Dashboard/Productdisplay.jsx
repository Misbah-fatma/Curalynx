import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import { CATEGORY_LABELS, MEDICINE_TYPES } from "../../constants/medicineTypes";
import { sanitizeProductHtml } from "../../utils/sanitizeProductHtml";

const authHeaders = (json = false) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
};

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const stockChip = (qty) => {
  const quantity = Number(qty || 0);
  if (quantity <= 0) return { label: "Out of stock", color: "error" };
  if (quantity <= 10) return { label: "Low stock", color: "warning" };
  return { label: "In stock", color: "success" };
};

const DEFAULT_TABLE = { weight: "", dimensions: "", quantityOfPills: "" };

const htmlToEditableText = (value) => {
  if (value == null) return "";
  if (typeof value !== "string") return String(value);
  return sanitizeProductHtml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const getSection = (sections, type) =>
  (sections || []).find((section) => section.type === type);

const upsertSection = (sections, type, content) => {
  const list = Array.isArray(sections) ? [...sections] : [];
  const index = list.findIndex((section) => section.type === type);
  if (index >= 0) {
    list[index] = { ...list[index], type, content };
  } else if (
    content !== "" &&
    content != null &&
    !(typeof content === "object" && !Object.values(content).some(Boolean))
  ) {
    list.push({ type, content });
  }
  return list;
};

const normalizeProductForEdit = (product) => {
  const sections = Array.isArray(product.sections) ? product.sections : [];
  const descriptionSection = getSection(sections, "description");
  const additionalSection = getSection(sections, "additional_info");
  const tableSection = getSection(sections, "table");

  return {
    ...product,
    sections,
    sectionDescription: htmlToEditableText(descriptionSection?.content || ""),
    sectionAdditionalInfo: htmlToEditableText(additionalSection?.content || ""),
    sectionTable: {
      ...DEFAULT_TABLE,
      ...(typeof tableSection?.content === "object" && tableSection.content
        ? tableSection.content
        : {}),
    },
  };
};

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const showSnack = (message, severity = "success") => {
    setSnackbarMsg(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/products`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) setProducts(Array.isArray(data) ? data : []);
      else showSnack(data.message || "Failed to load products", "error");
    } catch (err) {
      console.error(err);
      showSnack("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesType =
        typeFilter === "all" || product.medicineType === typeFilter;
      const matchesSearch =
        !q ||
        product.name?.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q) ||
        product.medicineType?.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [products, search, typeFilter]);

  useEffect(() => {
    setPage(0);
  }, [search, typeFilter]);

  const stats = useMemo(() => {
    const lowStock = products.filter((p) => Number(p.quantity) <= 10).length;
    const outOfStock = products.filter((p) => Number(p.quantity) <= 0).length;
    return { total: products.length, lowStock, outOfStock };
  }, [products]);

  const openEdit = (product, tab = 0) => {
    setSelectedProduct(normalizeProductForEdit(product));
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const closeEdit = () => {
    setDrawerOpen(false);
    setSelectedProduct(null);
    setDrawerTab(0);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleTableChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prev) => ({
      ...prev,
      sectionTable: { ...prev.sectionTable, [name]: value },
    }));
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct?._id) return;
    setSaving(true);
    try {
      let sections = Array.isArray(selectedProduct.sections)
        ? [...selectedProduct.sections]
        : [];

      sections = upsertSection(
        sections,
        "description",
        selectedProduct.sectionDescription?.trim() || ""
      );
      sections = upsertSection(
        sections,
        "additional_info",
        selectedProduct.sectionAdditionalInfo?.trim() || ""
      );
      sections = upsertSection(sections, "table", {
        weight: selectedProduct.sectionTable?.weight || "",
        dimensions: selectedProduct.sectionTable?.dimensions || "",
        quantityOfPills: selectedProduct.sectionTable?.quantityOfPills || "",
      });

      // Drop empty text sections
      sections = sections.filter((section) => {
        if (section.type === "table") {
          const c = section.content || {};
          return Boolean(c.weight || c.dimensions || c.quantityOfPills);
        }
        if (typeof section.content === "string") {
          return section.content.trim().length > 0;
        }
        return true;
      });

      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/products/update/${selectedProduct._id}`,
        {
          method: "PUT",
          headers: authHeaders(true),
          body: JSON.stringify({
            name: selectedProduct.name,
            category: selectedProduct.category,
            price: Number(selectedProduct.price),
            quantity: Number(selectedProduct.quantity),
            description: selectedProduct.description,
            medicineType: selectedProduct.medicineType,
            sections,
          }),
        }
      );

      if (!res.ok) {
        showSnack("Failed to update product", "error");
        return;
      }

      const updated = await res.json();
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      setSelectedProduct(normalizeProductForEdit(updated));
      showSnack("Product updated successfully");
    } catch {
      showSnack("Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  };

  const askDelete = (product) => {
    setDeleteTarget(product);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/products/delete/${deleteTarget._id}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
        if (selectedProduct?._id === deleteTarget._id) closeEdit();
        showSnack("Product deleted successfully");
      } else {
        showSnack("Failed to delete product", "error");
      }
    } catch {
      showSnack("Something went wrong", "error");
    } finally {
      setDeleting(false);
      setOpenDelete(false);
      setDeleteTarget(null);
    }
  };

  const paged = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <>
      <Box sx={{ py: { xs: 1, md: 1.5 } }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
            sx={{ mb: 0.5 }}
          >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Products
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Search, update stock, and manage your medicine catalog.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<Inventory2OutlinedIcon />}
              label={`${stats.total} total`}
              sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }}
            />
            <Chip
              label={`${stats.lowStock} low stock`}
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`${stats.outOfStock} out of stock`}
              color="error"
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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            mb={3}
          >
            <TextField
              size="small"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              size="small"
              label="Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: { sm: 220 } }}
            >
              <MenuItem value="all">All types</MenuItem>
              {MEDICINE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {loading ? (
            <Box py={8} textAlign="center">
              <CircularProgress size={32} />
            </Box>
          ) : filteredProducts.length === 0 ? (
            <Box py={6} textAlign="center">
              <Typography color="text.secondary">
                No products match your filters.
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 560 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Price
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paged.map((product) => {
                      const stock = stockChip(product.quantity);
                      return (
                        <TableRow
                          hover
                          key={product._id}
                          sx={{ cursor: "pointer" }}
                          onClick={() => openEdit(product)}
                        >
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                variant="rounded"
                                src={product.image || undefined}
                                alt={product.name}
                                sx={{
                                  width: 48,
                                  height: 48,
                                  bgcolor: "#ecfdf5",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {(product.name || "?").charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600} fontSize={14}>
                                  {product.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {product.category || "—"}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                CATEGORY_LABELS[product.medicineType] ||
                                product.medicineType ||
                                "—"
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatMoney(product.price)}
                          </TableCell>
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography fontSize={13} fontWeight={600}>
                                {product.quantity ?? 0} units
                              </Typography>
                              <Chip
                                size="small"
                                label={stock.label}
                                color={stock.color}
                                sx={{ width: "fit-content" }}
                              />
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 240 }}>
                            <Typography
                              fontSize={13}
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {product.description || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEdit(product)}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => askDelete(product)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredProducts.length}
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
      </Box>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={closeEdit}
        ModalProps={{ sx: { zIndex: 2000 } }}
        sx={{ zIndex: 2000, "& .MuiDrawer-paper": { zIndex: 2000 } }}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 520, md: 560 },
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
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  variant="rounded"
                  src={selectedProduct?.image || undefined}
                  sx={{ width: 56, height: 56, bgcolor: "#ecfdf5" }}
                >
                  {(selectedProduct?.name || "?").charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                    {selectedProduct?.name || "Product"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {CATEGORY_LABELS[selectedProduct?.medicineType] ||
                      selectedProduct?.medicineType ||
                      "Medicine details"}
                  </Typography>
                  {selectedProduct && (
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip
                        size="small"
                        label={stockChip(selectedProduct.quantity).label}
                        color={stockChip(selectedProduct.quantity).color}
                      />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={formatMoney(selectedProduct.price)}
                      />
                    </Stack>
                  )}
                </Box>
              </Stack>
              <IconButton onClick={closeEdit} size="small">
                <CloseIcon />
              </IconButton>
            </Stack>

            <Tabs
              value={drawerTab}
              onChange={(_, value) => setDrawerTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mt: 2, minHeight: 40 }}
            >
              <Tab
                icon={<InfoOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Details"
                sx={{ minHeight: 40, textTransform: "none" }}
              />
              <Tab
                icon={<DescriptionOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Description"
                sx={{ minHeight: 40, textTransform: "none" }}
              />
              <Tab
                icon={<EditOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Extra Info"
                sx={{ minHeight: 40, textTransform: "none" }}
              />
              <Tab
                icon={<TableChartOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Specs"
                sx={{ minHeight: 40, textTransform: "none" }}
              />
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            {selectedProduct && (
              <Stack spacing={2}>
                {drawerTab === 0 && (
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                      BASIC DETAILS
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Product name"
                        name="name"
                        size="small"
                        fullWidth
                        value={selectedProduct.name || ""}
                        onChange={handleEditChange}
                      />
                      <TextField
                        select
                        label="Medicine type"
                        name="medicineType"
                        size="small"
                        fullWidth
                        value={selectedProduct.medicineType || ""}
                        onChange={handleEditChange}
                      >
                        {MEDICINE_TYPES.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Category"
                        name="category"
                        size="small"
                        fullWidth
                        value={selectedProduct.category || ""}
                        onChange={handleEditChange}
                      />
                      <Stack direction="row" spacing={1.5}>
                        <TextField
                          label="Price"
                          name="price"
                          type="number"
                          size="small"
                          fullWidth
                          value={selectedProduct.price ?? ""}
                          onChange={handleEditChange}
                          inputProps={{ step: "0.01", min: "0" }}
                        />
                        <TextField
                          label="Quantity"
                          name="quantity"
                          type="number"
                          size="small"
                          fullWidth
                          value={selectedProduct.quantity ?? ""}
                          onChange={handleEditChange}
                          inputProps={{ min: "0" }}
                        />
                      </Stack>
                      <TextField
                        label="Short description"
                        name="description"
                        size="small"
                        fullWidth
                        multiline
                        minRows={3}
                        value={selectedProduct.description || ""}
                        onChange={handleEditChange}
                        helperText="Shown on the product card and summary"
                      />
                    </Stack>
                  </Paper>
                )}

                {drawerTab === 1 && (
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
                      FULL DESCRIPTION
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Appears under the Description tab on the product details page.
                    </Typography>
                    <TextField
                      label="Description content"
                      size="small"
                      fullWidth
                      multiline
                      minRows={12}
                      value={selectedProduct.sectionDescription || ""}
                      onChange={(e) =>
                        setSelectedProduct((prev) => ({
                          ...prev,
                          sectionDescription: e.target.value,
                        }))
                      }
                      placeholder="Write the detailed product description customers should see…"
                    />
                  </Paper>
                )}

                {drawerTab === 2 && (
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
                      ADDITIONAL INFORMATION
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Extra guidance, warnings, or usage notes for this medicine.
                    </Typography>
                    <TextField
                      label="Additional info"
                      size="small"
                      fullWidth
                      multiline
                      minRows={12}
                      value={selectedProduct.sectionAdditionalInfo || ""}
                      onChange={(e) =>
                        setSelectedProduct((prev) => ({
                          ...prev,
                          sectionAdditionalInfo: e.target.value,
                        }))
                      }
                      placeholder="Add storage instructions, side effects, dosage notes…"
                    />
                  </Paper>
                )}

                {drawerTab === 3 && (
                  <Paper
                    elevation={0}
                    sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1}>
                      PRODUCT SPECS / TABLE DATA
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Structured details shown in the Specs table on the product page.
                    </Typography>
                    <Stack spacing={2}>
                      <TextField
                        label="Weight"
                        name="weight"
                        size="small"
                        fullWidth
                        value={selectedProduct.sectionTable?.weight || ""}
                        onChange={handleTableChange}
                        placeholder="e.g. 50 g"
                      />
                      <TextField
                        label="Dimensions"
                        name="dimensions"
                        size="small"
                        fullWidth
                        value={selectedProduct.sectionTable?.dimensions || ""}
                        onChange={handleTableChange}
                        placeholder="e.g. 10 x 5 x 2 cm"
                      />
                      <TextField
                        label="Quantity of pills"
                        name="quantityOfPills"
                        size="small"
                        fullWidth
                        value={selectedProduct.sectionTable?.quantityOfPills || ""}
                        onChange={handleTableChange}
                        placeholder="e.g. 30"
                      />
                    </Stack>
                  </Paper>
                )}

                <Divider />

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => askDelete(selectedProduct)}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleUpdateProduct}
                    disabled={saving || !selectedProduct.name?.trim()}
                    sx={{
                      bgcolor: "#0f766e",
                      "&:hover": { bgcolor: "#0d9488" },
                    }}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={openDelete}
        onClose={() => !deleting && setOpenDelete(false)}
        sx={{ zIndex: 2100 }}
      >
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently remove{" "}
            <strong>{deleteTarget?.name || "this product"}</strong> from your
            catalog. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDelete(false)} disabled={deleting}>
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
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ zIndex: 2200 }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}
