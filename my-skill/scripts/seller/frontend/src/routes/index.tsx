import { createFileRoute } from "@tanstack/react-router";
import { AddProductPage } from "@/components/add-product/AddProductPage";

export const Route = createFileRoute("/")({
  component: AddProductPage,
});
