require("dotenv").config();

const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const updateAdmin = async () => {
  try {
    await connectDB();

    const fullName = process.env.ADMIN_FULL_NAME || "AKM Admin";
    const email = process.env.ADMIN_EMAIL;
    const phone = process.env.ADMIN_PHONE || "+20 10 16028980";
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required in server/.env");
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("ADMIN_PASSWORD must be at least 6 characters.");
      process.exit(1);
    }

    let admin = await Admin.findOne({ role: "admin" });

    if (!admin) {
      admin = await Admin.findOne();
    }

    if (!admin) {
      admin = new Admin({
        fullName,
        email,
        phone,
        password,
        role: "admin",
        isActive: true,
      });
    } else {
      admin.fullName = fullName;
      admin.email = email;
      admin.phone = phone;
      admin.password = password;
      admin.role = "admin";
      admin.isActive = true;
    }

    await admin.save();

    console.log("Admin account updated successfully.");
    console.log(`Email: ${email}`);
    console.log("Password: updated from ADMIN_PASSWORD in .env");

    process.exit(0);
  } catch (error) {
    console.error("Failed to update admin:", error.message);
    process.exit(1);
  }
};

updateAdmin();