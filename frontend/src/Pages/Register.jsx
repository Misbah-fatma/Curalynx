import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    const email = data.get("email");
    const password = data.get("password");
    const confirmPassword = data.get("confirmPassword");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASEURL}/auth/register`,
        { name, email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccess("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Server error. Please try again later."
      );
    }
  };

  return (
    <section className="background-radial-gradient overflow-hidden">
      <div className="container px-4 py-5 px-md-5 text-center text-lg-start my-5">
        <div
          className="row gx-lg-5 align-items-center mb-5"
          style={{ minHeight: "70vh" }}
        >

          {/* Left side text */}
          <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1
              className="my-5 display-5 fw-bold ls-tight"
              style={{ color: "hsl(218, 81%, 95%)", lineHeight: 1.2 }}
            >
              Create Your Account <br />
              <span style={{ color: "hsl(218, 81%, 75%)" }}>
                at Medcare Pharmacy
              </span>
            </h1>
            <p
              className="mb-4"
              style={{
                color: "hsl(218, 81%, 85%)",
                opacity: 0.7,
                fontSize: "1.1rem",
              }}
            >
              Register below to start managing your orders and access
              personalized services.
            </p>
          </div>

          {/* Register Form */}
          <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
            <div
              id="radius-shape-1"
              className="position-absolute rounded-circle shadow-5-strong"
            ></div>
            <div
              id="radius-shape-2"
              className="position-absolute shadow-5-strong"
            ></div>

            <div className="card bg-glass">
              <div className="card-body px-4 py-5 px-md-5">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>

                  <div className="form-outline mb-4">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-block mb-4"
                  >
                    Register
                  </button>

                  <div className="text-center">
                    <p>
                      Already have an account?{" "}
                      <a href="/login" className="text-primary fw-bold">
                        Login here
                      </a>
                    </p>
                  </div>

                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
