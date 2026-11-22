"use client";

import { create } from "zustand";
import { useEditorStore, PREVIEW_TAB_ID } from "./useEditorStore";

interface RunState {
  /** Whether the simulated site server is running (drives the live preview). */
  running: boolean;
  /** Start the site — opens (or refocuses) the Preview tab in the editor area. */
  start: () => void;
  /** Stop the site — closes the Preview tab. */
  stop: () => void;
}

export const useRunStore = create<RunState>((set, get) => ({
  running: false,
  start: () => {
    useEditorStore.getState().openPreview();
    set({ running: true });
  },
  stop: () => {
    if (!get().running) return;
    useEditorStore.getState().close(PREVIEW_TAB_ID);
    set({ running: false });
  },
}));