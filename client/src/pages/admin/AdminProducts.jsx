import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Edit, Eye, EyeOff, Plus, Trash2, X } from "lucide-react";

import {
  deleteAdminProduct,
  getAdminProducts,
  toggleProductStatus,
} from "../../services/adminProductService";
import { formatCurrency } from "../../lib/formatCurrency";
import { formatProductLabel } from "../../lib/constants";
import { calculateTotalStock, getLowStockCount } from "../../lib/productStock";

function DeleteProductModal({
  product,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}) {
  if (!isOpen || !product) return null;

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
                Delete Product
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
            You are about to permanently delete{" "}
            <span className="font-semibold text-white">“{product.name}”</span>.
          </p>

          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100">
            This cannot be undone. The product will disappear from the shop and
            admin products list. Old orders will stay saved.
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
              {isDeleting ? "Deleting..." : "Delete Permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const queryClient = useQueryClient();

  const [productToDelete, setProductToDelete] = useState(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: getAdminProducts,
  });

  const invalidateProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["featuredProducts"] });
    queryClient.invalidateQueries({ queryKey: ["productFilters"] });
  };

  const statusMutation = useMutation({
    mutationFn: toggleProductStatus,
    onSuccess: invalidateProductQueries,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      invalidateProductQueries();
      setProductToDelete(null);
    },
  });

  const handleDeleteConfirm = () => {
    if (!productToDelete?._id) return;
    deleteMutation.mutate(productToDelete._id);
  };

  const isDeletingSelectedProduct =
    deleteMutation.isPending &&
    deleteMutation.variables === productToDelete?._id;

  return (
    <div>
      <DeleteProductModal
        product={productToDelete}
        isOpen={Boolean(productToDelete)}
        isDeleting={isDeletingSelectedProduct}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setProductToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#c8b89d]">
            Products
          </p>
          <h1 className="mt-3 text-4xl font-semibold">Manage products</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">
            Add any product type and control pricing, visibility, images,
            colors, sizes, and stock.
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f7f2ea] px-5 py-3 text-sm font-semibold text-black transition hover:bg-white"
        >
          <Plus size={17} />
          Add Product
        </Link>
      </div>

      {deleteMutation.isError && (
        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {deleteMutation.error?.response?.data?.message ||
            "Failed to delete product."}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {isLoading ? (
          <p className="p-6 text-zinc-400">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-zinc-400">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-zinc-400">
                <tr>
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">Category</th>
                  <th className="px-5 py-4 font-medium">Price</th>
                  <th className="px-5 py-4 font-medium">Stock</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const blackColor = product.colors?.find(
                    (color) => color.name?.toLowerCase() === "black"
                  );

                  const firstImage =
                    blackColor?.images?.[0]?.url ||
                    product.colors?.[0]?.images?.[0]?.url;

                  const totalStock = calculateTotalStock(product);
                  const lowStockCount = getLowStockCount(product);

                  const isDeleting =
                    deleteMutation.isPending &&
                    deleteMutation.variables === product._id;

                  const isToggling =
                    statusMutation.isPending &&
                    statusMutation.variables === product._id;

                  return (
                    <tr
                      key={product._id}
                      className="border-b border-white/10 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 overflow-hidden rounded-2xl bg-white/[0.04]">
                            {firstImage ? (
                              <img
                                src={firstImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <img
                                src="/images/akm-logo.webp"
                                alt="AKM"
                                className="h-full w-full object-cover opacity-50"
                              />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              /product/{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {formatProductLabel(product.category)}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold">{totalStock} pieces</p>
                        {lowStockCount > 0 && (
                          <p className="mt-1 text-xs text-[#c8b89d]">
                            {lowStockCount} low-stock variant
                            {lowStockCount > 1 ? "s" : ""}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs ${
                            product.isActive
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                              : "border-red-400/20 bg-red-500/10 text-red-200"
                          }`}
                        >
                          {product.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            to={`/admin/products/${product._id}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white hover:border-[#c8b89d]/60"
                          >
                            <Edit size={14} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => statusMutation.mutate(product._id)}
                            disabled={isToggling || isDeleting}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-[#c8b89d]/60 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {product.isActive ? (
                              <>
                                <EyeOff size={14} />
                                {isToggling ? "Hiding..." : "Hide"}
                              </>
                            ) : (
                              <>
                                <Eye size={14} />
                                {isToggling ? "Showing..." : "Show"}
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            disabled={isDeleting || isToggling}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 px-3 py-2 text-xs text-red-200 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Trash2 size={14} />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}