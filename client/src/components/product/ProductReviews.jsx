import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";

import { useCustomerAuth } from "../../context/CustomerAuthContext";
import {
  getCustomerReviewStatus,
  getProductReviews,
  submitCustomerReview,
} from "../../services/reviewService";
import { useLanguage } from "../../hooks/useLanguage";

function Stars({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1 text-[#c8b89d]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= Number(rating) ? "fill-current" : ""}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ product }) {
  const queryClient = useQueryClient();
  const { isCustomerLoggedIn } = useCustomerAuth();
  const { t } = useLanguage();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const productId = product?._id;

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
  } = useQuery({
    queryKey: ["productReviews", productId],
    queryFn: () => getProductReviews(productId),
    enabled: Boolean(productId),
  });

  const {
    data: reviewStatus,
    isLoading: statusLoading,
  } = useQuery({
    queryKey: ["customerReviewStatus", productId],
    queryFn: () => getCustomerReviewStatus(productId),
    enabled: Boolean(productId && isCustomerLoggedIn),
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: submitCustomerReview,
    onSuccess: (data) => {
      setComment("");
      setRating(5);
      setSuccessMessage(data.message || t("reviews.submitted"));
      queryClient.invalidateQueries({
        queryKey: ["customerReviewStatus", productId],
      });
    },
  });

  const approvedReviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.averageRating || 0;

  const shouldShowSection = useMemo(() => {
    if (approvedReviews.length > 0) return true;
    if (isCustomerLoggedIn) return true;
    return false;
  }, [approvedReviews.length, isCustomerLoggedIn]);

  if (reviewsLoading) {
    return null;
  }

  if (!shouldShowSection) {
    return null;
  }

  const canReview = Boolean(reviewStatus?.canReview);
  const hasPurchased = Boolean(reviewStatus?.hasPurchased);
  const remainingReviews = reviewStatus?.remainingReviews ?? 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage("");

    submitMutation.mutate({
      productId,
      rating,
      comment,
    });
  };

  return (
    <section className="mt-20 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            {t("reviews.label")}
          </p>

          <h2 className="mt-3 text-3xl font-semibold">
            {t("reviews.title")}
          </h2>

          {approvedReviews.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <Stars rating={Math.round(averageRating)} />
              <span>
                {t("reviews.average", {
                  rating: averageRating,
                  count: approvedReviews.length,
                  reviewWord:
                    approvedReviews.length === 1
                      ? t("reviews.reviewSingular")
                      : t("reviews.reviewPlural"),
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {approvedReviews.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {approvedReviews.map((review) => (
            <article
              key={review._id}
              className="rounded-3xl border border-white/10 bg-black/25 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">
                    {review.reviewerName}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <Stars rating={review.rating} />
              </div>

              <p className="mt-4 leading-7 text-zinc-300">
                {review.comment}
              </p>
            </article>
          ))}
        </div>
      )}

      {isCustomerLoggedIn && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-black/25 p-5">
          <h3 className="text-xl font-semibold">{t("reviews.write")}</h3>

          {statusLoading ? (
            <p className="mt-3 text-sm text-zinc-400">
              {t("reviews.checking")}
            </p>
          ) : canReview ? (
            <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
              <div>
                <label className="text-sm text-zinc-300">
                  {t("reviews.rating")}
                </label>

                <div className="mt-2 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        rating === value
                          ? "border-[#c8b89d] bg-[#c8b89d] text-black"
                          : "border-white/10 text-zinc-300 hover:border-[#c8b89d]/60"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-300">
                  {t("reviews.review")}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  placeholder={t("reviews.placeholder")}
                  className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
                />
              </div>

              {submitMutation.isError && (
                <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {submitMutation.error?.response?.data?.message ||
                    t("reviews.failed")}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-[#c8b89d]/30 bg-[#c8b89d]/10 px-4 py-3 text-sm text-[#e8d6b8]">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitMutation.isPending || !comment.trim()}
                className="rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitMutation.isPending
                  ? t("reviews.submitting")
                  : t("reviews.submit", { count: remainingReviews })}
              </button>
            </form>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-zinc-400">
              {!hasPurchased
                ? t("reviews.needPurchase")
                : t("reviews.limitReached")}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
