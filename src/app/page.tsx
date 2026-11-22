import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ClubSite } from "@/components/landing/ClubSite";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mesivta Hack Club",
  description: "Mesivta's coding club, part of Hack Club. Sign up or log in.",
};

/**
 * Landing page = the public club site (sign up / log in via Hack Club).
 * Signed-in users skip straight to their workspace.
 */
export default async function HomePage() {
  const sess = await getSession();
  if (sess) {
    redirect("/dashboard");
  }
  return <ClubSite />;
}
