/** Order fulfillment / tracking statuses (frontend) */
export const ORDER_STATUSES = [
  "PENDING_VERIFICATION",
  "PAYMENT_VERIFIED",
  "ORDER_IN_PROCESS",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

export const ORDER_STATUS_META = {
  PENDING_VERIFICATION: {
    label: "Pending Verification",
    description: "Payment submitted — awaiting verification.",
    color: "warning",
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    description: "Payment confirmed.",
    color: "info",
  },
  ORDER_IN_PROCESS: {
    label: "Order in Process",
    description: "Pharmacy team is preparing the order.",
    color: "primary",
  },
  PACKED: {
    label: "Packed",
    description: "Packed and ready to ship.",
    color: "secondary",
  },
  SHIPPED: {
    label: "Shipped",
    description: "On the way to the customer.",
    color: "info",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    description: "Out for delivery.",
    color: "primary",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Delivered to the customer.",
    color: "success",
  },
  COMPLETED: {
    label: "Completed",
    description: "Order completed.",
    color: "success",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Order cancelled.",
    color: "error",
  },
};

export const TRACKING_STEPS = [
  "PENDING_VERIFICATION",
  "PAYMENT_VERIFIED",
  "ORDER_IN_PROCESS",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const getStatusLabel = (status) =>
  ORDER_STATUS_META[status]?.label || String(status || "Unknown").replaceAll("_", " ");
