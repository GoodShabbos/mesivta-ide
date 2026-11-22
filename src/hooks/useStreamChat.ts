"use client";

import { useCallback, useRef, useState } from "react";

interface StreamOptions {
  onDelta: (partial: string) => void;
  onDone: (full: string) => void;
  onError?: (err: string) => void;
}

export interface ActiveFileContext {
  name: string;
  path: string;
  language: string;
  content: string;
}

interface SendArgs {
  chatId: string;
  projectId: string;
  content: string;
  history: { role: "user" | "assistant" | "system"; content: string }[];
  activeFile?: ActiveFileContext | null;
  openTabs?: ActiveFileContext[];
}

/** Reveal cadence (ms) — how often newly received text is flushed to the UI. */
const REVEAL_TICK_MS = 40;
/** Adaptive catch-up: a large burst finishes revealing in ~30 ticks (~1.2s). */
const REVEAL_CATCHUP_TICKS = 30;
/** Minimum characters revealed per tick so short replies still trickle. */
const REVEAL_MIN_STEP = 2;

/**
 * Streams an AI chat response from /api/chat (SSE) and reveals it to the UI
 * progressively. Upstream providers can deliver large bursts at once (Ollama
 * Cloud buffers whole responses), so received text is queued and released at
 * an adaptive typewriter pace — big bursts catch up in ~1s, small deltas
 * trickle — so the conversation feels streamed instead of arriving as one
 * wall of text. Aborting reveals everything received so far instantly.
 */
export function useStreamChat() {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  const send = useCallback(async (args: SendArgs, opts: StreamOptions) => {
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    let full = ""; // all text received from the server
    let revealed = 0; // how much of `full` the UI has seen
    let finished = false; // stream fully received (or failed)
    let stopped = false; // reveal loop should stop
    let errMsg: string | null = null;

    const clearReveal = () => {
      if (revealTimerRef.current !== null) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };

    const finish = () => {
      clearReveal();
      setStreaming(false);
      abortRef.current = null;
    };

    const revealTick = () => {
      if (stopped) return;
      const remaining = full.length - revealed;
      if (remaining > 0) {
        const step = Math.max(REVEAL_MIN_STEP, Math.ceil(remaining / REVEAL_CATCHUP_TICKS));
        revealed = Math.min(full.length, revealed + step);
        opts.onDelta(full.slice(0, revealed));
      }
      // Once caught up AND the stream is complete, hand over to onDone.
      if (finished && revealed >= full.length) {
        stopped = true;
        if (errMsg !== null) opts.onError?.(errMsg);
        opts.onDone(full || (errMsg ? `⚠️ ${errMsg}` : ""));
        finish();
      }
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      // Start the typewriter reveal as soon as the response begins.
      revealTimerRef.current = window.setInterval(revealTick, REVEAL_TICK_MS);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload) as { delta?: string; error?: string };
            if (json.error) throw new Error(json.error);
            if (json.delta) full += json.delta;
          } catch {
            // ignore parse hiccups mid-stream
          }
        }
      }
      finished = true;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // Network gone; reveal everything received so far instantly and end.
        stopped = true;
        revealed = full.length;
        opts.onDelta(full);
        opts.onDone(full);
        finish();
        return;
      }
      errMsg = (err as Error).message;
      finished = true;
      // Nothing received at all — surface the error immediately instead of
      // waiting for the reveal loop.
      if (full.length === 0) {
        stopped = true;
        opts.onError?.(errMsg);
        opts.onDone(`⚠️ ${errMsg}`);
        finish();
        return;
      }
    }

    // Wait (bounded by content size) for the reveal loop to catch up.
    await new Promise<void>((resolve) => {
      const check = () => {
        if (stopped || revealed >= full.length) resolve();
        else setTimeout(check, REVEAL_TICK_MS);
      };
      check();
    });
    if (!stopped) {
      stopped = true;
      if (errMsg !== null) opts.onError?.(errMsg);
      opts.onDone(full);
      finish();
    }
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { streaming, send, abort };
}