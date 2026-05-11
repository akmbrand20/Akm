import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminProductById,
  updateAdminProduct,
} from "../../services/adminProductService";
import ProductForm from "../../components/admin/ProductForm";

export default function AdminProductEdit() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [initialForm, setInitialForm] = useState(null);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminProduct", id],
    queryFn: () => getAdminProductById(id),
  });

  useEffect(() => {
    if (product) {
      setInitialForm({
        name: product.name || "",
        slug: product.slug || "",
        category: product.category || "",
        price: product.price || "",
        oldPrice: product.oldPrice ?? "",
        description: product.description || "",
        fabric: product.fabric || "",
        fit: product.fit || "",
        careInstructions: product.careInstructions || "",
        colors: product.colors?.length ? product.colors : [],
        featured: Boolean(product.featured),
        isActive: Boolean(product.isActive),
      });
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: updateAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["adminProduct", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featuredProducts"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      queryClient.invalidateQueries({ queryKey: ["productFilters"] });
    },
  });

  if (isLoading || !initialForm) {
    return <p className="text-zinc-400">Loading product...</p>;
  }

  if (isError) {
    return <p className="text-red-300">Product not found.</p>;
  }

  return (
    <ProductForm
      title={`Edit ${product.name}`}
      subtitle="Update product details, colors, sizes, stock, and images."
      initialForm={initialForm}
      submitLabel="Save Changes"
      loadingLabel="Saving..."
      mutation={updateMutation}
      onSubmit={(productData) =>
        updateMutation.mutate({
          id,
          productData,
        })
      }
    />
  );
}