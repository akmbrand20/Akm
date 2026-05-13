import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";
import { generateEventId } from "../../lib/generateEventId";
import { useCustomerAuth } from "../../context/CustomerAuthContext";

import CartSummary from "../../components/cart/CartSummary";
import PaymentMethodSelector from "../../components/checkout/PaymentMethodSelector";
import TrustBadges from "../../components/checkout/TrustBadges";
import SEO from "../../components/common/SEO";
import { useLanguage } from "../../hooks/useLanguage";

import {
  trackInitiateCheckout,
  trackPurchase,
} from "../../tracking/trackingEvents";

export default function Checkout() {
  const navigate = useNavigate();
const { t } = useLanguage();
const { cartItems, totals, coupon, clearCart } = useCart();
const { customer: loggedInCustomer } = useCustomerAuth();

  const hasTrackedCheckout = useRef(false);

  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    secondPhone: "",
    email: "",
    city: "",
    address: "",
    notes: "",
  });
  useEffect(() => {
  if (loggedInCustomer) {
    setCustomer((prev) => ({
      ...prev,
      fullName: prev.fullName || loggedInCustomer.fullName || "",
      email: prev.email || loggedInCustomer.email || "",
      phone: prev.phone || loggedInCustomer.phone || "",
    }));
  }
}, [loggedInCustomer]);

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [instapayTiming, setInstapayTiming] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (cartItems.length > 0 && !hasTrackedCheckout.current) {
      trackInitiateCheckout(cartItems, totals);
      hasTrackedCheckout.current = true;
    }
  }, [cartItems, totals]);

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      trackPurchase(order);
      clearCart();
      navigate(`/order-success/${order.orderNumber}`);
    },
    onError: (error) => {
      setFormError(
        error?.response?.data?.message ||
          t("checkout.errors.create")
      );
    },
  });

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!customer.fullName.trim()) return t("checkout.errors.fullName");
    if (!customer.phone.trim()) return t("checkout.errors.phone");
    if (!customer.city.trim()) return t("checkout.errors.city");
    if (!customer.address.trim()) return t("checkout.errors.address");
    if (!paymentMethod) return t("checkout.errors.payment");

    if (paymentMethod === "Instapay" && !instapayTiming) {
      return t("checkout.errors.instapayTiming");
    }

    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    const trackingEventId = generateEventId("purchase");

    orderMutation.mutate({
      customer,
      items: cartItems,
      paymentMethod,
      instapayTiming: paymentMethod === "Instapay" ? instapayTiming : "",
      transactionReference:
        paymentMethod === "Instapay" && instapayTiming === "Pay Now"
          ? transactionReference
          : "",
      trackingEventId,
      couponCode: coupon?.code || "",
    });
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
        <SEO
          title={t("checkout.seoTitle")}
          description={t("checkout.seoDescription")}
        />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            {t("checkout.eyebrow")}
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            {t("checkout.emptyTitle")}
          </h1>

          <p className="mt-4 text-zinc-400">
            {t("checkout.emptyText")}
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-[#f7f2ea] px-7 py-3 font-medium text-black"
          >
            {t("checkout.backToShop")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
      <SEO
        title={t("checkout.seoTitle")}
        description={t("checkout.seoDescription")}
      />

      <div className="mx-auto max-w-6xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-[#c8b89d] hover:text-white"
        >
          <ArrowLeft size={16} />
          {t("checkout.backToCart")}
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            {t("checkout.eyebrow")}
          </p>

          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
            {t("checkout.title")}
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            {t("checkout.subtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-2xl font-semibold">
                {t("checkout.customerDetails")}
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">
                    {t("checkout.fullName")}
                  </label>
                  <input
                    name="fullName"
                    value={customer.fullName}
                    onChange={handleCustomerChange}
                    placeholder={t("checkout.fullNamePlaceholder")}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    {t("checkout.phone")}
                  </label>
                  <input
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder={t("checkout.phonePlaceholder")}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    {t("checkout.secondPhone")}
                  </label>
                  <input
                    name="secondPhone"
                    value={customer.secondPhone}
                    onChange={handleCustomerChange}
                    placeholder={t("checkout.optionalPlaceholder")}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    {t("checkout.email")}
                  </label>
                  <input
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    placeholder={t("checkout.emailPlaceholder")}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-2xl font-semibold">
                {t("checkout.deliveryAddress")}
              </h2>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-sm text-zinc-300">
                    {t("checkout.city")}
                  </label>
                  <input
                    name="city"
                    value={customer.city}
                    onChange={handleCustomerChange}
                    placeholder={t("checkout.cityPlaceholder")}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    {t("checkout.address")}
                  </label>
                  <textarea
                    name="address"
                    value={customer.address}
                    onChange={handleCustomerChange}
                    placeholder={t("checkout.addressPlaceholder")}
                    rows="4"
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    {t("checkout.notes")}
                  </label>
                  <textarea
                    name="notes"
                    value={customer.notes}
                    onChange={handleCustomerChange}
                    placeholder={t("checkout.notesPlaceholder")}
                    rows="3"
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>
              </div>
            </div>

            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              instapayTiming={instapayTiming}
              setInstapayTiming={setInstapayTiming}
              transactionReference={transactionReference}
              setTransactionReference={setTransactionReference}
            />

            <TrustBadges />

            {formError && (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {formError}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary totals={totals} checkoutButton={false} />

            <button
              type="submit"
              disabled={orderMutation.isPending}
              className="mt-4 w-full rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {orderMutation.isPending
                ? t("checkout.placingOrder")
                : t("checkout.placeOrder")}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
              {t("checkout.terms")}
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
