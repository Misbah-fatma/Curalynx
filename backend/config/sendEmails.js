import { Resend } from "resend";
import { ORDER_STATUS_META, TRACKING_STEPS } from "../constants/orderStatuses.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const emailShell = ({
  title,
  preview,
  bodyHtml,
  footerText = "This message was sent from the Curalynx Pharma website.<br/>Please reply directly to the customer email when needed.",
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:#0f766e;padding:24px 28px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">Curalynx Pharma</p>
              <p style="margin:6px 0 0;font-size:13px;color:#ccfbf1;">${escapeHtml(title)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e5e7eb;background:#f9fafb;">
              <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.5;">
                ${footerText}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const detailRow = (label, value) => `
  <tr>
    <td style="padding:10px 12px;border:1px solid #e5e7eb;width:140px;background:#f9fafb;font-size:13px;color:#4b5563;"><strong>${label}</strong></td>
    <td style="padding:10px 12px;border:1px solid #e5e7eb;font-size:14px;color:#111827;">${value}</td>
  </tr>
`;

const sectionTitle = (text) => `
  <p style="margin:20px 0 8px;font-size:13px;font-weight:700;color:#4b5563;text-transform:uppercase;letter-spacing:0.04em;">${text}</p>
`;

const requireAdminMailConfig = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY must be set in .env");
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL must be set in .env");
  }
  return adminEmail;
};

const sendViaResend = async ({ to, subject, text, html, replyTo }) => {
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const payload = {
    from: `Curalynx Pharma <${fromEmail}>`,
    to: Array.isArray(to) ? to : [to],
    subject,
    text,
    html,
  };

  if (replyTo) payload.replyTo = replyTo;

  const { error } = await resend.emails.send(payload);

  if (error) {
    console.error("Resend error:", error);
    throw new Error(error.message || "Failed to send email via Resend");
  }
};

