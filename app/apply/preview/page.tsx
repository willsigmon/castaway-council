import Link from "next/link";
import { APPLICATION_QUESTIONS } from "../questions";

export const metadata = {
  title: "Castaway Council Application Preview",
  description: "Preview the five casting prompts before you sign in to submit your Castaway Council application.",
};

export default function ApplicationPreviewPage() {
  return (
    <main className="min-h-screen pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <header className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-500/80">Outwit • Outplay • Outlast</p>
          <h1 className="text-5xl font-adventure text-amber-100 torch-glow">Application Preview</h1>
          <p className="text-amber-200/80 max-w-2xl mx-auto">
            Here are the five prompts every hopeful Castaway answers. Bring energy, detail, and your unique Survivor voice—single-word responses are
            automatically skipped when we build the shortlist.
          </p>
        </header>

        <section className="glass border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
          <h2 className="text-2xl font-bold text-amber-100">The Prompts</h2>
          <ol className="space-y-6 list-decimal list-inside text-left">
            {APPLICATION_QUESTIONS.map((question) => (
              <li key={question.id} className="space-y-2">
                <p className="text-lg font-semibold text-amber-100">{question.prompt}</p>
                {question.helper && <p className="text-sm text-amber-300/70">{question.helper}</p>}
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="glass border border-emerald-500/20 rounded-3xl p-6 space-y-3">
            <h3 className="text-xl font-semibold text-emerald-300">How We Shortlist</h3>
            <ul className="space-y-2 text-sm text-amber-200/80">
              <li>• Multi-sentence answers show strategy, personality, and intent.</li>
              <li>• We total your word count—higher totals help your spot on the shortlist.</li>
              <li>• One-word or low-effort replies are marked “not considered.”</li>
            </ul>
          </div>
          <div className="glass border border-orange-500/20 rounded-3xl p-6 space-y-3">
            <h3 className="text-xl font-semibold text-orange-200">Tips From Casting</h3>
            <ul className="space-y-2 text-sm text-amber-200/80">
              <li>• Share a story. If we can picture you on the beach, you’re on the right track.</li>
              <li>• Let your gameplay philosophy shine—schemer, hero, chaos agent? Own it.</li>
              <li>• Don’t be afraid to be weird. Memorable beats safe every time.</li>
            </ul>
          </div>
        </section>

        <section className="glass border border-purple-500/30 rounded-3xl p-8 md:p-10 text-center space-y-4">
          <h2 className="text-3xl font-adventure text-amber-100">Ready to Apply?</h2>
          <p className="text-amber-200/80">
            Create a free account, then fill out the prompts above. You can edit your answers anytime—just keep them detailed to stay on the shortlist.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/signin?redirect=/apply"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold transition-all duration-200 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
            >
              Sign In To Apply
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3 glass rounded-xl border border-white/15 hover:bg-white/10 transition-all duration-200"
            >
              Return Home
              <span aria-hidden>↩</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
