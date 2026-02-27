import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "IvyAmbition — Premium Admissions Consulting",
  description:
    "Elite college admissions consulting. Expert guidance from former admissions officers and Ivy League graduates.",
  keywords: [
    "college admissions",
    "ivy league",
    "admissions consulting",
    "college coaching",
    "university applications",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-cream-100 font-sans text-charcoal-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#ffffff",
              color: "#111114",
              border: "1px solid #f0ebe0",
              boxShadow:
                "0 10px 25px rgba(11, 21, 39, 0.08), 0 4px 10px rgba(11, 21, 39, 0.04)",
              borderRadius: "0.75rem",
              fontFamily: '"Inter", system-ui, sans-serif',
              fontSize: "0.875rem",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#a3344a",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
