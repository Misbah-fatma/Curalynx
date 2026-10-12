import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const data = new FormData(e.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BASEURL}/auth/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const { token, user } = res.data;

      // Store data safely
      localStorage.setItem("data", JSON.stringify(user));
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);

      setSuccess(`Welcome back, ${user.name}! 🎉`);

      // Role-based navigation
      let redirectPath = "/"; // default

      switch (user.role) {
        case "admin":
          redirectPath = "/dashboard";
          break;

        default:
          redirectPath = "/";
      }

      setTimeout(() => {
        window.location.href = redirectPath;
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
        <div className="row gx-lg-5 align-items-center mb-5" style={{ minHeight: "70vh" }}>

          {/* Left side text */}
          <div className="col-lg-6 mb-5 mb-lg-0" style={{ zIndex: 10 }}>
            <h1
              className="my-5 display-5 fw-bold ls-tight"
              style={{ color: "hsl(218, 81%, 95%)", lineHeight: 1.2 }}
            >
              Welcome Back <br />
              <span style={{ color: "hsl(218, 81%, 75%)" }}>to Medcare Pharmacy</span>
            </h1>
            <p
              className="mb-4"
              style={{ color: "hsl(218, 81%, 85%)", opacity: 0.7, fontSize: "1.1rem" }}
            >
              Enter your credentials below to access your account and manage your orders.
            </p>
          </div>

          {/* Login form */}
          <div className="col-lg-6 mb-5 mb-lg-0 position-relative">
            <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
            <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>

            <div className="card bg-glass">
              <div className="card-body px-4 py-5 px-md-5">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>

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

                  <button type="submit" className="btn btn-primary btn-block mb-4">
                    Login
                  </button>
                  <div className="text-center">
                    <p className="mb-1">
                      Don’t have an account?{" "}
                      <a href="/register" className="text-primary fw-bold">
                        Register here
                      </a>
                    </p>
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                      Admin: admin@gmail.com · Password: 123
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
