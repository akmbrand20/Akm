const nodemailer = require("nodemailer");

const formatCurrency = (amount) => {
  return `${Number(amount || 0).toLocaleString()} EGP`;
};

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  const allowSelfSigned =
    String(process.env.EMAIL_ALLOW_SELF_SIGNED || "").toLowerCase() === "true";

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: !allowSelfSigned,
    },
  });
};

const buildOrderItemsHtml = (items = []) => {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eee;">
            <strong>${item.name}</strong><br/>
            <span style="color:#666;font-size:13px;">${item.color} / ${item.size}</span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join("");
};

const buildTotalsHtml = (order) => {
  return `
    <table style="width:100%;margin-top:18px;">
      <tr>
        <td style="padding:6px 0;color:#666;">Subtotal</td>
        <td style="padding:6px 0;text-align:right;">${formatCurrency(
          order.subtotal
        )}</td>
      </tr>

      ${
        order.bundleDiscount > 0 || order.appliedOffer
          ? `
          <tr>
            <td style="padding:6px 0;color:#666;">${
              order.appliedOffer || "Bundle Discount"
            }</td>
            <td style="padding:6px 0;text-align:right;color:#0b7;">-${formatCurrency(
              order.bundleDiscount || 0
            )}</td>
          </tr>
        `
          : ""
      }

      ${
        order.coupon?.discount > 0
          ? `
          <tr>
            <td style="padding:6px 0;color:#666;">Coupon ${order.coupon.code}</td>
            <td style="padding:6px 0;text-align:right;color:#0b7;">-${formatCurrency(
              order.coupon.discount
            )}</td>
          </tr>
        `
          : ""
      }

      <tr>
        <td style="padding:6px 0;color:#666;">Delivery</td>
        <td style="padding:6px 0;text-align:right;">${
          Number(order.shippingFee || 0) === 0
            ? "Free"
            : formatCurrency(order.shippingFee)
        }</td>
      </tr>

      <tr>
        <td style="padding:14px 0 0;font-size:20px;"><strong>Total</strong></td>
        <td style="padding:14px 0 0;text-align:right;font-size:20px;"><strong>${formatCurrency(
          order.total
        )}</strong></td>
      </tr>
    </table>
  `;
};

const sendOwnerNewOrderEmail = async (order) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "Email credentials are missing.",
    };
  }

  const ownerEmail = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
      <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;">
        <div style="background:#050505;color:#f7f2ea;padding:24px;">
          <h1 style="margin:0;font-size:26px;">New AKM Order</h1>
          <p style="margin:8px 0 0;color:#c8b89d;">${order.orderNumber}</p>
        </div>

        <div style="padding:24px;">
          <h2 style="margin:0 0 12px;">Customer Details</h2>
          <p><strong>Name:</strong> ${order.customer.fullName}</p>
          <p><strong>Phone:</strong> ${order.customer.phone}</p>
          ${
            order.customer.secondPhone
              ? `<p><strong>Second phone:</strong> ${order.customer.secondPhone}</p>`
              : ""
          }
          ${
            order.customer.email
              ? `<p><strong>Email:</strong> ${order.customer.email}</p>`
              : ""
          }
          <p><strong>City:</strong> ${order.customer.city}</p>
          <p><strong>Address:</strong> ${order.customer.address}</p>
          ${
            order.customer.notes
              ? `<p><strong>Notes:</strong> ${order.customer.notes}</p>`
              : ""
          }

          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

          <h2 style="margin:0 0 12px;">Order Items</h2>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8f8f8;">
                <th style="padding:12px;text-align:left;">Item</th>
                <th style="padding:12px;text-align:center;">Qty</th>
                <th style="padding:12px;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${buildOrderItemsHtml(order.items)}
            </tbody>
          </table>

          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

          <h2 style="margin:0 0 12px;">Payment & Total</h2>
          <p><strong>Payment method:</strong> ${order.paymentMethod}</p>
          ${
            order.instapayTiming
              ? `<p><strong>Payment timing:</strong> ${order.instapayTiming}</p>`
              : ""
          }
          ${
            order.transactionReference
              ? `<p><strong>Transaction reference:</strong> ${order.transactionReference}</p>`
              : ""
          }

          ${buildTotalsHtml(order)}

          <p style="margin-top:24px;color:#777;font-size:13px;">
            This email was sent automatically from AKM.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"AKM" <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `New AKM Order - ${order.orderNumber}`,
    html,
  });

  return {
    sent: true,
  };
};

