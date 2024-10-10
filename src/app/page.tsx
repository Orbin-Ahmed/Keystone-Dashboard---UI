import { Metadata } from "next";
import HeroSection from "@/components/Client/HeroSection";
import AboutComponent from "@/components/Client/AboutComponent";
import CatalogueSection from "@/components/Client/CatalogueSection";
import CatalogSwiperSection from "@/components/Client/CatalogSwiperCection";
import ContactSection from "@/components/Client/ContactSection";
import CompanySection from "@/components/Client/CompanySection";
import Header from "@/components/Client/Header";
import Footer from "@/components/Client/Footer";

export const metadata: Metadata = {
  title: "Home || Ideal Home Interior",
  description: "This is the Home Page.",
};

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      {/* <CompanySection /> */}
      <AboutComponent />
      <CatalogueSection />
      <CatalogSwiperSection />
      <ContactSection />
      <Footer />
    </>
  );
}
