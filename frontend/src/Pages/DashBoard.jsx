import React, { useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddProductIcon from "@mui/icons-material/AddBox";
import PersonIcon from "@mui/icons-material/Person";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ViewProductIcon from "@mui/icons-material/Inventory2";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

import { AppProvider, DashboardLayout } from "@toolpad/core";
import {
  Account,
  AccountPreview,
  AccountPopoverFooter,
  SignOutButton,
} from "@toolpad/core/Account";

import AddProduct from "./Dashboard/Addproduct";
import Productdisplay from "./Dashboard/Productdisplay";
import UsersTable from "./Dashboard/User";
import AllOrders from "./Dashboard/AllOrder";
import AllReviews from "./Dashboard/AllReviews";
import InboxMessages from "./Dashboard/InboxMessages";
import DashboardOverview from "./Dashboard/DashboardOverview";

const NAVIGATION = [
  { kind: "header", title: "Menu" },
  { segment: "dashboard", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "products/add", title: "Add Product", icon: <AddProductIcon /> },
  { segment: "products/view", title: "View Products", icon: <ViewProductIcon /> },
  { segment: "users/view", title: "View Users", icon: <PersonIcon /> },
  { segment: "orders/all", title: "All Orders", icon: <ListAltIcon /> },
  { segment: "inbox", title: "Inbox", icon: <InboxOutlinedIcon /> },
  { segment: "reviews/all", title: "All Reviews", icon: <RateReviewOutlinedIcon /> },
];

// Change logo size here only
const LOGO_STYLE = {
  height: 55,
  width: "auto",
  maxWidth: 280,
  objectFit: "contain",
  display: "block",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4f46e5" },
    secondary: { main: "#06b6d4" },
    background: { default: "#f8fafc", paper: "#ffffff" },
  },
  shape: { borderRadius: 12 },
});

function AppLogo() {
  return (
    <a
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        lineHeight: 0,
      }}
    >
      <img src="/logo.png" alt="Logo" style={LOGO_STYLE} />
    </a>
  );
}

function PageContent({ pathname, onNavigate }) {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 6, md: 8 },
        minHeight: "100%",
        bgcolor: "background.default",
      }}
    >
      {pathname === "/dashboard" && <DashboardOverview onNavigate={onNavigate} />}
      {pathname === "/products/add" && <AddProduct />}
      {pathname === "/products/view" && <Productdisplay />}
      {pathname === "/users/view" && <UsersTable />}
      {pathname === "/orders/all" && <AllOrders />}
      {pathname === "/inbox" && <InboxMessages />}
      {pathname === "/reviews/all" && <AllReviews />}
    </Box>
  );
}

PageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

function ToolbarActions() {
  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<HomeOutlinedIcon />}
      onClick={() => {
        window.location.href = "/";
      }}
      sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
    >
      Home
    </Button>
  );
}

function SidebarAccount({ mini }) {
  return (
    <Box sx={{ px: mini ? 0.5 : 1, pb: 1.5 }}>
      <Account
        slots={{
          preview: (props) => (
            <>
              <Divider sx={{ mb: 1 }} />
              <AccountPreview {...props} variant={mini ? "condensed" : "expanded"} />
            </>
          ),
        }}
        slotProps={{ popover: { disableAutoFocus: true } }}
      >
        <AccountPopoverFooter>
          <SignOutButton
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          />
        </AccountPopoverFooter>
      </Account>
    </Box>
  );
}

SidebarAccount.propTypes = {
  mini: PropTypes.bool,
};

export default function Dashboard() {
  const [pathname, setPathname] = useState("/dashboard");

  if (!localStorage.getItem("token")) {
    window.location.href = "/login";
    return null;
  }

  const router = {
    pathname,
    searchParams: new URLSearchParams(),
    navigate: (path) => setPathname(path),
  };

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={theme}
      branding={{ title: "", homeUrl: "/" }}
    >
      <DashboardLayout
        sidebarExpandedWidth={260}
        slots={{
          appTitle: AppLogo,
          toolbarActions: ToolbarActions,
          sidebarFooter: SidebarAccount,
        }}
        sx={{
          // Center menu icon + logo on the same line
          "& .MuiAppBar-root .MuiToolbar-root": {
            minHeight: 72,
            height: 72,
            alignItems: "center",
          },
          "& .MuiAppBar-root .MuiToolbar-root > .MuiStack-root": {
            alignItems: "center",
            flexWrap: "nowrap",
            width: "100%",
            height: "100%",
          },
          "& .MuiAppBar-root .MuiToolbar-root > .MuiStack-root > .MuiStack-root:first-of-type": {
            alignItems: "center",
            gap: 1,
            height: "100%",
          },
          "& .MuiDrawer-paper > .MuiToolbar-root:first-of-type": {
            minHeight: 72,
            height: 72,
          },
        }}
      >
        <PageContent pathname={pathname} onNavigate={setPathname} />
      </DashboardLayout>
    </AppProvider>
  );
}
