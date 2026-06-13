import { useQuery } from "@tanstack/react-query";
import { getOffers } from "../services/offerService";

export const publicOffersQuery = {
  queryKey: ["offers"],
  queryFn: getOffers,
};

export function usePublicOffers() {
  return useQuery(publicOffersQuery);
}
