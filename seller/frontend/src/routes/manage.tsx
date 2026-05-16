import { createFileRoute } from "@tanstack/react-router";
import { ManageProductsPage } from "@/components/manage/ManageProductsPage";

export const Route = createFileRoute("/manage")({
  component: ManageProductsPage,
});
