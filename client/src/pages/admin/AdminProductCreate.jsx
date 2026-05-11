import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  createAdminProduct,
} from "../../services/adminProductService";
import ProductForm, {
  createDefaultProductForm,
} from "../../components/admin/ProductForm";

export default function AdminProductCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["featuredProducts"] });
      queryClient.invalidateQueries({ queryKey: ["productFilters"] });

      navigate(`/admin/products/${product._id}`);
    },
  });

  return (
    <ProductForm
      title="Add product"
      subtitle="Add any item type, choose any colors, upload images, and set custom sizes with stock."
      initialForm={createDefaultProductForm()}
      submitLabel="Create Product"
      loadingLabel="Creating..."
      mutation={createMutation}
      onSubmit={(productData) => createMutation.mutate(productData)}
    />
  );
}