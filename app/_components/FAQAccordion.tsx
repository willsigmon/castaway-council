"use client";

import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
}

function FAQItemComponent({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-amber-900/30 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 text-left
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-orange-600 focus-visible:ring-offset-2
                   focus-visible:ring-offset-stone-950 focus-visible:outline-none"
        aria-expanded={isOpen}
      >
        <h4 className="font-semibold text-amber-100">{question}</h4>
        <span
          className={`text-xl text-amber-700 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>
      <div
        className={`grid transition-all duration-200 ${
          isOpen ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-amber-300/70 text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  return (
    <div>
      {faqs.map((faq, i) => (
        <FAQItemComponent key={i} question={faq.q} answer={faq.a} />
      ))}
    </div>
  );
}
