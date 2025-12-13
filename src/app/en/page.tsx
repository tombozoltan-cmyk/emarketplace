import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ServicesSection } from "@/components/ServicesSection";
import { WhyUsSection } from "@/components/WhyUsSection";
import { OffersSection } from "@/components/OffersSection";
import { BlogSection } from "@/components/BlogSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { ClientsSection } from "@/components/ClientsSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { FinalCtaSection } from "@/components/FinalCtaSection";

export default function HomeEn() {
  return (
    <main className="flex w-full flex-col items-center">
      <Header />
      <Hero />
      <ServicesSection />
      <WhyUsSection />
      <ClientsSection />
      <OffersSection />
      <BlogSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
    </main>
  );
}