const sendCustomerOrderConfirmationEmail = async (order) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "Email credentials are missing.",
    };
  }

  if (!order.customer?.email) {
    return {
      sent: false,
      reason: "Customer email is missing.",
    };
  }

  const whatsappNumber =
    process.env.BRAND_WHATSAPP_NUMBER || "+201014318607";

  const cleanWhatsappNumber = String(whatsappNumber).replace(/\D/g, "");

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
      <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;">
        <div style="background:#050505;color:#f7f2ea;padding:28px;">
          <h1 style="margin:0;font-size:28px;">Order confirmed</h1>
          <p style="margin:10px 0 0;color:#c8b89d;">Thank you for shopping AKM.</p>
        </div>

        <div style="padding:24px;">
          <p style="font-size:16px;line-height:1.7;color:#333;margin-top:0;">
            Hi ${order.customer.fullName}, your order has been received successfully.
            AKM will contact you to confirm the delivery details.
          </p>

          <div style="background:#f8f8f8;border-radius:14px;padding:16px;margin:20px 0;">
            <p style="margin:0;color:#666;font-size:13px;">Order number</p>
            <h2 style="margin:6px 0 0;font-size:24px;color:#050505;">${order.orderNumber}</h2>
          </div>

          <h2 style="margin:24px 0 12px;">Your items</h2>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f8f8f8;">
                <th style="padding:12px;text-align:left;">Item</th>
                <th style="padding:12px;text-align:center;">Qty</th>
                <th style="padding:12px;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${buildOrderItemsHtml(order.items)}
            </tbody>
          </table>

          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

          <h2 style="margin:0 0 12px;">Payment & delivery</h2>
          <p><strong>Payment method:</strong> ${order.paymentMethod}</p>
          ${
            order.instapayTiming
              ? `<p><strong>Payment timing:</strong> ${order.instapayTiming}</p>`
              : ""
          }
          ${
            order.transactionReference
              ? `<p><strong>Transaction reference:</strong> ${order.transactionReference}</p>`
              : ""
          }
          <p><strong>City:</strong> ${order.customer.city}</p>
          <p><strong>Address:</strong> ${order.customer.address}</p>

          ${buildTotalsHtml(order)}

          <div style="text-align:center;margin-top:28px;">
            <a
              href="https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
                `Hello AKM, I placed order ${order.orderNumber} and I want to confirm it.`
              )}"
              style="display:inline-block;background:#050505;color:#f7f2ea;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:bold;"
            >
              Contact AKM on WhatsApp
            </a>
          </div>

          <p style="margin-top:28px;color:#777;font-size:13px;line-height:1.6;">
            If you did not place this order, please contact AKM immediately.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"AKM" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `Your AKM Order is Confirmed - ${order.orderNumber}`,
    html,
  });

  return {
    sent: true,
  };
};

const sendOwnerNewCustomerEmail = async (customer) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "Email credentials are missing.",
    };
  }

  const ownerEmail = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
      <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;">
        <div style="background:#050505;color:#f7f2ea;padding:24px;">
          <h1 style="margin:0;font-size:26px;">New AKM Customer Signup</h1>
          <p style="margin:8px 0 0;color:#c8b89d;">A new customer created an account.</p>
        </div>

        <div style="padding:24px;">
          <p><strong>Name:</strong> ${customer.fullName}</p>
          <p><strong>Email:</strong> ${customer.email}</p>
          <p><strong>Phone:</strong> ${customer.phone}</p>
          <p><strong>Accepts marketing:</strong> ${
            customer.acceptsMarketing ? "Yes" : "No"
          }</p>

          <p style="margin-top:24px;color:#777;font-size:13px;">
            This email was sent automatically from AKM.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"AKM" <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `New AKM Customer Signup - ${customer.fullName}`,
    html,
  });

  return {
    sent: true,
  };
};

