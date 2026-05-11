const Customer = require("../models/Customer");
const EmailCampaign = require("../models/EmailCampaign");
const { sendMarketingEmail } = require("../services/emailService");

const getCampaigns = async (req, res) => {
  const campaigns = await EmailCampaign.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    count: campaigns.length,
    campaigns,
  });
};

const getMarketingCustomersCount = async (req, res) => {
  const marketingCustomers = await Customer.countDocuments({
    isActive: true,
    acceptsMarketing: true,
  });

  const allCustomers = await Customer.countDocuments({
    isActive: true,
  });

  res.json({
    success: true,
    counts: {
      marketingCustomers,
      allCustomers,
    },
  });
};

const createCampaign = async (req, res) => {
  const {
    type,
    subject,
    title,
    message,
    couponCode,
    ctaText,
    ctaUrl,
    audience,
  } = req.body;

  if (!type || !subject || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "Type, subject, title, and message are required.",
    });
  }

  const campaign = await EmailCampaign.create({
    type,
    subject,
    title,
    message,
    couponCode: couponCode || "",
    ctaText: ctaText || "Shop Now",
    ctaUrl: ctaUrl || "",
    audience: audience || "marketing_customers",
    createdBy: req.admin?._id || null,
  });

  res.status(201).json({
    success: true,
    message: "Campaign created successfully.",
    campaign,
  });
};

const sendCampaign = async (req, res) => {
  const campaign = await EmailCampaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: "Campaign not found.",
    });
  }

  if (campaign.status === "sending") {
    return res.status(400).json({
      success: false,
      message: "Campaign is already sending.",
    });
  }

  campaign.status = "sending";
  campaign.sentCount = 0;
  campaign.failedCount = 0;
  campaign.errorMessages = [];
  await campaign.save();

  const customerQuery = {
    isActive: true,
  };

  if (campaign.audience === "marketing_customers") {
    customerQuery.acceptsMarketing = true;
  }

  const customers = await Customer.find(customerQuery).select(
    "fullName email acceptsMarketing"
  );

  let sentCount = 0;
  let failedCount = 0;
  const errorMessages = [];

  for (const customer of customers) {
    try {
      if (!customer.email) {
        failedCount += 1;
        errorMessages.push(`${customer.fullName || "Customer"} has no email.`);
        continue;
      }

      const result = await sendMarketingEmail({
        to: customer.email,
        subject: campaign.subject,
        title: campaign.title,
        message: campaign.message,
        couponCode: campaign.couponCode,
        ctaText: campaign.ctaText,
        ctaUrl: campaign.ctaUrl,
      });

      if (result.sent) {
        sentCount += 1;
      } else {
        failedCount += 1;
        errorMessages.push(`${customer.email}: ${result.reason}`);
      }
    } catch (error) {
      failedCount += 1;
      errorMessages.push(`${customer.email}: ${error.message}`);
    }
  }

  campaign.sentCount = sentCount;
  campaign.failedCount = failedCount;
  campaign.errorMessages = errorMessages.slice(0, 20);
  campaign.sentAt = new Date();
  campaign.status = failedCount > 0 && sentCount === 0 ? "failed" : "sent";

  await campaign.save();

  res.json({
    success: true,
    message: "Campaign sending completed.",
    campaign,
  });
};

const deleteCampaign = async (req, res) => {
  const campaign = await EmailCampaign.findById(req.params.id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: "Campaign not found.",
    });
  }

  await campaign.deleteOne();

  res.json({
    success: true,
    message: "Campaign deleted successfully.",
  });
};

module.exports = {
  getCampaigns,
  getMarketingCustomersCount,
  createCampaign,
  sendCampaign,
  deleteCampaign,
};