const buildProductRows = (items) =>
  items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border:1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
        <td style="padding:10px 12px;border:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.qty)}</td>
        <td style="padding:10px 12px;border:1px solid #e5e7eb;">$${escapeHtml(item.price)}</td>
        <td style="padding:10px 12px;border:1px solid #e5e7eb;">$${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

const statusLabel = (status) =>
  ORDER_STATUS_META[status]?.label || String(status || "").replaceAll("_", " ");

const trackingStepsHtml = (currentStatus) => {
  const activeIndex = TRACKING_STEPS.indexOf(currentStatus);
  const rows = TRACKING_STEPS.map((step, index) => {
    const done =
      activeIndex >= 0
        ? index <= activeIndex
        : currentStatus === "COMPLETED" || currentStatus === "DELIVERED";
    const isCurrent = step === currentStatus;
    const marker = done ? "●" : "○";
    const color = isCurrent ? "#0f766e" : done ? "#059669" : "#9ca3af";
    const weight = isCurrent ? "700" : "500";
    return `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:${color};font-weight:${weight};">
          ${marker} ${escapeHtml(statusLabel(step))}
        </td>
      </tr>
    `;
  }).join("");

  return `
    ${sectionTitle("Order Tracking")}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${rows}
    </table>
  `;
};

const orderDetailsHtml = ({
  user,
  items,
  amount,
  paymentMethod,
  paymentId,
  address,
  status = "PENDING_VERIFICATION",
  orderId,
}) => {
  const productRows = buildProductRows(items);
  const safeName = escapeHtml(user.name);
  const safeEmail = escapeHtml(user.email);
  const addr = address || {};

  return `
    ${sectionTitle("Customer Details")}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      ${detailRow("Name", safeName)}
      ${detailRow("Email", `<a href="mailto:${safeEmail}" style="color:#0f766e;text-decoration:none;">${safeEmail}</a>`)}
      ${detailRow("Phone", escapeHtml(addr.phone || "N/A"))}
      ${orderId ? detailRow("Order ID", escapeHtml(String(orderId))) : ""}
    </table>

    ${sectionTitle("Shipping Address")}
    <div style="padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;line-height:1.7;color:#111827;">
      ${escapeHtml(addr.addressLine1 || "")}<br/>
      ${addr.addressLine2 ? `${escapeHtml(addr.addressLine2)}<br/>` : ""}
      ${escapeHtml(addr.city || "")}, ${escapeHtml(addr.state || "")}<br/>
      ${escapeHtml(addr.country || "")} - ${escapeHtml(addr.zipCode || "")}
    </div>

    ${sectionTitle("Products")}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      <thead>
        <tr>
          <th style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;text-align:left;font-size:13px;color:#4b5563;">Product</th>
          <th style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;text-align:center;font-size:13px;color:#4b5563;">Qty</th>
          <th style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;text-align:left;font-size:13px;color:#4b5563;">Price</th>
          <th style="padding:10px 12px;border:1px solid #e5e7eb;background:#f9fafb;text-align:left;font-size:13px;color:#4b5563;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${productRows}
      </tbody>
    </table>

    ${sectionTitle("Payment Info")}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
      ${detailRow("Payment Method", escapeHtml(paymentMethod))}
      ${detailRow("Payment ID", escapeHtml(paymentId))}
      ${detailRow("Total Amount", `<strong>$${escapeHtml(amount)}</strong>`)}
      ${detailRow("Status", `<strong>${escapeHtml(statusLabel(status))}</strong>`)}
    </table>

    ${trackingStepsHtml(status)}
  `;
};

const orderDetailsText = ({
  user,
  items,
  amount,
  paymentMethod,
  paymentId,
  address,
  status = "PENDING_VERIFICATION",
  orderId,
}) => `
User: ${user.name} (${user.email})
Phone: ${(address && address.phone) || "N/A"}
${orderId ? `Order ID: ${orderId}` : ""}

Address:
${(address && address.addressLine1) || ""}
${(address && address.addressLine2) || ""}
${(address && address.city) || ""}, ${(address && address.state) || ""}
${(address && address.country) || ""} - ${(address && address.zipCode) || ""}

Items:
${items.map((item) => `- ${item.name} x${item.qty} = $${(item.price * item.qty).toFixed(2)}`).join("\n")}

Payment Method: ${paymentMethod}
Payment ID: ${paymentId}
Total: $${amount}
Status: ${statusLabel(status)}
`;

export const sendContactEmail = async ({ name, email, subject, message }) => {
  const adminEmail = requireAdminMailConfig();

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
      You received a new message from the website contact form.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:20px;">
      ${detailRow("Name", safeName)}
      ${detailRow("Email", `<a href="mailto:${safeEmail}" style="color:#0f766e;text-decoration:none;">${safeEmail}</a>`)}
      ${detailRow("Subject", safeSubject)}
    </table>
    ${sectionTitle("Message")}
    <div style="padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;line-height:1.7;color:#111827;">
      ${safeMessage}
    </div>
  `;

  await sendViaResend({
    to: adminEmail,
    replyTo: email,
    subject: `Contact Form: ${subject}`,
    text: `New contact form submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: emailShell({
      title: "New Contact Message",
      preview: `${name} sent a contact form message`,
      bodyHtml,
    }),
  });
};

export const sendNewsletterEmail = async ({ email }) => {
  const adminEmail = requireAdminMailConfig();
  const safeEmail = escapeHtml(email);
  const errors = [];

  try {
    await sendViaResend({
      to: adminEmail,
      replyTo: email,
      subject: "New Newsletter Subscription",
      text: `New newsletter subscription\n\nEmail: ${email}\nSource: Website Footer Newsletter`,
      html: emailShell({
        title: "Newsletter Subscription",
        preview: `${email} subscribed to the newsletter`,
        bodyHtml: `
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
            A visitor subscribed to the Curalynx Pharma newsletter from the website footer.
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${detailRow("Subscriber Email", `<a href="mailto:${safeEmail}" style="color:#0f766e;text-decoration:none;">${safeEmail}</a>`)}
            ${detailRow("Source", "Website Footer Newsletter")}
          </table>
        `,
      }),
    });
  } catch (err) {
    errors.push(`admin: ${err.message}`);
  }

  try {
    await sendViaResend({
      to: email,
      subject: "You're subscribed to Curalynx Pharma",
      text: `Thank you for subscribing to the Curalynx Pharma newsletter.\n\nYou'll receive updates, offers, and health tips from us.\n\n— Curalynx Pharma`,
      html: emailShell({
        title: "Subscription Confirmed",
        preview: "You're subscribed to the Curalynx Pharma newsletter",
        footerText:
          "You're receiving this because you subscribed on curalynxpharma.online.<br/>Curalynx Pharma — trusted healthcare products.",
        bodyHtml: `
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
            Thank you for subscribing!
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
            You're now on the Curalynx Pharma newsletter list. We'll share promo offers, product updates, and helpful health tips — nothing spammy.
          </p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${detailRow("Subscribed Email", safeEmail)}
            ${detailRow("Status", "<strong>Active</strong>")}
          </table>
        `,
      }),
    });
  } catch (err) {
    errors.push(`subscriber: ${err.message}`);
  }

  if (errors.length) {
    throw new Error(`Newsletter email failed (${errors.join("; ")})`);
  }
};

