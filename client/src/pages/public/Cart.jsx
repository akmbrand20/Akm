import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import BundleDiscountNotice from "../../components/cart/BundleDiscountNotice";
import FreeShippingBar from "../../components/cart/FreeShippingBar";
import SEO from "../../components/common/SEO";
import CouponBox from "../../components/cart/CouponBox";

export default function Cart() {
  const {
  cartItems,
  totals,
  coupon,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
} = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
        <SEO
  title="Cart | AKM"
  description="Review your AKM cart, bundle savings, delivery fee, and checkout total."
/>
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Cart
          </p>

          <h1 className="mt-3 text-4xl font-semibold">Your cart</h1>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
              <ShoppingBag />
            </div>

            <h2 className="mt-5 text-2xl font-semibold">Your cart is empty</h2>

            <p className="mt-3 text-zinc-400">
              Start with a clean AKM essential and build your complete set.
            </p>

            <Link
              to="/shop"
              className="mt-8 inline-block rounded-full bg-[#f7f2ea] px-7 py-3 font-medium text-black"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-20 text-[#f7f2ea] md:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
              Cart
            </p>

            <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
              Your cart
            </h1>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-left text-sm text-red-300 hover:text-red-200 md:text-right"
          >
            Clear cart
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
  <FreeShippingBar totals={totals} />
  <BundleDiscountNotice totals={totals} />
  <CouponBox
  totals={totals}
  coupon={coupon}
  applyCoupon={applyCoupon}
  removeCoupon={removeCoupon}
/>

            {cartItems.map((item) => (
              <CartItem
                key={item.cartItemId}
                item={item}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary totals={totals} />

            <Link
              to="/shop"
              className="mt-4 block rounded-full border border-white/10 px-6 py-4 text-center font-medium text-white hover:border-[#c8b89d]/60"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}