"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const JOIN_URL = "https://clubs.hackclub.com/auth/member?join=MQREY5";


/** Public landing page for the Mesivta Hack Club: one screen, sign up / log in via Hack Club. */
export function ClubSite() {
  const { mode, toggle } = useTheme();
  const [joinOpen, setJoinOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const frameLoads = useRef(0);

  function openJoin() {
    frameLoads.current = 0;
    setJoined(false);
    setJoinOpen(true);
  }

  const card = "rounded-3xl border border-[var(--c-border)] bg-[var(--c-surface)]";

  return (
    <div
      className="club relative flex h-screen flex-col overflow-y-auto overflow-x-hidden bg-[var(--c-bg)] text-[var(--c-text)]"
      style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
    >
      {/* Atmosphere: brand-colour glows, fading dot grid, oversized ghost braces */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-48 -top-48 h-[680px] w-[680px] rounded-full bg-[radial-gradient(closest-side,rgba(236,55,80,0.25),transparent)]" />
        <div className="absolute -bottom-56 -left-48 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(51,142,218,0.16),transparent)]" />
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
          style={{ backgroundImage: "radial-gradient(var(--c-dot) 1.2px, transparent 1.2px)", backgroundSize: "26px 26px" }}
        />
        <span
          className="absolute right-[4vw] top-1/2 hidden -translate-y-1/2 select-none text-[22rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:2px_var(--c-border)] lg:block"
          style={{ fontFamily: '"JetBrains Mono", monospace' }}
        >
          {"{}"}
        </span>
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-start justify-between px-6">
        <a href="https://hackclub.com/" className="-ml-1">
          <img src="https://assets.hackclub.com/flag-orpheus-top.svg" alt="Hack Club" className="w-[110px] sm:w-[150px]" />
        </a>
        <button
          type="button"
          onClick={toggle}
          aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="mt-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--c-muted)] transition hover:bg-[var(--c-surface)] hover:text-[var(--c-text)]"
        >
          {mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-10">
        <h1
          className="animate-[rise_0.7s_ease-out_both] text-[clamp(3.2rem,10vw,7.5rem)] font-extrabold leading-[0.9] tracking-tight"
        >
          Mesivta
          <br />
          <span className="text-[var(--c-red)]">Hack Club</span>
        </h1>
        <p
          className="mt-6 max-w-xl animate-[rise_0.7s_ease-out_both] text-xl text-[var(--c-muted)]"
          style={{ animationDelay: "120ms" }}
        >
          Mesivta&apos;s club for making websites, apps, bots, games, and hardware...
        </p>
        <div
          className="mt-9 flex animate-[rise_0.7s_ease-out_both] flex-wrap gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <button
            type="button"
            onClick={openJoin}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--c-red)] px-7 py-3.5 text-base font-bold text-white transition hover:brightness-110"
          >
            Sign up
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-5xl px-6 py-6 text-sm text-[var(--c-muted)]">
        Part of{" "}
        <a href="https://hackclub.com/" className="font-semibold text-[var(--c-red)] hover:underline">
          Hack Club
        </a>
        , for teens, by teens.
      </footer>

      {/* Sign up: Hack Club's own member page, embedded */}
      {joinOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Join Mesivta Hack Club"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setJoinOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setJoinOpen(false)}
        >
          <div
            className={`${card} flex h-[min(720px,90vh)] w-full max-w-lg flex-col overflow-hidden shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--c-border)] px-5 py-3">
              <span className="font-bold">Join the club</span>
              <button
                type="button"
                autoFocus
                onClick={() => setJoinOpen(false)}
                aria-label="Close"
                className="rounded-full px-2 text-xl leading-none text-[var(--c-muted)] hover:text-[var(--c-text)]"
              >
                ×
              </button>
            </div>
            {joined ? (
              <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center">
                {/* Atmosphere: green glow + fading dot grid */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(51,214,166,0.28),transparent)]" />
                  <div
                    className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
                    style={{ backgroundImage: "radial-gradient(var(--c-dot) 1.2px, transparent 1.2px)", backgroundSize: "22px 22px" }}
                  />
                </div>

                <span className="relative flex h-20 w-20 animate-[rise_0.5s_ease-out_both] items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[#33d6a6]/40 [animation-iteration-count:2]" />
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#33d6a6] text-white shadow-[0_10px_30px_-8px_rgba(51,214,166,0.8)]">
                    <Check size={40} strokeWidth={3} />
                  </span>
                </span>

                <h3
                  className="relative mt-6 animate-[rise_0.5s_ease-out_both] text-4xl font-extrabold tracking-tight"
                  style={{ animationDelay: "100ms" }}
                >
                  Request sent!
                </h3>
                <p
                  className="relative mt-3 max-w-xs animate-[rise_0.5s_ease-out_both] text-[15px] leading-relaxed text-[var(--c-muted)]"
                  style={{ animationDelay: "200ms" }}
                >
                  You&apos;ll get an email when a club leader approves you.
                </p>

                <div
                  className="relative mt-6 w-full max-w-xs animate-[rise_0.5s_ease-out_both] rounded-2xl border border-[var(--c-border)] bg-[var(--c-bg)]/60 p-4"
                  style={{ animationDelay: "300ms" }}
                >
                  <p className="text-sm text-[var(--c-muted)]">No email? Speak to</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {["Aaron Janit", "Shimon Kornbluth", "Dovi Douek"].map((name, i) => (
                      <span
                        key={name}
                        className="rounded-full px-3 py-1 text-sm font-semibold text-white"
                        style={{ background: ["#ec3750", "#338eda", "#a633d6"][i] }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setJoinOpen(false)}
                  className="relative mt-7 animate-[rise_0.5s_ease-out_both] rounded-full bg-[var(--c-red)] px-8 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                  style={{ animationDelay: "400ms" }}
                >
                  Done
                </button>

                {/* Hack Club brand palette */}
                <div aria-hidden className="absolute inset-x-0 bottom-0 flex h-1.5">
                  {["#ec3750", "#ff8c37", "#f1c40f", "#33d6a6", "#5bc0de", "#338eda", "#a633d6"].map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
              </div>
            ) : (
              // Hack Club's page is cross-origin, so its top bar ("← Home") is hidden by shifting the frame up.
              // shortcut: 72px matches their current nav height; adjust if their layout changes.
              <div className="relative flex-1 overflow-hidden bg-[#17171d]">
                <iframe
                  src={JOIN_URL}
                  title="Hack Club club join"
                  className="absolute inset-x-0 -top-[72px] h-[calc(100%+72px)] w-full border-0"
                  // Join steps run inside Hack Club's page without reloading the frame; the next load is the
                  // post-submit redirect to auth.hackclub.com (which refuses framing).
                  // shortcut: if Hack Club ever reloads the frame on a validation error, this shows a false success; then detect differently.
                  onLoad={() => {
                    frameLoads.current += 1;
                    if (frameLoads.current > 1) setJoined(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
