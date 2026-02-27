import Link from "next/link";
import { ArrowRight, GraduationCap, Star, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-pattern-navy relative overflow-hidden px-6 py-24 text-white lg:py-36">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 font-sans text-overline uppercase tracking-widest text-gold-400">
            Premium Admissions Consulting
          </p>
          <h1 className="font-serif text-display-xl text-white">
            Your Path to the
            <span className="text-gradient-gold"> Ivy League</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-body-lg text-ivory-400">
            Expert guidance from former admissions officers and Ivy League
            graduates. We help ambitious students craft compelling applications
            that stand out.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-8 py-3.5 font-sans text-body font-semibold text-navy-950 shadow-gold-glow transition-all hover:bg-gold-400 hover:shadow-lg"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl border border-ivory-500/20 px-8 py-3.5 font-sans text-body font-medium text-ivory-300 transition-all hover:border-ivory-400/40 hover:text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="bg-gradient-cream px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-serif text-display text-navy-900">
              Why IvyAmbition?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-sans text-body-lg text-charcoal-400">
              We combine deep admissions expertise with personalized coaching to
              maximize your chances of acceptance.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Expert Coaches",
                description:
                  "Work with former admissions officers from top-20 universities who know exactly what committees look for.",
              },
              {
                icon: Star,
                title: "Proven Results",
                description:
                  "Our students consistently achieve acceptance rates 3x higher than the national average at target schools.",
              },
              {
                icon: Users,
                title: "Personal Attention",
                description:
                  "Limited enrollment ensures every student receives individualized strategy and hands-on essay guidance.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-ivory-400 bg-gradient-card p-8 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900">
                  <item.icon className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="font-serif text-heading-lg text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-3 font-sans text-body text-charcoal-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ivory-400 bg-cream-50 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-serif text-heading-sm text-navy-900">
            IvyAmbition
          </p>
          <p className="font-sans text-body-sm text-charcoal-400">
            &copy; {new Date().getFullYear()} IvyAmbition. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