export const sendOrderEmail = async ({
  user,
  items,
  amount,
  paymentMethod,
  paymentId,
  address,
  orderId,
  status = "PENDING_VERIFICATION",
}) => {
  const adminEmail = requireAdminMailConfig();

  if (!user?.email) {
    throw new Error("Customer email is required");
  }

  const details = {
    user,
    items,
    amount,
    paymentMethod,
    paymentId,
    address,
    orderId,
    status,
  };
  const detailsHtml = orderDetailsHtml(details);
  const detailsText = orderDetailsText(details);
  const errors = [];

  try {
    await sendViaResend({
      to: adminEmail,
      replyTo: user.email,
      subject: "New Order Payment Submitted",
      text: `New Order Received\n\n${detailsText}`,
      html: emailShell({
        title: "New Order Received",
        preview: `New order from ${user.name} — $${amount}`,
        bodyHtml: `
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#374151;">
            A new order has been placed and is awaiting payment verification.
          </p>
          ${detailsHtml}
        `,
      }),
    });
  } catch (err) {
    errors.push(`admin: ${err.message}`);
  }

  try {
    await sendViaResend({
      to: user.email,
      subject: "Your Curalynx Pharma Order Confirmation",
      text: `Hi ${user.name},\n\nThank you for your order. We have received it and will verify your payment shortly.\n\n${detailsText}\n\n— Curalynx Pharma`,
      html: emailShell({
        title: "Order Confirmation",
        preview: `Thanks ${user.name}, we received your order`,
        footerText:
          "Thank you for shopping with Curalynx Pharma.<br/>If you have questions, reply to this email or contact us on the website.",
        bodyHtml: `
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#374151;">
            Hi ${escapeHtml(user.name)},
          </p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#374151;">
            Thank you for your order. We have received it and will verify your payment shortly.
          </p>
          ${detailsHtml}
        `,
      }),
    });
  } catch (err) {
    errors.push(`customer: ${err.message}`);
  }

  if (errors.length) {
    throw new Error(`Order email failed (${errors.join("; ")})`);
  }
};

export const sendOrderStatusEmail = async ({
  user,
  order,
  previousStatus,
  status,
  note = "",
}) => {
  if (!user?.email) {
    throw new Error("Customer email is required");
  }

  const meta = ORDER_STATUS_META[status] || {
    label: statusLabel(status),
    description: "Your order status has been updated.",
  };

  const details = {
    user,
    items: order.items || [],
    amount: order.amount,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    address: order.address || {},
    orderId: order._id,
    status,
  };

  const detailsHtml = orderDetailsHtml(details);
  const noteHtml = note
    ? `
      ${sectionTitle("Update Note")}
      <div style="padding:14px 16px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:6px;font-size:14px;line-height:1.7;color:#115e59;">
        ${escapeHtml(note)}
      </div>
    `
    : "";

  await sendViaResend({
    to: user.email,
    subject: `Order Update: ${meta.label}`,
    text: `Hi ${user.name},\n\nYour order status is now: ${meta.label}.\n${meta.description}\n${note ? `Note: ${note}\n` : ""}\nOrder ID: ${order._id}\n\n— Curalynx Pharma`,
    html: emailShell({
      title: `Order ${meta.label}`,
      preview: `Your order is now: ${meta.label}`,
      footerText:
        "This is an automated order tracking update from Curalynx Pharma.<br/>Reply to this email if you need help.",
      bodyHtml: `
        <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#374151;">
          Hi ${escapeHtml(user.name)},
        </p>
        <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#374151;">
          ${escapeHtml(meta.description)}
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:16px 0;">
          ${detailRow("Previous Status", escapeHtml(statusLabel(previousStatus)))}
          ${detailRow("Current Status", `<strong>${escapeHtml(meta.label)}</strong>`)}
          ${detailRow("Order ID", escapeHtml(String(order._id)))}
        </table>
        ${noteHtml}
        ${detailsHtml}
      `,
    }),
  });
};

