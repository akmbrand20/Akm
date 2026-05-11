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

import {
  trackInitiateCheckout,
  trackPurchase,
} from "../../tracking/trackingEvents";

export default function Checkout() {
  const navigate = useNavigate();
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
          "Something went wrong while creating your order."
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
    if (!customer.fullName.trim()) return "Full name is required.";
    if (!customer.phone.trim()) return "Phone number is required.";
    if (!customer.city.trim()) return "City/Governorate is required.";
    if (!customer.address.trim()) return "Full address is required.";
    if (!paymentMethod) return "Payment method is required.";

    if (paymentMethod === "Instapay" && !instapayTiming) {
      return "Please choose when you will pay by Instapay.";
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
          title="Checkout | AKM"
          description="Complete your AKM order with guest checkout, Cash on Delivery, or Instapay."
        />

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Checkout
          </p>

          <h1 className="mt-3 text-4xl font-semibold">Your cart is empty</h1>

          <p className="mt-4 text-zinc-400">
            Add your AKM essentials first, then continue to checkout.
          </p>

          <Link
            to="/shop"
            className="mt-8 inline-block rounded-full bg-[#f7f2ea] px-7 py-3 font-medium text-black"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
      <SEO
        title="Checkout | AKM"
        description="Complete your AKM order with guest checkout, Cash on Delivery, or Instapay."
      />

      <div className="mx-auto max-w-6xl">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-[#c8b89d] hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to cart
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Checkout
          </p>

          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
            Complete your order
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Guest checkout. No account required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]"
        >
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-2xl font-semibold">Customer Details</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-zinc-300">Full name *</label>
                  <input
                    name="fullName"
                    value={customer.fullName}
                    onChange={handleCustomerChange}
                    placeholder="Your full name"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    Phone number *
                  </label>
                  <input
                    name="phone"
                    value={customer.phone}
                    onChange={handleCustomerChange}
                    placeholder="01xxxxxxxxx"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    Second phone, optional
                  </label>
                  <input
                    name="secondPhone"
                    value={customer.secondPhone}
                    onChange={handleCustomerChange}
                    placeholder="Optional"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    Email, optional
                  </label>
                  <input
                    name="email"
                    value={customer.email}
                    onChange={handleCustomerChange}
                    placeholder="example@email.com"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-2xl font-semibold">Delivery Address</h2>

              <div className="mt-5 grid gap-4">
                <div>
                  <label className="text-sm text-zinc-300">
                    City/Governorate *
                  </label>
                  <input
                    name="city"
                    value={customer.city}
                    onChange={handleCustomerChange}
                    placeholder="Cairo, Giza, Alexandria..."
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    Full address *
                  </label>
                  <textarea
                    name="address"
                    value={customer.address}
                    onChange={handleCustomerChange}
                    placeholder="Street, building, floor, apartment, landmark..."
                    rows="4"
                    className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-300">
                    Order notes, optional
                  </label>
                  <textarea
                    name="notes"
                    value={customer.notes}
                    onChange={handleCustomerChange}
                    placeholder="Any delivery notes?"
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
              {orderMutation.isPending ? "Placing order..." : "Place Order"}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
              By placing your order, you confirm that your information is
              correct and AKM may contact you to confirm delivery.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}