import { Copy } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useLanguage } from "../../hooks/useLanguage";

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
  instapayTiming,
  setInstapayTiming,
  transactionReference,
  setTransactionReference,
}) {
  const { instapayQr, instapayNumber, vodafoneCashNumber } = useSettings();
  const { t, isArabic } = useLanguage();
  const isInstapay = paymentMethod === "Instapay";
  const isVodafoneCash = paymentMethod === "Vodafone Cash";
  const requiresPaymentTiming = isInstapay || isVodafoneCash;
  const paymentNumber = isVodafoneCash ? vodafoneCashNumber : instapayNumber;

  const copyPaymentNumber = async () => {
    try {
      await navigator.clipboard.writeText(paymentNumber);
    } catch (error) {
      console.log("Could not copy payment number:", error.message);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-2xl font-semibold">{t("payment.title")}</h2>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => {
            setPaymentMethod("Cash on Delivery");
            setInstapayTiming("");
            setTransactionReference("");
          }}
          className={`rounded-2xl border p-4 transition ${
            paymentMethod === "Cash on Delivery"
              ? "border-[#c8b89d] bg-[#c8b89d]/10"
              : "border-white/10 bg-black/20 hover:border-white/30"
          } ${isArabic ? "text-right" : "text-left"}`}
        >
          <p className="font-semibold">{t("payment.cod")}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {t("payment.codText")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("Instapay")}
          className={`rounded-2xl border p-4 transition ${
            paymentMethod === "Instapay"
              ? "border-[#c8b89d] bg-[#c8b89d]/10"
              : "border-white/10 bg-black/20 hover:border-white/30"
          } ${isArabic ? "text-right" : "text-left"}`}
        >
          <p className="font-semibold">{t("payment.instapay")}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {t("payment.instapayText")}
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setPaymentMethod("Vodafone Cash");
            setInstapayTiming("");
            setTransactionReference("");
          }}
          className={`rounded-2xl border p-4 transition ${
            paymentMethod === "Vodafone Cash"
              ? "border-[#c8b89d] bg-[#c8b89d]/10"
              : "border-white/10 bg-black/20 hover:border-white/30"
          } ${isArabic ? "text-right" : "text-left"}`}
        >
          <p className="font-semibold">{t("payment.vodafoneCash")}</p>
          <p className="mt-1 text-sm text-zinc-400">
            {t("payment.vodafoneCashText")}
          </p>
        </button>
      </div>

      {requiresPaymentTiming && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="font-semibold">{t("payment.timing")}</p>

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
              {t("payment.payNow")}
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
              {t("payment.payOnDelivery")}
            </button>
          </div>

          {instapayTiming === "Pay Now" && (
            <div className="mt-4">
              <div className="mb-4 rounded-2xl border border-[#c8b89d]/20 bg-[#c8b89d]/10 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-[#c8b89d]">
                  {isVodafoneCash
                    ? t("payment.paymentNumber")
                    : t("payment.number")}
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-2xl font-semibold text-white">
                    {paymentNumber}
                  </p>

                  <button
                    type="button"
                    onClick={copyPaymentNumber}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-[#c8b89d]/60"
                  >
                    <Copy size={15} />
                    {t("payment.copy")}
                  </button>
                </div>
              </div>

              {isInstapay && instapayQr?.url ? (
                <div className="mb-4 rounded-2xl border border-white/10 bg-white p-4">
                  <img
                    src={instapayQr.url}
                    alt={t("payment.qrAlt")}
                    className="mx-auto max-h-64 object-contain"
                  />
                </div>
              ) : isInstapay ? (
                <div className="mb-4 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                  {t("payment.qrFallback")}
                </div>
              ) : null}

              <label className="text-sm text-zinc-300">
                {isVodafoneCash
                  ? t("payment.vodafoneReference")
                  : t("payment.reference")}
              </label>
              <input
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder={t("payment.referencePlaceholder")}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />

              <p className="mt-3 text-xs leading-5 text-zinc-500">
                {isVodafoneCash
                  ? t("payment.vodafonePending")
                  : t("payment.pending")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
