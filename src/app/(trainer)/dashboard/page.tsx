import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllUnitStates } from "@/lib/progress";
import { ProductMap } from "@/components/ProductMap";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const states = await getAllUnitStates(user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <ProductMap states={states} />
    </div>
  );
}
