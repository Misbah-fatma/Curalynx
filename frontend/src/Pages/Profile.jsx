import { useEffect, useRef, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const DEFAULT_AVATAR =
  "https://ssl.gstatic.com/accounts/ui/avatar_2x.png";

const emptyAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
};

const formatAddress = (addr) =>
  [
    addr.addressLine1,
    addr.addressLine2,
    [addr.city, addr.state].filter(Boolean).join(", "),
    [addr.country, addr.zipCode].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(", ");

const Profile = () => {
  const token = localStorage.getItem("token");
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    addresses: [],
  });

  const [newAddress, setNewAddress] = useState(emptyAddress);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3500);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
        addresses: data.addresses || [],
      });

      if (data.name) localStorage.setItem("userName", data.name);
      if (data.avatar) localStorage.setItem("userAvatar", data.avatar);
    } catch (err) {
      showMessage("error", err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          addresses: formData.addresses,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      if (data.user?.name) {
        localStorage.setItem("userName", data.user.name);
        setFormData((prev) => ({ ...prev, ...data.user }));
      }
      showMessage("success", "Profile updated successfully");
    } catch (err) {
      showMessage("error", err.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("error", "Please choose an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "Image must be under 5MB");
      return;
    }

    const body = new FormData();
    body.append("avatar", file);

    try {
      setUploading(true);
      const res = await fetch(
        `${process.env.REACT_APP_BASEURL}/auth/profile/avatar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      setFormData((prev) => ({ ...prev, avatar: data.avatar }));
      localStorage.setItem("userAvatar", data.avatar);
      showMessage("success", "Profile photo updated");
    } catch (err) {
      showMessage("error", err.message || "Avatar upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const addAddress = async () => {
    if (!newAddress.addressLine1.trim() || !newAddress.city.trim()) {
      showMessage("error", "Address line 1 and city are required");
      return;
    }

    const updatedAddresses = [...formData.addresses, { ...newAddress }];
    setSaving(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          addresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save address");

      setFormData((prev) => ({
        ...prev,
        addresses: data.user?.addresses || updatedAddresses,
      }));
      setNewAddress(emptyAddress);
      showMessage("success", "Address saved");
    } catch (err) {
      showMessage("error", err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const removeAddress = async (index) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
    setSaving(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BASEURL}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          addresses: updatedAddresses,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove address");

      setFormData((prev) => ({
        ...prev,
        addresses: data.user?.addresses || updatedAddresses,
      }));
      showMessage("success", "Address removed");
    } catch (err) {
      showMessage("error", err.message || "Failed to remove address");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = formData.avatar || DEFAULT_AVATAR;

  return (
    <>
      <Navbar />
      <section className="profile-page area-padding bg-light">
        <div className="container py-4 py-md-5">
          {loading ? (
            <div className="text-center py-5 text-muted">Loading profile…</div>
          ) : (
            <>
              <div className="profile-hero card border-0 shadow-sm mb-4">
                <div className="card-body p-4 p-md-5">
                  <div className="row align-items-center g-4">
                    <div className="col-md-auto text-center">
                      <div className="profile-avatar-wrap">
                        <img
                          src={avatarSrc}
                          alt={formData.name || "Profile"}
                          className="profile-avatar"
                        />
                        <button
                          type="button"
                          className="profile-avatar-btn"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? "Uploading…" : "Change photo"}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>
                    <div className="col-md">
                      <p className="text-uppercase text-muted small mb-1 fw-semibold">
                        My Account
                      </p>
                      <h1 className="h3 mb-2 fw-bold">
                        {formData.name || "Your Profile"}
                      </h1>
                      <p className="mb-1 text-muted">{formData.email}</p>
                      {formData.phone && (
                        <p className="mb-0 text-muted">{formData.phone}</p>
                      )}
                      <p className="mb-0 mt-2 small text-muted">
                        {formData.addresses.length} saved address
                        {formData.addresses.length === 1 ? "" : "es"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {message.text && (
                <div
                  className={`alert alert-${
                    message.type === "success" ? "success" : "danger"
                  } mb-4`}
                >
                  {message.text}
                </div>
              )}

              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <ul className="nav profile-modern-tabs px-3 pt-3">
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${
                          activeTab === "profile" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("profile")}
                      >
                        Personal Details
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        type="button"
                        className={`nav-link ${
                          activeTab === "address" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("address")}
                      >
                        Addresses
                      </button>
                    </li>
                  </ul>

                  <div className="p-4 p-md-5">
                    {activeTab === "profile" && (
                      <form onSubmit={handleSubmit}>
                        <h2 className="h5 fw-bold mb-1">Personal details</h2>
                        <p className="text-muted mb-4">
                          Update your name and contact information used for
                          orders.
                        </p>

                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Full name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Email
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              name="email"
                              value={formData.email}
                              disabled
                            />
                            <small className="text-muted">
                              Email cannot be changed here
                            </small>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold">
                              Phone
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Your phone number"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <button
                            type="submit"
                            className="btn btn-dark px-4"
                            disabled={saving}
                          >
                            {saving ? "Saving…" : "Save profile"}
                          </button>
                        </div>
                      </form>
                    )}

                    {activeTab === "address" && (
                      <div>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                          <div>
                            <h2 className="h5 fw-bold mb-1">Saved addresses</h2>
                            <p className="text-muted mb-0">
                              These addresses are available at checkout.
                            </p>
                          </div>
                        </div>

                        {formData.addresses.length === 0 ? (
                          <div className="text-center py-4 border rounded bg-light mb-4">
                            <p className="text-muted mb-0">
                              No addresses saved yet. Add one below.
                            </p>
                          </div>
                        ) : (
                          <div className="row g-3 mb-4">
                            {formData.addresses.map((addr, index) => (
                              <div
                                key={addr._id || index}
                                className="col-md-6"
                              >
                                <div className="profile-address-card h-100">
                                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                                    <div>
                                      <p className="fw-semibold mb-1">
                                        {addr.fullName ||
                                          formData.name ||
                                          "Recipient"}
                                      </p>
                                      {(addr.phone || addr.email) && (
                                        <p className="small text-muted mb-2">
                                          {[addr.phone, addr.email]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger"
                                      disabled={saving}
                                      onClick={() => removeAddress(index)}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  <p className="mb-0 text-secondary small">
                                    {formatAddress(addr)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="border rounded p-3 p-md-4 bg-white">
                          <h3 className="h6 fw-bold mb-3">Add new address</h3>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Recipient name</label>
                              <input
                                className="form-control"
                                name="fullName"
                                value={newAddress.fullName}
                                onChange={handleNewAddressChange}
                                placeholder="Who receives this order"
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Phone</label>
                              <input
                                className="form-control"
                                name="phone"
                                value={newAddress.phone}
                                onChange={handleNewAddressChange}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Email</label>
                              <input
                                className="form-control"
                                type="email"
                                name="email"
                                value={newAddress.email}
                                onChange={handleNewAddressChange}
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Address line 1</label>
                              <input
                                className="form-control"
                                name="addressLine1"
                                value={newAddress.addressLine1}
                                onChange={handleNewAddressChange}
                                required
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Address line 2</label>
                              <input
                                className="form-control"
                                name="addressLine2"
                                value={newAddress.addressLine2}
                                onChange={handleNewAddressChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">City</label>
                              <input
                                className="form-control"
                                name="city"
                                value={newAddress.city}
                                onChange={handleNewAddressChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">State</label>
                              <input
                                className="form-control"
                                name="state"
                                value={newAddress.state}
                                onChange={handleNewAddressChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Country</label>
                              <input
                                className="form-control"
                                name="country"
                                value={newAddress.country}
                                onChange={handleNewAddressChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">ZIP / Postal code</label>
                              <input
                                className="form-control"
                                name="zipCode"
                                value={newAddress.zipCode}
                                onChange={handleNewAddressChange}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-dark mt-4"
                            disabled={saving}
                            onClick={addAddress}
                          >
                            {saving ? "Saving…" : "+ Add address"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Profile;
