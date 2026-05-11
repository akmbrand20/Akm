import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Check, Plus, Star, Trash2, X } from "lucide-react";

import {
  createAdminReview,
  deleteAdminReview,
  getAdminReviews,
  updateAdminReviewStatus,
} from "../../services/adminReviewService";
import { getAdminProducts } from "../../services/adminProductService";

const defaultForm = {
  productId: "",
  reviewerName: "",
  rating: 5,
  comment: "",
};

function Stars({ rating = 0 }) {
  return (
    <div className="flex items-center gap-1 text-[#c8b89d]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= Number(rating) ? "fill-current" : ""}
        />
      ))}
    </div>
  );
}

function DeleteReviewModal({ review, isDeleting, onClose, onConfirm }) {
  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-5 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#080808] shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-red-400/20 bg-red-500/10 text-red-200">
              <AlertTriangle size={22} />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[#c8b89d]">
                Delete Review
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Are you sure?
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close delete modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="leading-7 text-zinc-300">
            You are about to delete the review from{" "}
            <span className="font-semibold text-white">
              “{review.reviewerName}”
            </span>
            .
          </p>

          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
            This cannot be undone. If this review is approved, it will disappear
            from the product page immediately.
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white transition hover:border-[#c8b89d]/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-red-200 px-5 py-3 text-sm font-semibold text-black transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Delete Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminReviews() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(defaultForm);
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["adminReviews", statusFilter],
    queryFn: () =>
      getAdminReviews({
        status: statusFilter || undefined,
      }),
  });

  const pendingCount = useMemo(() => {
    return reviews.filter((review) => review.status === "pending").length;
  }, [reviews]);

  const invalidateReviewQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
    queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    queryClient.invalidateQueries({ queryKey: ["customerReviewStatus"] });
  };

  const createMutation = useMutation({
    mutationFn: createAdminReview,
    onSuccess: () => {
      invalidateReviewQueries();
      setForm(defaultForm);
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateAdminReviewStatus,
    onSuccess: invalidateReviewQueries,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      invalidateReviewQueries();
      setReviewToDelete(null);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    createMutation.mutate({
      productId: form.productId,
      reviewerName: form.reviewerName.trim(),
      rating: Number(form.rating),
      comment: form.comment.trim(),
    });
  };

  const isDeletingSelectedReview =
    deleteMutation.isPending && deleteMutation.variables === reviewToDelete?._id;

  return (
    <div>
      <DeleteReviewModal
        review={reviewToDelete}
        isDeleting={isDeletingSelectedReview}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setReviewToDelete(null);
          }
        }}
        onConfirm={() => {
          if (reviewToDelete?._id) {
            deleteMutation.mutate(reviewToDelete._id);
          }
        }}
      />

      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
          Reviews
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Product reviews</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Add manual reviews, approve customer reviews, reject spam, and control
          what appears on product pages.
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 xl:self-start"
        >
          <h2 className="text-2xl font-semibold">Add Manual Review</h2>

          <div className="mt-5 grid gap-4">
            <div>
              <label className="text-sm text-zinc-300">Product</label>
              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
              >
                <option value="">Choose product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-300">Reviewer name</label>
              <input
                name="reviewerName"
                value={form.reviewerName}
                onChange={handleChange}
                placeholder="Reviewer name"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-300">Rating</label>
              <select
                name="rating"
                value={form.rating}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
              >
                <option value={5}>5 stars</option>
                <option value={4}>4 stars</option>
                <option value={3}>3 stars</option>
                <option value={2}>2 stars</option>
                <option value={1}>1 star</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-zinc-300">Review</label>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                rows="5"
                placeholder="Write the review..."
                className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-[#c8b89d]/60"
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {createMutation.error?.response?.data?.message ||
                "Failed to add review."}
            </div>
          )}

          <button
            type="submit"
            disabled={
              createMutation.isPending ||
              productsLoading ||
              !form.productId ||
              !form.reviewerName.trim() ||
              !form.comment.trim()
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#f7f2ea] px-6 py-4 font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={17} />
            {createMutation.isPending ? "Adding..." : "Add Review"}
          </button>
        </form>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Review Queue</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {pendingCount} pending review{pendingCount === 1 ? "" : "s"}.
              </p>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#c8b89d]/60"
            >
              <option value="">All reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {reviewsLoading ? (
            <p className="p-6 text-zinc-400">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="p-6 text-zinc-400">No reviews found.</p>
          ) : (
            <div className="grid gap-4 p-5">
              {reviews.map((review) => {
                const isUpdating =
                  statusMutation.isPending &&
                  statusMutation.variables?.id === review._id;

                const isDeleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === review._id;

                return (
                  <article
                    key={review._id}
                    className="rounded-3xl border border-white/10 bg-black/25 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            {review.reviewerName}
                          </h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs capitalize ${
                              review.status === "approved"
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                                : review.status === "rejected"
                                ? "border-red-400/20 bg-red-500/10 text-red-200"
                                : "border-[#c8b89d]/30 bg-[#c8b89d]/10 text-[#e8d6b8]"
                            }`}
                          >
                            {review.status}
                          </span>

                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400 capitalize">
                            {review.source}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-zinc-500">
                          {review.productId?.name || "Deleted product"}
                        </p>

                        <div className="mt-3">
                          <Stars rating={review.rating} />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {review.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() =>
                              statusMutation.mutate({
                                id: review._id,
                                status: "approved",
                              })
                            }
                            disabled={isUpdating || isDeleting}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 px-3 py-2 text-xs text-emerald-200 hover:bg-emerald-500/10 disabled:opacity-60"
                          >
                            <Check size={14} />
                            Approve
                          </button>
                        )}

                        {review.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              statusMutation.mutate({
                                id: review._id,
                                status: "rejected",
                              })
                            }
                            disabled={isUpdating || isDeleting}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-60"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setReviewToDelete(review)}
                          disabled={isUpdating || isDeleting}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-red-300/40 hover:text-red-200 disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="mt-5 leading-7 text-zinc-300">
                      {review.comment}
                    </p>

                    {review.reviewerEmail && (
                      <p className="mt-4 text-xs text-zinc-500">
                        {review.reviewerEmail}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}