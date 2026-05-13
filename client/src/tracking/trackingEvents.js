import { generateEventId } from "../lib/generateEventId";
import { trackGA4Event, trackGA4PageView } from "./ga4";
import { trackMetaEvent, trackMetaPageView } from "./metaPixel";
import { pushToDataLayer } from "./googleTagManager";
import { trackTikTokEvent } from "./tiktokPixel";
import { trackSnapEvent } from "./snapPixel";

const getItemId = (item = {}) => {
  return item.productId || item._id || item.slug || item.id || "";
};

const getItemPrice = (item = {}) => {
  return Number(item.price || item.salePrice || item.originalPrice || 0);
};

const formatItemsForGA4 = (items = []) => {
  return items.map((item) => ({
    item_id: getItemId(item),
    item_name: item.name,
    item_category: item.category,
    item_variant: `${item.color || ""} / ${item.size || ""}`,
    price: getItemPrice(item),
    quantity: Number(item.quantity || 1),
  }));
};

const formatContentIds = (items = []) => {
  return items.map((item) => getItemId(item)).filter(Boolean);
};

const formatTikTokContents = (items = []) => {
  return items
    .filter((item) => getItemId(item))
    .map((item) => ({
      content_id: String(getItemId(item)),
      content_name: item.name || "",
      content_category: item.category || "",
      price: getItemPrice(item),
      quantity: Number(item.quantity || 1),
    }));
};

const buildTikTokParams = ({ items = [], value = 0, orderId = "" }) => {
  const contents = formatTikTokContents(items);
  const contentIds = contents.map((item) => item.content_id);

  return {
    content_id: contentIds[0] || "",
    content_ids: contentIds,
    contents,
    content_type: "product",
    value: Number(value || 0),
    currency: "EGP",
    quantity: contents.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ),
    ...(orderId ? { order_id: orderId } : {}),
  };
};

export const trackPageView = (path) => {
  trackMetaPageView();
  trackGA4PageView(path);

  pushToDataLayer({
    event: "page_view",
    page_path: path,
  });
};

export const trackViewContent = (product) => {
  if (!product) return "";

  const eventId = generateEventId("view_content");
  const value = Number(product.salePrice || product.price || 0);

  const metaParams = {
    content_name: product.name,
    content_ids: [product._id],
    content_type: "product",
    value,
    currency: "EGP",
  };

  const tiktokParams = buildTikTokParams({
    items: [
      {
        ...product,
        productId: product._id,
        quantity: 1,
        price: value,
      },
    ],
    value,
  });

  trackMetaEvent("ViewContent", metaParams, eventId);

  trackGA4Event("view_item", {
    currency: "EGP",
    value,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.category,
        price: value,
        quantity: 1,
      },
    ],
  });

  pushToDataLayer({
    event: "view_content",
    event_id: eventId,
    ecommerce: {
      currency: "EGP",
      value,
      items: [
        {
          item_id: product._id,
          item_name: product.name,
          item_category: product.category,
          price: value,
        },
      ],
    },
  });

  trackTikTokEvent("ViewContent", tiktokParams);
  trackSnapEvent("VIEW_CONTENT", metaParams);

  return eventId;
};

export const trackAddToCart = (item) => {
  if (!item) return "";

  const eventId = generateEventId("add_to_cart");
  const value = getItemPrice(item) * Number(item.quantity || 1);

  const metaParams = {
    content_name: item.name,
    content_ids: [item.productId],
    content_type: "product",
    value,
    currency: "EGP",
  };

  const tiktokParams = buildTikTokParams({
    items: [item],
    value,
  });

  trackMetaEvent("AddToCart", metaParams, eventId);

  trackGA4Event("add_to_cart", {
    currency: "EGP",
    value,
    items: formatItemsForGA4([item]),
  });

  pushToDataLayer({
    event: "add_to_cart",
    event_id: eventId,
    ecommerce: {
      currency: "EGP",
      value,
      items: formatItemsForGA4([item]),
    },
  });

  trackTikTokEvent("AddToCart", tiktokParams);
  trackSnapEvent("ADD_CART", metaParams);

  return eventId;
};

export const trackInitiateCheckout = (items = [], totals = {}) => {
  const eventId = generateEventId("initiate_checkout");

  const metaParams = {
    content_ids: formatContentIds(items),
    content_type: "product",
    value: Number(totals.total || 0),
    currency: "EGP",
    num_items: items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ),
  };

  const tiktokParams = buildTikTokParams({
    items,
    value: Number(totals.total || 0),
  });

  trackMetaEvent("InitiateCheckout", metaParams, eventId);

  trackGA4Event("begin_checkout", {
    currency: "EGP",
    value: Number(totals.total || 0),
    items: formatItemsForGA4(items),
  });

  pushToDataLayer({
    event: "begin_checkout",
    event_id: eventId,
    ecommerce: {
      currency: "EGP",
      value: Number(totals.total || 0),
      items: formatItemsForGA4(items),
    },
  });

  trackTikTokEvent("InitiateCheckout", tiktokParams);
  trackSnapEvent("START_CHECKOUT", metaParams);

  return eventId;
};

export const trackPurchase = (order) => {
  if (!order) return "";

  const eventId = order.tracking?.eventId || generateEventId("purchase");

  const metaParams = {
    content_ids: formatContentIds(order.items || []),
    content_type: "product",
    value: Number(order.total || 0),
    currency: "EGP",
    order_id: order.orderNumber,
    num_items: (order.items || []).reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    ),
  };

  const tiktokParams = buildTikTokParams({
    items: order.items || [],
    value: Number(order.total || 0),
    orderId: order.orderNumber,
  });

  trackMetaEvent("Purchase", metaParams, eventId);

  trackGA4Event("purchase", {
    transaction_id: order.orderNumber,
    currency: "EGP",
    value: Number(order.total || 0),
    shipping: Number(order.shippingFee || 0),
    items: formatItemsForGA4(order.items || []),
  });

  pushToDataLayer({
    event: "purchase",
    event_id: eventId,
    ecommerce: {
      transaction_id: order.orderNumber,
      currency: "EGP",
      value: Number(order.total || 0),
      shipping: Number(order.shippingFee || 0),
      items: formatItemsForGA4(order.items || []),
    },
  });

  trackTikTokEvent("Purchase", tiktokParams);
  trackSnapEvent("PURCHASE", metaParams);

  return eventId;
};