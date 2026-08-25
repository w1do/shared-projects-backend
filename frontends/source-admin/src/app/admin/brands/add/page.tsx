import { Metadata } from "next";
import { AddBrandForm } from "@/components/pages/brands/pages/add/AddBrandForm";

export const metadata: Metadata = {
  title: "Add Brand | Ætheria Admin",
  description: "Add a new cosmetics brand to the portfolio catalog.",
};

export default function AddBrandPage() {
  return <AddBrandForm />;
}
