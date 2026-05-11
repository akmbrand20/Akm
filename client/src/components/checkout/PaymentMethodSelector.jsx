import { Copy } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
  instapayTiming,
  setInstapayTiming,
  transactionReference,
  setTransactionReference,
}) {
  const { instapayQr, instapayNumber } = useSettings();

  const copyInstapayNumber = async () => {
    try {
      await navigator.clipboard.writeText(instapayNumber);
    } catch (error) {
      console.log("Could not copy Instapay number:", error.message);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-2xl font-semibold">Payment Method</h2>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => {
            setPaymentMethod("Cash on Delivery");
            setInstapayTiming("");
            setTransactionReference("");
          }}
          className={`rounded-2xl border p-4 text-left transition ${
            paymentMethod === "Cash on Delivery"
              ? "border-[#c8b89d] bg-[#c8b89d]/10"
              : "border-white/10 bg-black/20 hover:border-white/30"
          }`}
        >
          <p className="font-semibold">Cash on Delivery</p>
          <p className="mt-1 text-sm text-zinc-400">
            Pay in cash when your order arrives.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("Instapay")}
          className={`rounded-2xl border p-4 text-left transition ${
            paymentMethod === "Instapay"
              ? "border-[#c8b89d] bg-[#c8b89d]/10"
              : "border-white/10 bg-black/20 hover:border-white/30"
          }`}
        >
          <p className="font-semibold">Instapay</p>
          <p className="mt-1 text-sm text-zinc-400">
            Pay now or choose to pay by Instapay on delivery.
          </p>
        </button>
      </div>

      {paymentMethod === "Instapay" && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="font-semibold">Instapay Timing</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setInstapayTiming("Pay Now")}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                instapayTiming === "Pay Now"
                  ? "border-[#c8b89d] bg-[#c8b89d]/10 text-white"
                  : "border-white/10 text-zinc-300"
              }`}
            >
              Pay Now
            </button>

            <button
              type="button"
              onClick={() => {
                setInstapayTiming("Pay on Delivery");
                setTransactionReference("");
              }}
              className={`rounded-2xl border px-4 py-3 text-sm ${
                instapayTiming === "Pay on Delivery"
                  ? "border-[#c8b89d] bg-[#c8b89d]/10 text-white"
                  : "border-white/10 text-zinc-300"
              }`}
            >
              Pay on Delivery
            </button>
          </div>

          {instapayTiming === "Pay Now" && (
            <div className="mt-4">
              <div className="mb-4 rounded-2xl border border-[#c8b89d]/20 bg-[#c8b89d]/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#c8b89d]">
                  Instapay Number
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-2xl font-semibold text-white">
                    {instapayNumber}
                  </p>

                  <button
                    type="button"
                    onClick={copyInstapayNumber}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#c8b89d]/60"
                  >
                    <Copy size={15} />
                    Copy
                  </button>
                </div>
              </div>

              {instapayQr?.url ? (
                <div className="mb-4 rounded-2xl border border-white/10 bg-white p-4">
                  <img
                    src={instapayQr.url}
                    alt="Instapay QR"
                    className="mx-auto max-h-64 object-contain"
                  />
                </div>
              ) : (
                <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                  Instapay QR will be added soon. You can still place your
                  order and AKM will confirm payment details.
                </div>
              )}

              <label className="text-sm text-zinc-300">
                Transaction reference, optional
              </label>
              <input
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="Example: payment reference or note"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                The order will be marked as pending payment verification until
                AKM confirms the transfer.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}