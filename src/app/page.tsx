import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/auth/constants";

export default function HomePage() {
  redirect(ROUTES.products);
}
