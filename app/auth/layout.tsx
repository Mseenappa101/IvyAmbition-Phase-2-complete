"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, Star, Shield } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const testimonials = [
  {
    quote:
      "The expert guidance made all the difference in my application journey. I couldn't have done it without IvyAmbition.",
    name: "Sarah Chen",
    detail: "Admitted to Harvard, Class of 2028",
  },
  {
    quote:
      "My coach helped me craft a personal statement that truly represented who I am. I got into my dream school.",
    name: "James Wilson",
    detail: "Admitted to Stanford, Class of 2028",
  },
  {
    quote:
      "The structured approach to applications reduced my stress and increased my confidence tenfold.",
    name: "Emily Park",
    detail: "Admitted to Yale, Class of 2029",
  },
];

const stats = [
  { icon: GraduationCap, value: "92%", label: "Acceptance Rate" },
  { icon: Star, value: "500+", label: "Students Coached" },
  { icon: Shield, value: "50+", label: "Partner Schools" },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Premium Branding */}
      <div className="bg-pattern-navy relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Subtle gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy-950/40" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500">
              <GraduationCap className="h-5 w-5 text-navy-950" />
            </div>
            <span className="font-serif text-heading-lg text-white">
              IvyAmbition
            </span>
          </Link>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative z-10">
          <blockquote className="max-w-lg">
            <p className="font-serif text-heading-xl leading-relaxed text-white/90">
              &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
            </p>
            <footer className="mt-8">
              <p className="font-sans text-body font-semibold text-gold-400">
                {testimonials[activeTestimonial].name}
              </p>
              <p className="mt-0.5 font-sans text-body-sm text-ivory-500">
                {testimonials[activeTestimonial].detail}
              </p>
            </footer>
          </blockquote>

          {/* Carousel dots */}
          <div className="mt-8 flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTestimonial(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeTestimonial
                    ? "w-8 bg-gold-500"
                    : "w-1.5 bg-ivory-600 hover:bg-ivory-500"
                )}
              />
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative z-10 flex gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <stat.icon className="h-4 w-4 text-gold-400" />
              </div>
              <div>
                <p className="font-sans text-body-sm font-bold text-white">
                  {stat.value}
                </p>
                <p className="font-sans text-caption text-ivory-600">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex w-full flex-col bg-cream-50 lg:w-1/2">
        {/* Mobile Header */}
        <div className="flex items-center gap-3 border-b border-ivory-400 px-6 py-4 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500">
            <GraduationCap className="h-4 w-4 text-navy-950" />
          </div>
          <Link href="/" className="font-serif text-heading-sm text-navy-900">
            IvyAmbition
          </Link>
        </div>

        {/* Form Area */}
        <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>

        {/* Footer */}
        <div className="border-t border-ivory-400 px-8 py-4">
          <p className="text-center font-sans text-caption text-charcoal-400">
            &copy; {new Date().getFullYear()} IvyAmbition. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