const sendMarketingEmail = async ({ to, subject, title, message, couponCode, ctaText, ctaUrl }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "Email credentials are missing.",
    };
  }

  const finalCtaUrl = ctaUrl || process.env.CLIENT_URL || "http://localhost:5173";

  const couponBlock = couponCode
    ? `
      <div style="background:#f8f8f8;border:1px dashed #c8b89d;border-radius:16px;padding:18px;margin:22px 0;text-align:center;">
        <p style="margin:0;color:#666;font-size:13px;">Your coupon code</p>
        <h2 style="margin:8px 0 0;font-size:28px;letter-spacing:2px;color:#050505;">${couponCode}</h2>
      </div>
    `
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
      <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;">
        <div style="background:#050505;color:#f7f2ea;padding:28px;">
          <h1 style="margin:0;font-size:28px;">${title}</h1>
          <p style="margin:10px 0 0;color:#c8b89d;">AKM</p>
        </div>

        <div style="padding:24px;">
          <p style="font-size:16px;line-height:1.8;color:#333;margin-top:0;white-space:pre-line;">
            ${message}
          </p>

          ${couponBlock}

          <div style="text-align:center;margin-top:28px;">
            <a
              href="${finalCtaUrl}"
              style="display:inline-block;background:#050505;color:#f7f2ea;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold;"
            >
              ${ctaText || "Shop Now"}
            </a>
          </div>

          <p style="margin-top:28px;color:#777;font-size:12px;line-height:1.6;">
            You received this email because you signed up on AKM and agreed to receive updates.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"AKM" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  return {
    sent: true,
  };
};

const sendOwnerNewReviewEmail = async ({ review, product }) => {
  const transporter = createTransporter();

  if (!transporter) {
    return {
      sent: false,
      reason: "Email credentials are missing.",
    };
  }

  const ownerEmail = process.env.OWNER_EMAIL || process.env.EMAIL_USER;
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const adminReviewsUrl = `${clientUrl.replace(/\/$/, "")}/admin/reviews`;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f6f6f6;padding:24px;">
      <div style="max-width:680px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;">
        <div style="background:#050505;color:#f7f2ea;padding:24px;">
          <h1 style="margin:0;font-size:26px;">New Product Review</h1>
          <p style="margin:8px 0 0;color:#c8b89d;">A customer submitted a review waiting for approval.</p>
        </div>

        <div style="padding:24px;">
          <p><strong>Product:</strong> ${product?.name || "Product"}</p>
          <p><strong>Reviewer:</strong> ${review.reviewerName}</p>
          ${
            review.reviewerEmail
              ? `<p><strong>Email:</strong> ${review.reviewerEmail}</p>`
              : ""
          }
          <p><strong>Rating:</strong> ${review.rating}/5</p>

          <div style="background:#f8f8f8;border-radius:14px;padding:16px;margin:18px 0;">
            <p style="margin:0;line-height:1.7;color:#333;">${review.comment}</p>
          </div>

          <div style="text-align:center;margin-top:28px;">
            <a
              href="${adminReviewsUrl}"
              style="display:inline-block;background:#050505;color:#f7f2ea;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:bold;"
            >
              Review in Admin Dashboard
            </a>
          </div>

          <p style="margin-top:24px;color:#777;font-size:13px;">
            This email was sent automatically from AKM.
          </p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"AKM" <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `New AKM Review - ${product?.name || "Product"}`,
    html,
  });

  return {
    sent: true,
  };
};

module.exports = {
  sendOwnerNewOrderEmail,
  sendCustomerOrderConfirmationEmail,
  sendOwnerNewCustomerEmail,
  sendMarketingEmail,
  sendOwnerNewReviewEmail,
};
