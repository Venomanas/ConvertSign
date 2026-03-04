"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckIcon,
  SparklesIcon,
  BoltIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import PageTransition from "@/components/PageTransition";
import { CgRemoveR } from "react-icons/cg";
import { BadgeIcon } from "lucide-react";
import { SiIcon } from "react-icons/si";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Everything you need to get started.",
    icon: BoltIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    badge: null,
    cta: "Get Started Free",
    ctaHref: "/dashboard",
    ctaStyle:
      "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100",
    comingSoon: false,
    features: [
      "All 26+ conversion tools",
      "Background remover (AI)",
      "Signature creation & signing",
      "QR & barcode generator",
      "Up to 10 MB per file",
      "5 files stored in dashboard",
      "PWA — install on any device",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "per month",
    tagline: "For power users who work with files daily.",
    icon: BadgeIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-400 dark:border-indigo-600",
    badge: "Most Popular",
    cta: "Coming Soon",
    ctaHref: "#",
    ctaStyle:
      "bg-indigo-600 hover:bg-indigo-700 text-white cursor-not-allowed opacity-70",
    comingSoon: true,
    features: [
      "Everything in Free",
      "Unlimited file size",
      "Unlimited dashboard storage",
      "Batch processing (up to 20 files)",
      "PDF Compress & Split",
      "Priority processing",
      "No ads ever",
      "Early access to new tools",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$29",
    period: "per month",
    tagline: "Team collaboration and API access.",
    icon: BuildingOffice2Icon,
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    border: "border-purple-300 dark:border-purple-800",
    badge: null,
    cta: "Coming Soon",
    ctaHref: "#",
    ctaStyle:
      "bg-purple-600 hover:bg-purple-700 text-white cursor-not-allowed opacity-70",
    comingSoon: true,
    features: [
      "Everything in Pro",
      "5 team seats",
      "API access (1000 calls/mo)",
      "White-label option",
      "Custom domain",
      "Priority support (24h response)",
      "SLA guarantee",
      "Invoice / billing",
    ],
  },
];

const comparisonRows = [
  { feature: "Conversion tools", free: "26+", pro: "26+", business: "26+" },
  { feature: "Background remover", free: "✓", pro: "✓", business: "✓" },
  { feature: "Signature creation", free: "✓", pro: "✓", business: "✓" },
  {
    feature: "Max file size",
    free: "10 MB",
    pro: "Unlimited",
    business: "Unlimited",
  },
  {
    feature: "Dashboard files",
    free: "5",
    pro: "Unlimited",
    business: "Unlimited",
  },
  {
    feature: "Batch processing",
    free: "—",
    pro: "20 files",
    business: "Unlimited",
  },
  { feature: "PDF Compress", free: "—", pro: "✓", business: "✓" },
  { feature: "API access", free: "—", pro: "—", business: "1000 calls/mo" },
  { feature: "Team seats", free: "1", pro: "1", business: "5" },
  { feature: "Priority support", free: "—", pro: "—", business: "✓" },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.id === "free") return "$0";
    const base = plan.id === "pro" ? 9 : 29;
    return annual ? `$${Math.round(base * 0.75)}` : `$${base}`;
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-5">
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Start for free. Upgrade when you need more power. No hidden fees,
            cancel anytime.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                !annual
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                annual
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              Annual
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                SAVE 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative flex flex-col p-7 rounded-3xl border-2 ${plan.border} bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-shadow duration-300`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-md">
                    {plan.badge}
                  </div>
                )}

                {/* Icon + Name */}
                <div
                  className={`w-12 h-12 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-5`}
                >
                  <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                  {plan.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  {plan.tagline}
                </p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {getPrice(plan)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
                    /{plan.id === "free" ? "forever" : plan.period}
                  </span>
                  {annual && plan.id !== "free" && (
                    <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1 font-medium">
                      Billed annually — saving 25%
                    </p>
                  )}
                </div>

                {/* CTA */}
                {plan.comingSoon ? (
                  <div className="relative mb-6">
                    <button
                      disabled
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${plan.ctaStyle}`}
                    >
                      {plan.cta}
                    </button>
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full">
                      COMING SOON
                    </div>
                  </div>
                ) : (
                  <Link
                    href={plan.ctaHref}
                    className={`block text-center w-full py-3 rounded-xl font-semibold text-sm transition-all mb-6 ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </Link>
                )}

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CheckIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Full Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-200 w-1/2">
                    Feature
                  </th>
                  <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-200">
                    Free
                  </th>
                  <th className="text-center p-4 font-semibold text-indigo-600 dark:text-indigo-400">
                    Pro
                  </th>
                  <th className="text-center p-4 font-semibold text-purple-600 dark:text-purple-400">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-t border-slate-100 dark:border-slate-800 ${
                      i % 2 === 0
                        ? "bg-white dark:bg-slate-900"
                        : "bg-slate-50/50 dark:bg-slate-800/30"
                    }`}
                  >
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      {row.feature}
                    </td>
                    <td className="p-4 text-center text-slate-500 dark:text-slate-400">
                      {row.free}
                    </td>
                    <td className="p-4 text-center text-indigo-600 dark:text-indigo-400 font-medium">
                      {row.pro}
                    </td>
                    <td className="p-4 text-center text-purple-600 dark:text-purple-400 font-medium">
                      {row.business}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Is ConvertSign really free?",
                a: "Yes! All 26+ tools are free with no watermarks, no credit card required. We plan to add Pro features in the future.",
              },
              {
                q: "Is my data private?",
                a: "Absolutely. Most tools process your files entirely in your browser — they never touch our servers.",
              },
              {
                q: "When will Pro launch?",
                a: "We're actively building Pro features. Sign up to be notified when it launches — early adopters get a discount.",
              },
              {
                q: "Can I use ConvertSign offline?",
                a: "Yes! Install it as a PWA from your browser and use cached tools offline.",
              },
            ].map(faq => (
              <div
                key={faq.q}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <p className="font-semibold text-slate-800 dark:text-white mb-2">
                  {faq.q}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12 px-8 rounded-3xl bg-linear-to-br bg-indigo-900 text-white shadow-xl"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Start converting for free today
          </h2>
          <p className="text-indigo-200 mb-7 max-w-md mx-auto">
            No credit card, no signup required. Just open and use.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-md"
          >
            <SiIcon className="w-5 h-5" />
            Open ConvertSign Free
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
}
