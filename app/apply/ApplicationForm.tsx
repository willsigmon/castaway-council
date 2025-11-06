"use client";

import { useMemo, useState } from "react";
import { APPLICATION_QUESTIONS, ApplicationQuestionId } from "./questions";

type ApplicationStatus = "shortlist" | "not_considered";

interface ApplicationFormProps {
  initialApplication: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
    status: ApplicationStatus;
    wordScore: number;
    updatedAt: string;
    createdAt: string;
  } | null;
}

type Answers = Record<ApplicationQuestionId, string>;

function countWords(value: string): number {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function ApplicationForm({ initialApplication }: ApplicationFormProps) {
  const [answers, setAnswers] = useState<Answers>(() => ({
    q1: initialApplication?.q1 ?? "",
    q2: initialApplication?.q2 ?? "",
    q3: initialApplication?.q3 ?? "",
    q4: initialApplication?.q4 ?? "",
    q5: initialApplication?.q5 ?? "",
  }));
  const [status, setStatus] = useState<ApplicationStatus | null>(initialApplication?.status ?? null);
  const [wordScore, setWordScore] = useState<number | null>(initialApplication?.wordScore ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(!initialApplication);
  const [hasSubmitted, setHasSubmitted] = useState(Boolean(initialApplication));
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialApplication?.updatedAt ?? null);

  const wordCounts = useMemo(
    () =>
      Object.entries(answers).reduce<Record<string, number>>((acc, [key, value]) => {
        acc[key] = countWords(value);
        return acc;
      }, {}),
    [answers]
  );

  const isFormComplete = useMemo(
    () => Object.values(answers).every((value) => value.trim().length > 0),
    [answers]
  );

  const shortlistEligible = useMemo(
    () => Object.values(wordCounts).every((count) => count > 1),
    [wordCounts]
  );

  const statusDescription =
    status === "shortlist"
      ? "Nice work! Long-form answers help casting hear your voice. We’ll reach out when the next season is forming."
      : "Add more depth to each prompt—applications with single-word answers are automatically moved off the shortlist.";

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleChange = (id: ApplicationQuestionId, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
    setHasChanges(true);
    setError(null);
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormComplete || isSaving || !hasChanges) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const sanitizedAnswers = APPLICATION_QUESTIONS.reduce((acc, question) => {
        acc[question.id] = answers[question.id].trim();
        return acc;
      }, {} as Answers);

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedAnswers),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Failed to save application");
      }

      const payload = (await response.json()) as {
        status: ApplicationStatus;
        wordScore: number;
        updatedAt: string;
      };
      setAnswers(sanitizedAnswers);
      setStatus(payload.status);
      setWordScore(payload.wordScore);
      setLastSavedAt(payload.updatedAt);
      setHasChanges(false);
      setHasSubmitted(true);
      setMessage(
        payload.status === "shortlist"
          ? "🔥 You’re on the shortlist! We love the detail you brought."
          : "Your application is saved, but add more detail to be considered."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const submitLabel = hasSubmitted ? (hasChanges ? "Save Application" : "Saved") : "Submit Application";

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="glass border border-white/10 rounded-3xl p-8 md:p-12 space-y-6">
        <header className="space-y-3 text-center md:text-left">
          <h1 className="text-4xl font-adventure text-amber-100">Apply to Play</h1>
          <p className="text-amber-200/80">
            We’re hand-picking high-energy strategists, storytellers, and schemers. Longer answers give us more to work with—single word responses are
            automatically marked as “not considered.”
          </p>
          {status && (
            <div
              className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-semibold ${
                status === "shortlist"
                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
                  : "bg-amber-500/10 text-amber-200 border border-amber-400/30"
              }`}
            >
              {status === "shortlist" ? "Shortlist Ready" : "Needs More Detail"}
              {typeof wordScore === "number" && <span className="text-xs opacity-70">({wordScore} total words)</span>}
            </div>
          )}
          {status && <p className="text-sm text-amber-300/80">{statusDescription}</p>}
          {lastSavedAt && (
            <p className="text-xs text-amber-300/60">Last saved {formatTimestamp(lastSavedAt)}.</p>
          )}
        </header>

        <div className="grid gap-8">
          {APPLICATION_QUESTIONS.map((question) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <label htmlFor={question.id} className="text-lg font-semibold text-amber-100">
                  {question.prompt}
                </label>
                <span
                  className={`text-sm font-medium ${
                    wordCounts[question.id] > 1 ? "text-emerald-300" : wordCounts[question.id] === 0 ? "text-amber-400/60" : "text-amber-500"
                  }`}
                >
                  {wordCounts[question.id] ?? 0} words
                </span>
              </div>
              {question.helper && <p className="text-sm text-amber-300/70">{question.helper}</p>}
              <textarea
                id={question.id}
                name={question.id}
                value={answers[question.id]}
                onChange={(event) => handleChange(question.id, event.target.value)}
                className="w-full min-h-[140px] rounded-2xl bg-black/40 border border-amber-900/40 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/40 transition-all px-4 py-3 text-amber-50 placeholder:text-amber-500/50"
                maxLength={1500}
                placeholder="Share your story..."
                required
              />
              <p className="text-xs text-amber-300/60">Longer answers stand out. Aim for at least two sentences.</p>
            </div>
          ))}
        </div>

        {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200 text-sm">{error}</div>}
        {message && !error && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100 text-sm">{message}</div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 text-sm text-amber-300/60">
            <div>
              {shortlistEligible ? "Looking strong! Every answer has depth." : "Add more than one word to each answer to reach the shortlist."}
            </div>
            <div>
              {hasChanges
                ? "You have unsaved changes."
                : lastSavedAt
                  ? `All caught up as of ${formatTimestamp(lastSavedAt)}.`
                  : "Complete the prompts and submit to join the shortlist."}
            </div>
          </div>
          <button
            type="submit"
            disabled={!isFormComplete || isSaving || !hasChanges}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-all shadow-lg shadow-orange-900/40 hover:shadow-orange-900/60"
          >
            {isSaving ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
