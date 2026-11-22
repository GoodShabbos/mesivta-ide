"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, KeyRound, Loader2, Rocket, Terminal, Users } from "lucide-react";
import { api } from "@/lib/api/client";

const CODE_LENGTH = 4;

/**
 * The sign-in form: a single 4-digit code, handed to the student in person
 * by the admin. Shown on /login.
 */
export function SignInForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(() => Array<string>(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const complete = code.length === CODE_LENGTH;

  async function doLogin(codeValue: string) {
    if (busy || codeValue.length !== CODE_LENGTH) return;
    setError(null);
    setBusy(true);
    try {
      await api.auth.login(codeValue);
      const safe =
        redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
      router.replace(safe);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
      setShakeKey((k) => k + 1);
    }
  }

  function setDigit(i: number, raw: string) {
    const d = raw.replace(/\D/g, "").slice(-1);
    if (!d) {
      setDigits((prev) => prev.map((c, idx) => (idx === i ? "" : c)));
      return;
    }
    const wasComplete = digits.every(Boolean);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
    // Auto-submit only when typing the final digit of an incomplete code —
    // editing an already-complete code requires an explicit Enter/click.
    if (!wasComplete && next.every(Boolean)) void doLogin(next.join(""));
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digits[i] && i > 0) {
        e.preventDefault();
        inputsRef.current[i - 1]?.focus();
        setDigits((prev) => prev.map((c, idx) => (idx === i - 1 ? "" : c)));
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
      e.preventDefault();
      inputsRef.current[i + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    setDigits(Array.from({ length: CODE_LENGTH }, (_, idx) => pasted[idx] ?? ""));
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
    if (pasted.length === CODE_LENGTH) void doLogin(pasted);
  }

  const rise = (ms: number) => ({ animationDelay: `${ms}ms` });
  const mono = { fontFamily: '"JetBrains Mono", monospace' };
  const features = [
    { icon: Terminal, color: "#ec3750", title: "Write real code", body: "A full editor in your browser — HTML, CSS, JS and more." },
    { icon: Rocket, color: "#338eda", title: "Ship projects", body: "Build things you can actually show people, every week." },
    { icon: Users, color: "#33d6a6", title: "Hack together", body: "Learn with friends. Part of the global Hack Club network." },
  ];

  return (
    <div
      className="relative min-h-screen overflow-auto bg-[#f9fafc] text-[#1f2d3d]"
      style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}
    >
      {/* Background: soft brand glows + fading dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-56 h-[640px] w-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(236,55,80,0.18),transparent)]" />
        <div className="absolute -bottom-64 -left-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(51,142,218,0.12),transparent)]" />
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          style={{
            backgroundImage: "radial-gradient(rgba(31,45,61,0.14) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-start justify-between px-6">
        <a href="https://hackclub.com/" className="-ml-1">
          <img
            src="https://assets.hackclub.com/flag-orpheus-top.svg"
            alt="Hack Club"
            className="w-[120px] sm:w-[170px]"
          />
        </a>
        <a
          href="https://hackclub.com/"
          className="mt-5 rounded-full border border-[#e0e6ed] bg-white px-4 py-1.5 text-sm font-semibold text-[#1f2d3d] shadow-sm transition hover:border-[#ec3750] hover:text-[#ec3750]"
        >
          hackclub.com ↗
        </a>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-10 lg:grid-cols-[1.2fr_1fr] lg:pt-16">
        {/* Hero */}
        <section>
          <span
            className="inline-flex animate-[rise_0.6s_ease-out_both] items-center gap-2 rounded-full bg-[#ec3750]/10 px-3 py-1 text-xs font-semibold text-[#ec3750]"
            style={{ ...rise(0), ...mono }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ec3750]" />
            2026–27 season · a Hack Club
          </span>

          <h1
            className="mt-6 animate-[rise_0.7s_ease-out_both] text-[clamp(3.5rem,9vw,7.5rem)] font-extrabold leading-[0.9] tracking-tight"
            style={rise(100)}
          >
            Mesivta
            <br />
            <span className="text-[#ec3750]">Code.</span>
          </h1>

          <p
            className="mt-6 max-w-lg animate-[rise_0.7s_ease-out_both] text-xl font-light leading-relaxed text-[#3c4858]"
            style={rise(200)}
          >
            The coding club where you learn by building. Write code, ship projects, and make
            things that are actually yours.
          </p>

          <ul className="mt-10 hidden gap-3 sm:grid sm:grid-cols-3">
            {features.map(({ icon: Icon, color, title, body }, i) => (
              <li
                key={title}
                className="animate-[rise_0.7s_ease-out_both] rounded-2xl border border-[#e0e6ed] bg-white/80 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                style={rise(300 + i * 90)}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                  style={{ background: color }}
                >
                  <Icon size={17} strokeWidth={2.4} />
                </span>
                <h3 className="mt-3 text-[15px] font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-snug text-[#8492a6]">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Sign-in card */}
        <section
          className="w-full max-w-[400px] animate-[rise_0.8s_ease-out_both] justify-self-center lg:justify-self-end"
          style={rise(250)}
        >
          <div className="rounded-3xl border border-[#e0e6ed] bg-white p-8 shadow-[0_4px_8px_rgba(0,0,0,0.04),0_24px_48px_-12px_rgba(31,45,61,0.14)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ec3750] text-white">
              <KeyRound size={19} strokeWidth={2.3} />
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="mt-1.5 text-[15px] text-[#8492a6]">
              Enter your 4-digit code to open your workspace.
            </p>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                void doLogin(code);
              }}
              className="mt-7"
            >
              <label htmlFor="signin-code-0" className="mb-2 block text-sm font-semibold">
                Your code
              </label>

              <div className="flex gap-2.5" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    id={i === 0 ? "signin-code-0" : undefined}
                    value={digit}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.currentTarget.select()}
                    aria-label={`Digit ${i + 1}`}
                    autoFocus={i === 0}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    placeholder="·"
                    disabled={busy}
                    maxLength={1}
                    style={mono}
                    className={`h-16 w-full min-w-0 rounded-xl border-2 bg-[#f9fafc] text-center text-2xl font-bold leading-none text-[#1f2d3d] caret-[#ec3750] outline-none transition placeholder:text-[#c0ccda] focus:border-[#ec3750] focus:bg-white focus:shadow-[0_0_0_4px_rgba(236,55,80,0.15)] disabled:opacity-50 ${
                      digit ? "border-[#ec3750]/50 bg-white" : "border-[#e0e6ed]"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div
                  key={shakeKey}
                  role="alert"
                  className="mt-4 flex animate-[signInShake_0.4s_ease-in-out] items-start gap-2 rounded-xl bg-[#ec3750]/10 px-3 py-2.5 text-sm text-[#c0213a]"
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !complete}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ec3750] px-5 py-3.5 text-base font-bold text-white shadow-[0_6px_16px_-4px_rgba(236,55,80,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-6px_rgba(236,55,80,0.7)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {busy ? <Loader2 size={17} className="animate-spin" /> : null}
                {busy ? "Signing in…" : "Sign in"}
                {busy ? null : (
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>

            <p className="mt-7 border-t border-[#e0e6ed] pt-5 text-center text-sm text-[#8492a6]">
              No code, or lost it? Speak to Mr Mainzer.
            </p>
          </div>
        </section>
      </main>

      <footer
        className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t border-[#e0e6ed] px-6 py-6 text-sm text-[#8492a6]"
      >
        <span>
          Mesivta Code is a{" "}
          <a href="https://hackclub.com/" className="font-semibold text-[#ec3750] hover:underline">
            Hack Club
          </a>
          .
        </span>
        <span style={mono} className="text-xs">for teens, by teens</span>
      </footer>

    </div>
  );
}
