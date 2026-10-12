import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { MEDICINE_TYPES } from "../../constants/medicineTypes";

const SECTION_OPTIONS = [
  { type: "description", label: "Description" },
  { type: "additional_info", label: "Additional Info" },
  { type: "table", label: "Table Data" },
  { type: "review", label: "Review" },
];

const emptyForm = {
  name: "",
  category: "",
  quantity: "",
  price: "",
  description: "",
};

export default function AddProduct() {
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [medicineType, setMedicineType] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [sections, setSections] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const typeLabel = useMemo(
    () => MEDICINE_TYPES.find((t) => t.value === medicineType)?.label || "",
    [medicineType]
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSection = (type) => {
    if (type === "table") {
      setSections((prev) => [
        ...prev,
        {
          type: "table",
          content: { weight: "", dimensions: "", quantityOfPills: "" },
        },
      ]);
      return;
    }
    setSections((prev) => [...prev, { type, content: "" }]);
  };

  const updateSection = (index, value) => {
    setSections((prev) =>
      prev.map((section, i) => (i === index ? { ...section, content: value } : section))
    );
  };

  const removeSection = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setMedicineType("");
    setSections([]);
    clearImage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!medicineType) {
      setError("Please select a medicine type");
      return;
    }
    if (!form.name.trim() || !form.category.trim() || !form.description.trim()) {
      setError("Please fill in all required product fields");
      return;
    }
    if (!imageFile) {
      setError("Please upload a product image");
      return;
    }

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("category", form.category.trim());
    data.append("quantity", form.quantity);
    data.append("price", form.price);
    data.append("description", form.description.trim());
    data.append("medicineType", medicineType);
    data.append("sections", JSON.stringify(sections));
    data.append("image", imageFile);

    try {
      setSubmitting(true);
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Failed to add product");
        return;
      }

      setSuccess("Product added successfully!");
      resetForm();
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        pt: { xs: 1, md: 2 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Add Product
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create a new medicine listing with image, stock, and detail sections.
          </Typography>
        </Box>
        {typeLabel && (
          <Chip
            icon={<Inventory2OutlinedIcon />}
            label={typeLabel}
            sx={{ bgcolor: "#ecfdf5", color: "#0f766e", fontWeight: 600 }}
          />
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5}>
              1. MEDICINE TYPE
            </Typography>
            <TextField
              select
              fullWidth
              label="Select medicine type"
              value={medicineType}
              onChange={(e) => setMedicineType(e.target.value)}
              required
              size="small"
            >
              {MEDICINE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Paper>

          {medicineType && (
            <>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5}>
                  2. BASIC DETAILS
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Product name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Category"
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    required
                    helperText="Shown on product cards (e.g. Tablets, Capsules)"
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Quantity in stock"
                    name="quantity"
                    type="number"
                    value={form.quantity}
                    onChange={handleFormChange}
                    required
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Price (USD)"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleFormChange}
                    required
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    label="Short description"
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    required
                    multiline
                    minRows={3}
                    sx={{ gridColumn: { md: "1 / -1" } }}
                  />
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5}>
                  3. PRODUCT IMAGE
                </Typography>

                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: "1.5px dashed #cbd5e1",
                    borderRadius: 2.5,
                    bgcolor: "#f8fafc",
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "border-color 0.2s, background 0.2s",
                    "&:hover": { borderColor: "#0f766e", bgcolor: "#f0fdfa" },
                  }}
                >
                  {imagePreview ? (
                    <Stack spacing={1.5} alignItems="center">
                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Preview"
                        sx={{
                          width: 140,
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Typography fontSize={14} fontWeight={600}>
                        {imageFile?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to replace image
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={1} alignItems="center">
                      <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: "#0f766e" }} />
                      <Typography fontWeight={600}>Upload product image</Typography>
                      <Typography variant="body2" color="text.secondary">
                        PNG or JPG recommended. Click to browse.
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />

                {imagePreview && (
                  <Button
                    startIcon={<DeleteOutlineIcon />}
                    color="error"
                    size="small"
                    sx={{ mt: 1.5 }}
                    onClick={clearImage}
                  >
                    Remove image
                  </Button>
                )}
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1.5}
                  mb={2}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                      4. EXTRA SECTIONS
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      Optional detail blocks for the product page
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {SECTION_OPTIONS.map((option) => (
                      <Button
                        key={option.type}
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => addSection(option.type)}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </Stack>
                </Stack>

                {sections.length === 0 ? (
                  <Box
                    sx={{
                      py: 3,
                      px: 2,
                      textAlign: "center",
                      borderRadius: 2,
                      bgcolor: "#f8fafc",
                      border: "1px dashed #e2e8f0",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No extra sections yet. Add description, specs, or reviews if needed.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {sections.map((section, index) => (
                      <Paper
                        key={`${section.type}-${index}`}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2, bgcolor: "#fff" }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Chip
                            size="small"
                            label={section.type.replace("_", " ")}
                            sx={{ textTransform: "capitalize", fontWeight: 600 }}
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeSection(index)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>

                        {section.type !== "table" ? (
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            size="small"
                            label="Content"
                            value={section.content}
                            onChange={(e) => updateSection(index, e.target.value)}
                          />
                        ) : (
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                              gap: 1.5,
                            }}
                          >
                            <TextField
                              fullWidth
                              size="small"
                              label="Weight"
                              value={section.content.weight}
                              onChange={(e) =>
                                updateSection(index, {
                                  ...section.content,
                                  weight: e.target.value,
                                })
                              }
                            />
                            <TextField
                              fullWidth
                              size="small"
                              label="Dimensions"
                              value={section.content.dimensions}
                              onChange={(e) =>
                                updateSection(index, {
                                  ...section.content,
                                  dimensions: e.target.value,
                                })
                              }
                            />
                            <TextField
                              fullWidth
                              size="small"
                              label="Quantity of pills"
                              type="number"
                              value={section.content.quantityOfPills}
                              onChange={(e) =>
                                updateSection(index, {
                                  ...section.content,
                                  quantityOfPills: e.target.value,
                                })
                              }
                            />
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>

              <Box sx={{ pt: 1, pb: 1 }}>
                <Divider sx={{ mb: 2.5 }} />
                <Stack
                  direction="row"
                  spacing={1.5}
                  justifyContent="flex-end"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Button
                    type="button"
                    variant="outlined"
                    size="medium"
                    disabled={submitting}
                    onClick={resetForm}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2.5,
                      minWidth: 110,
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="medium"
                    disabled={submitting}
                    sx={{
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      minWidth: 140,
                      fontWeight: 600,
                      bgcolor: "#0f766e",
                      "&:hover": { bgcolor: "#0d9488" },
                    }}
                  >
                    {submitting ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} color="inherit" />
                        <span>Saving…</span>
                      </Stack>
                    ) : (
                      "Add product"
                    )}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
