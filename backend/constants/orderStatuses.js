/** Order fulfillment / tracking statuses */
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
    description: "We received your order and are verifying your payment.",
    color: "warning",
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    description: "Your payment has been verified successfully.",
    color: "info",
  },
  ORDER_IN_PROCESS: {
    label: "Order in Process",
    description: "Your order is being prepared by our pharmacy team.",
    color: "primary",
  },
  PACKED: {
    label: "Packed",
    description: "Your order has been packed and is ready for shipment.",
    color: "secondary",
  },
  SHIPPED: {
    label: "Shipped",
    description: "Your order has been shipped and is on the way.",
    color: "info",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    description: "Your order is out for delivery and should arrive soon.",
    color: "primary",
  },
  DELIVERED: {
    label: "Delivered",
    description: "Your order has been delivered successfully.",
    color: "success",
  },
  COMPLETED: {
    label: "Completed",
    description: "Your order is complete. Thank you for shopping with us.",
    color: "success",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Your order has been cancelled.",
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

export const isValidOrderStatus = (status) => ORDER_STATUSES.includes(status);
