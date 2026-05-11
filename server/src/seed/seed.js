require("dotenv").config();

const connectDB = require("../config/db");
const Product = require("../models/Product");
const Offer = require("../models/Offer");
const SiteSettings = require("../models/SiteSettings");
const Counter = require("../models/Counter");
const Admin = require("../models/Admin");
const { products, offers, settings, admin } = require("./seedData");

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Clearing old seed data...");

    await Product.deleteMany({});
    await Offer.deleteMany({});
    await SiteSettings.deleteMany({});
    await Counter.deleteMany({});
    await Admin.deleteMany({});

    console.log("Creating admin...");
    await Admin.create(admin);

    console.log("Creating products...");
    const createdProducts = await Product.insertMany(products);

    const tshirt = createdProducts.find((product) => product.category === "tshirt");
    const pants = createdProducts.find((product) => product.category === "pants");

    if (tshirt && pants) {
      tshirt.shopTheLook = [pants._id];
      pants.shopTheLook = [tshirt._id];

      await tshirt.save();
      await pants.save();
    }

    console.log("Creating offers...");
    await Offer.insertMany(offers);

    console.log("Creating site settings...");
    await SiteSettings.create(settings);

    console.log("Creating order counter...");
    await Counter.create({
      name: "order",
      value: 1000,
    });

    console.log("Seed completed successfully.");
    console.log("Admin login:");
    console.log("Email: admin@akm.com");
    console.log("Password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();