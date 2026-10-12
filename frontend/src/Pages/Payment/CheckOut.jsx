import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Stack,
  Chip,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import { useCart } from "../../Context/CartContext";

import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentsIcon from "@mui/icons-material/Payments";
import CurrencyBitcoinIcon from "@mui/icons-material/CurrencyBitcoin";

const paymentDetails = {
  zelle: {
    label: "Zelle",
    icon: <AccountBalanceIcon />,
    info: "zelle@email.com",
  },
  venmo: {
    label: "Venmo",
    icon: <PaymentsIcon />,
    info: "@yourVenmo",
  },
  cashapp: {
    label: "Cash App",
    icon: <PaymentsIcon />,
    info: "$YourCashTag",
  },
  crypto: {
    label: "Crypto",
    icon: <CurrencyBitcoinIcon />,
    info: "BTC: bc1qxyz...",
    warning: "Send exact amount only",
  },
};

const STEPS = ["Delivery & Contact", "Payment", "Confirm Order"];

const emptyRecipient = { name: "", phone: "", email: "" };

const formatAddress = (addr) => {
  if (!addr) return "";
  return [
    addr.addressLine1,
    addr.addressLine2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.country, addr.zipCode].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(", ");
};

export default function CheckoutPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setCart } = useCart();

  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [recipient, setRecipient] = useState(emptyRecipient);
  const [profileDefaults, setProfileDefaults] = useState(emptyRecipient);

  useEffect(() => {
    if (!state?.cart) navigate("/cart");
  }, [state, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        setProfileError("");
        const res = await fetch(`${process.env.REACT_APP_BASEURL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        const defaults = {
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
        };
        setProfileDefaults(defaults);

        const saved = Array.isArray(data.addresses) ? data.addresses : [];
        setAddresses(saved);

        if (saved.length > 0) {
          const first = saved[0];
          setSelectedAddressId(first._id);
          setRecipient({
            name: first.fullName || defaults.name,
            phone: first.phone || defaults.phone,
            email: first.email || defaults.email,
          });
        } else {
          setRecipient(defaults);
        }
      } catch (err) {
        setProfileError(err.message || "Failed to load your addresses");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );

  if (!state?.cart) return null;

  const { cart, totalPrice } = state;

  const applyAddressSelection = (addressId) => {
    setSelectedAddressId(addressId);
    const addr = addresses.find((a) => a._id === addressId);
    if (!addr) return;
    setRecipient({
      name: addr.fullName || profileDefaults.name,
      phone: addr.phone || profileDefaults.phone,
      email: addr.email || profileDefaults.email,
    });
  };

  const handleRecipientChange = (e) => {
    const { name, value } = e.target;
    setRecipient((prev) => ({ ...prev, [name]: value }));
  };

  const deliveryReady =
    Boolean(selectedAddressId) &&
    recipient.name.trim() &&
    recipient.phone.trim() &&
    recipient.email.trim();

  const paymentReady = Boolean(paymentMethod) && paymentId.trim().length > 0;

  const goNext = () => {
    if (activeStep === 0 && !deliveryReady) {
      alert("Please select an address and fill in recipient details.");
      return;
    }
    if (activeStep === 1 && !paymentReady) {
      alert("Please choose a payment method and enter your Payment ID.");
      return;
    }
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const submitOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.REACT_APP_BASEURL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart,
          amount: totalPrice,
          paymentMethod,
          paymentId: paymentId.trim(),
          addressId: selectedAddressId,
          recipient: {
            name: recipient.name.trim(),
            phone: recipient.phone.trim(),
            email: recipient.email.trim(),
          },
          shippingAddress: selectedAddress
            ? {
                addressLine1: selectedAddress.addressLine1,
                addressLine2: selectedAddress.addressLine2,
                city: selectedAddress.city,
                state: selectedAddress.state,
                country: selectedAddress.country,
                zipCode: selectedAddress.zipCode,
              }
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCart([]);
      navigate("/cart", {
        replace: true,
        state: {
          orderSuccess: true,
          order: data.order || data,
          message: data.message,
        },
      });
    } catch (err) {
      alert(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const orderSummary = (
    <Paper
      sx={{
        flex: 1,
        p: 3,
        position: { md: "sticky" },
        top: 100,
        height: "fit-content",
      }}
    >
      <Typography variant="h6" fontWeight={600} mb={2}>
        Order Summary
      </Typography>

      {cart.map((item) => (
        <Box key={item._id} mb={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={500}>
              {item.name} × {item.qty}
            </Typography>
            <Typography>${(item.price * item.qty).toFixed(2)}</Typography>
          </Stack>
          {item.category && (
            <Typography fontSize={13} color="text.secondary">
              {item.category}
            </Typography>
          )}
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" justifyContent="space-between">
        <Typography fontWeight={700}>Total</Typography>
        <Typography fontWeight={700}>${Number(totalPrice).toFixed(2)}</Typography>
      </Stack>
    </Paper>
  );

  return (
    <>
      <Navbar />

      <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" fontWeight="bold" mb={2}>
          Secure Checkout
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {orderSummary}

          <Paper sx={{ flex: 1.2, p: { xs: 2.5, md: 4 } }}>
            {profileLoading ? (
              <Box py={6} textAlign="center">
                <CircularProgress size={32} />
                <Typography mt={2} color="text.secondary">
                  Loading your saved addresses…
                </Typography>
              </Box>
            ) : profileError ? (
              <Alert severity="error">{profileError}</Alert>
            ) : (
              <>
                {/* STEP 1 — Delivery & Contact */}
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      Delivery Address
                    </Typography>
                    <Typography fontSize={14} color="text.secondary" mb={2}>
                      Choose a saved address. Recipient details will fill in
                      automatically — you can edit them before continuing.
                    </Typography>

                    {addresses.length === 0 ? (
                      <Alert
                        severity="warning"
                        action={
                          <Button color="inherit" size="small" component={Link} to="/profile">
                            Add Address
                          </Button>
                        }
                      >
                        You have no saved addresses. Add one in your profile first.
                      </Alert>
                    ) : (
                      <RadioGroup
                        value={selectedAddressId}
                        onChange={(e) => applyAddressSelection(e.target.value)}
                      >
                        {addresses.map((addr) => (
                          <Paper
                            key={addr._id}
                            variant="outlined"
                            sx={{
                              mb: 1.5,
                              p: 2,
                              borderRadius: 2,
                              borderColor:
                                selectedAddressId === addr._id
                                  ? "primary.main"
                                  : "divider",
                            }}
                          >
                            <FormControlLabel
                              value={addr._id}
                              control={<Radio />}
                              sx={{ alignItems: "flex-start", m: 0, width: "100%" }}
                              label={
                                <Box>
                                  {(addr.fullName || addr.phone) && (
                                    <Typography fontWeight={600} fontSize={14}>
                                      {addr.fullName || "Saved recipient"}
                                      {addr.phone ? ` · ${addr.phone}` : ""}
                                    </Typography>
                                  )}
                                  <Typography fontSize={14}>
                                    {formatAddress(addr)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </Paper>
                        ))}
                      </RadioGroup>
                    )}

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" fontWeight={600} mb={2}>
                      Recipient Details
                    </Typography>

                    <Stack spacing={2}>
                      <TextField
                        label="Full Name"
                        name="name"
                        value={recipient.name}
                        onChange={handleRecipientChange}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Phone Number"
                        name="phone"
                        value={recipient.phone}
                        onChange={handleRecipientChange}
                        fullWidth
                        required
                      />
                      <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={recipient.email}
                        onChange={handleRecipientChange}
                        fullWidth
                        required
                      />
                    </Stack>

                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      sx={{ mt: 3, py: 1.5 }}
                      disabled={!deliveryReady}
                      onClick={goNext}
                    >
                      Continue to Payment
                    </Button>
                  </Box>
                )}

                {/* STEP 2 — Payment */}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} mb={3}>
                      Choose Payment Method
                    </Typography>

                    <RadioGroup
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      {Object.entries(paymentDetails).map(([key, method]) => (
                        <Paper
                          key={key}
                          variant="outlined"
                          sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 2,
                            borderColor:
                              paymentMethod === key ? "primary.main" : "divider",
                          }}
                        >
                          <FormControlLabel
                            value={key}
                            control={<Radio />}
                            label={
                              <Stack direction="row" spacing={2} alignItems="center">
                                {method.icon}
                                <Typography fontWeight={600}>{method.label}</Typography>
                              </Stack>
                            }
                          />

                          {paymentMethod === key && (
                            <Box sx={{ ml: 4, mt: 2 }}>
                              <Chip
                                label={method.info}
                                color="primary"
                                variant="outlined"
                              />

                              {method.warning && (
                                <Typography fontSize={12} color="error" mt={1}>
                                  ⚠ {method.warning}
                                </Typography>
                              )}

                              <Box mt={2}>
                                <TextField
                                  label="Payment ID / Transaction ID"
                                  value={paymentId}
                                  onChange={(e) => setPaymentId(e.target.value)}
                                  placeholder="e.g. TXN123456"
                                  fullWidth
                                  size="small"
                                />
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </RadioGroup>

                    <Stack direction="row" spacing={2} mt={3}>
                      <Button fullWidth variant="outlined" onClick={goBack}>
                        Back
                      </Button>
                      <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        disabled={!paymentReady}
                        onClick={goNext}
                      >
                        Review Order
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* STEP 3 — Confirm */}
                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      Confirm Your Order
                    </Typography>
                    <Typography fontSize={14} color="text.secondary" mb={3}>
                      Please verify everything below. Use Edit to change details
                      before placing your order.
                    </Typography>

                    <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1.5}
                      >
                        <Typography fontWeight={700}>Delivery Address</Typography>
                        <Button size="small" onClick={() => setActiveStep(0)}>
                          Edit
                        </Button>
                      </Stack>
                      <Typography fontSize={14}>{formatAddress(selectedAddress)}</Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1.5}
                      >
                        <Typography fontWeight={700}>Contact Details</Typography>
                        <Button size="small" onClick={() => setActiveStep(0)}>
                          Edit
                        </Button>
                      </Stack>
                      <Typography fontSize={14}>
                        <strong>Name:</strong> {recipient.name}
                      </Typography>
                      <Typography fontSize={14}>
                        <strong>Phone:</strong> {recipient.phone}
                      </Typography>
                      <Typography fontSize={14}>
                        <strong>Email:</strong> {recipient.email}
                      </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1.5}
                      >
                        <Typography fontWeight={700}>Payment</Typography>
                        <Button size="small" onClick={() => setActiveStep(1)}>
                          Edit
                        </Button>
                      </Stack>
                      <Typography fontSize={14}>
                        <strong>Method:</strong>{" "}
                        {paymentDetails[paymentMethod]?.label || paymentMethod}
                      </Typography>
                      <Typography fontSize={14}>
                        <strong>Payment ID:</strong> {paymentId}
                      </Typography>
                    </Paper>

                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
                      <Typography fontWeight={700} mb={1.5}>
                        Items
                      </Typography>
                      {cart.map((item) => (
                        <Stack
                          key={item._id}
                          direction="row"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography fontSize={14}>
                            {item.name} × {item.qty}
                          </Typography>
                          <Typography fontSize={14}>
                            ${(item.price * item.qty).toFixed(2)}
                          </Typography>
                        </Stack>
                      ))}
                      <Divider sx={{ my: 1.5 }} />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={700}>Total</Typography>
                        <Typography fontWeight={700}>
                          ${Number(totalPrice).toFixed(2)}
                        </Typography>
                      </Stack>
                    </Paper>

                    <Stack direction="row" spacing={2}>
                      <Button fullWidth variant="outlined" onClick={goBack} disabled={loading}>
                        Back
                      </Button>
                      <Button
                        fullWidth
                        size="large"
                        variant="contained"
                        disabled={loading || !deliveryReady || !paymentReady}
                        onClick={submitOrder}
                      >
                        {loading ? "Placing Order..." : "Confirm & Place Order"}
                      </Button>
                    </Stack>

                    <Typography
                      fontSize={12}
                      color="text.secondary"
                      mt={2}
                      textAlign="center"
                    >
                      Payments are verified manually. You’ll be notified once
                      confirmed.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Stack>
      </Box>

      <Footer />
    </>
  );
}
