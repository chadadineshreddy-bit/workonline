import { Metadata } from "next";
import { MeetingMinutesSuite } from "@/components/work/meeting-minutes-suite";

export const metadata: Metadata = {
  title: "Meeting Minutes Generator — WorkOnline Work Zone",
  description:
    "Generate executive meeting minutes with attendee rolls, agenda items, key decisions, and action item tables. Download as DOCX or PDF.",
};

export default function MeetingMinutesPage() {
  return <MeetingMinutesSuite />;
}
