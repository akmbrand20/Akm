require("dotenv").config();

const nodemailer = require("nodemailer");

const testEmail = async () => {
  try {
    console.log("Checking email environment variables...");

    const requiredVars = ["EMAIL_USER", "EMAIL_PASS", "OWNER_EMAIL"];

    for (const key of requiredVars) {
      if (!process.env[key]) {
        console.error(`${key} is missing from server/.env`);
      } else {
        console.log(`${key}: OK`);
      }
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error(
        "Email test stopped because EMAIL_USER or EMAIL_PASS is missing."
      );
      process.exit(1);
    }

    const allowSelfSigned =
      String(process.env.EMAIL_ALLOW_SELF_SIGNED || "").toLowerCase() ===
      "true";

    console.log(
      `EMAIL_ALLOW_SELF_SIGNED: ${allowSelfSigned ? "true" : "false"}`
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: !allowSelfSigned,
      },
    });

    console.log("Verifying Gmail connection...");

    await transporter.verify();

    console.log("Gmail connection verified successfully.");

    const to = process.env.OWNER_EMAIL || process.env.EMAIL_USER;

    console.log(`Sending test email to ${to}...`);

    await transporter.sendMail({
      from: `"AKM" <${process.env.EMAIL_USER}>`,
      to,
      subject: "AKM Email Test",
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;">
          <h1>AKM email test worked ✅</h1>
          <p>If you received this email, Nodemailer is configured correctly.</p>
        </div>
      `,
    });

    console.log("Test email sent successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Email test failed.");
    console.error("Error message:", error.message);

    if (error.code) {
      console.error("Error code:", error.code);
    }

    if (error.response) {
      console.error("Gmail response:", error.response);
    }

    process.exit(1);
  }
};

testEmail();