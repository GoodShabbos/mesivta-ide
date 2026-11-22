"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { X, File, FileCode, FileJson, FileText, Image as ImageIcon, FileCog, Braces, Sparkles, Globe } from "lucide-react";
import { useEditorStore, type EditorTab, WELCOME_TAB_ID, PREVIEW_TAB_ID } from "@/stores/useEditorStore";
import { useFileStore } from "@/stores/useFileStore";
import { iconForFile } from "@/lib/fileIcons";
import { WelcomePanel } from "./WelcomePanel";
import { LivePreview } from "@/components/preview/LivePreview";
import { MarkdownPreview } from "./MarkdownPreview";
import { cn } from "@/lib/cn";

// Monaco is browser-only. SSR must be disabled.
const MonacoInner = dynamic(() => import("./MonacoInner").then((m) => m.MonacoInner), {
  ssr: false,
  loading: () => <div className="p-3 text-xs text-muted-2">Loading editor…</div>,
});

const ICONS = {
  file: File,
  "file-code": FileCode,
  "file-json": FileJson,
  "file-text": FileText,
  image: ImageIcon,
  "file-cog": FileCog,
  braces: Braces,
} as const;

function FileTypeIcon({ name: _name }: { name: string }) {
  const spec = iconForFile(_name);
  const Cmp = ICONS[spec.icon];
  return <Cmp className="size-3.5" />;
}

function isMarkdownFile(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ext === "md" || ext === "mdx";
}

export function EditorArea() {
  const { tabs, activeFileId, setActive, close, setContent, markClean } = useEditorStore();
  const { updateFile } = useFileStore();
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Debounced auto-save
  const scheduleSave = useCallback(
    (fileId: string, content: string) => {
      if (saveTimers.current[fileId]) clearTimeout(saveTimers.current[fileId]);
      saveTimers.current[fileId] = setTimeout(async () => {
        await updateFile(fileId, { content });
        markClean(fileId);
        delete saveTimers.current[fileId];
      }, 800);
    },
    [updateFile, markClean],
  );

  const activeTab = tabs.find((t) => t.fileId === activeFileId) ?? null;

  return (
    <div data-tour="ide-editor" className="flex h-full flex-col bg-editor">
      {/* Tab strip — browser-style rounded tabs; active tab merges into the editor */}
      <div className="flex h-10 shrink-0 items-end border-b border-border bg-panel px-1.5">
        <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <Tab
              key={t.fileId}
              tab={t}
              active={t.fileId === activeFileId}
              onClick={() => setActive(t.fileId)}
              onClose={() => close(t.fileId)}
            />
          ))}
        </div>
      </div>

      {/* Editor OR welcome OR preview — full height, swapped by active tab */}
      <div className="flex-1 overflow-hidden">
        {activeTab?.isWelcome ? (
          <WelcomePanel />
        ) : activeTab?.isPreview ? (
          <LivePreview />
        ) : activeTab ? (
          isMarkdownFile(activeTab.name) ? (
            // Markdown files get a live rendered preview beside the editor.
            <div className="flex h-full">
              <div className="h-full min-w-0 flex-1">
                <MonacoInner
                  key={activeTab.fileId}
                  fileId={activeTab.fileId}
                  value={activeTab.content}
                  language={activeTab.language}
                  onChange={(val) => {
                    setContent(activeTab.fileId, val);
                    scheduleSave(activeTab.fileId, val);
                  }}
                />
              </div>
              <div className="h-full w-[45%] min-w-56 max-w-[55%] shrink-0">
                <MarkdownPreview content={activeTab.content} fileName={activeTab.name} />
              </div>
            </div>
          ) : (
            <MonacoInner
              key={activeTab.fileId}
              fileId={activeTab.fileId}
              value={activeTab.content}
              language={activeTab.language}
              onChange={(val) => {
                setContent(activeTab.fileId, val);
                scheduleSave(activeTab.fileId, val);
              }}
            />
          )
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function Tab({ tab, active, onClick, onClose }: { tab: EditorTab; active: boolean; onClick: () => void; onClose: () => void }) {
  const Icon = iconForFile(tab.name);
  return (
    <div
      onClick={onClick}
      title={tab.name}
      className={cn(
        "group relative flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-t-lg border-x border-t px-3 text-xs transition-colors",
        active
          ? "z-10 translate-y-px border-border bg-editor text-foreground"
          : "border-transparent text-muted hover:bg-panel-2/70 hover:text-foreground/90",
      )}
    >
      <span className={tab.isWelcome ? "text-accent" : tab.isPreview ? "text-accent" : (Icon.color ?? "text-muted")}>
        {tab.isWelcome ? (
          <Sparkles className="size-3.5" />
        ) : tab.isPreview ? (
          <Globe className="size-3.5" />
        ) : (
          <FileTypeIcon name={tab.name} />
        )}
      </span>
      <span className="max-w-[140px] truncate">{tab.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="ml-0.5 rounded p-0.5 opacity-0 transition group-hover:opacity-100 hover:bg-foreground/10"
        title="Close"
      >
        {tab.dirty ? (
          <span className="block size-2 rounded-full bg-accent" title="Unsaved changes" />
        ) : (
          <X className="size-3 text-muted hover:text-foreground" />
        )}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted-2">
      No file open
    </div>
  );
}