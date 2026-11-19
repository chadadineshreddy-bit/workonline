import { Metadata } from "next";
import { SettingsSuite } from "@/components/settings/settings-suite";

export const metadata: Metadata = {
  title: "Account Settings — WorkOnline",
  description: "Manage your WorkOnline security, password, notifications, and account controls.",
};

export default function SettingsPage() {
  return <SettingsSuite />;
}
