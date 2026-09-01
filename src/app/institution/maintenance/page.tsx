import { redirect } from "next/navigation";

export default function InstitutionMaintenancePage() {
  // Redirects to services page as maintenance is handled there for institutions
  redirect("/institution/services");
}
