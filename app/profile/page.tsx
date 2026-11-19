import { Metadata } from "next";
import { ProfileSuite } from "@/components/profile/profile-suite";

export const metadata: Metadata = {
  title: "Account Profile — WorkOnline",
  description: "Manage your personal WorkOnline profile, identity, and workspace preferences.",
};

export default function ProfilePage() {
  return <ProfileSuite />;
}
