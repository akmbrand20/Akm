const axios = require("axios");
const { hashValue, normalizePhone } = require("../utils/hashUserData");

const META_GRAPH_VERSION = "v21.0";

const buildMetaItems = (items = []) => {
  return items.map((item) => ({
    id: String(item.productId),
    quantity: Number(item.quantity || 1),
    item_price: Number(item.price || 0),
  }));
};

const buildContentIds = (items = []) => {
  return items.map((item) => String(item.productId));
};

const sendMetaPurchaseEvent = async ({ order, req }) => {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    return {
      sent: false,
      reason: "Meta Pixel ID or CAPI access token is missing.",
    };
  }

  const eventId = order.tracking?.eventId || `purchase_${order.orderNumber}`;
  const eventTime = Math.floor(Date.now() / 1000);

  const email = order.customer?.email || "";
  const phone = normalizePhone(order.customer?.phone || "");

  const clientIpAddress =
    req.headers["x-forwarded-for"]?.split(",")?.[0]?.trim() ||
    req.socket?.remoteAddress ||
    "";

  const clientUserAgent = req.headers["user-agent"] || "";

  const userData = {
    client_ip_address: clientIpAddress,
    client_user_agent: clientUserAgent,
  };

  if (email) {
    userData.em = [hashValue(email)];
  }

  if (phone) {
    userData.ph = [hashValue(phone)];
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: eventTime,
        event_id: eventId,
        action_source: "website",
        event_source_url: process.env.CLIENT_URL || "",
        user_data: userData,
        custom_data: {
          currency: "EGP",
          value: Number(order.total || 0),
          order_id: order.orderNumber,
          content_type: "product",
          content_ids: buildContentIds(order.items || []),
          contents: buildMetaItems(order.items || []),
          num_items: (order.items || []).reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
          ),
        },
      },
    ],
  };

  if (testEventCode) {
    payload.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${accessToken}`;

  const { data } = await axios.post(url, payload);

  return {
    sent: true,
    response: data,
  };
};

module.exports = {
  sendMetaPurchaseEvent,
};