import { HeroSection } from "@/components/hero-section";
import {
  PopularToolsSection,
  PdfSection,
  StudentSection,
  WorkSection,
  AiSection,
  ValuePropsSection,
  AboutCreatorSection,
} from "@/components/homepage-sections";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <HeroSection />
      <PopularToolsSection />
      <PdfSection />
      <StudentSection />
      <WorkSection />
      <AiSection />
      <ValuePropsSection />
      <AboutCreatorSection />
    </div>
  );
}
