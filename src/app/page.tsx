import { Metadata } from "next";
import HomePage from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "Arannati - Профессиональная косметика премиум класса",
  description:
    "Эксклюзивный дистрибьютор ведущих мировых брендов профессиональной косметики в Казахстане. Holy Land, Christina, Janssen Cosmetics и другие.",
  keywords: [
    "профессиональная косметика",
    "Holy Land",
    "Christina",
    "Janssen Cosmetics",
    "косметология",
    "Казахстан",
  ],
  openGraph: {
    title: "Arannati - Профессиональная косметика премиум класса",
    description:
      "Эксклюзивный дистрибьютор ведущих мировых брендов профессиональной косметики в Казахстане",
    type: "website",
    url: "https://arannati.kz",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Arannati - Профессиональная косметика",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arannati - Профессиональная косметика премиум класса",
    description:
      "Эксклюзивный дистрибьютор ведущих мировых брендов профессиональной косметики",
    images: ["/images/og-image.jpg"],
  },
};

export default function Page() {
  return <HomePage />;
}
