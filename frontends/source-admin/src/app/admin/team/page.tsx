import { Metadata } from "next";
import TeamPage from "@/components/pages/team";

export const metadata: Metadata = {
  title: "Team Management | Ætheria Admin",
  description: "Manage workspace users, edit statuses, and assign roles.",
};

export default function TeamPageRoute() {
  return <TeamPage />;
}
