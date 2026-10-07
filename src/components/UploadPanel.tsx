"use client";

import { useCallback, useRef, useState } from "react";
import { cn, parseDeadline } from "@/lib/utils";
import type { Commitment, CommitmentStatus } from "@/lib/types";

interface Props {
  onProcessed: (commitments: Commitment[]) => void;
  disabled?: boolean;
}

function IconMic({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}
function IconUpload({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
function IconLoader({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
function IconWave({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );
}
function IconSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}

export function UploadPanel({ onProcessed, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAudio = useCallback(
    async (file: File | Blob, sourceName: string) => {
      setIsProcessing(true);
      setStatus("Transcribing audio…");

      try {
        const form = new FormData();
        form.append("file", file, sourceName);

        const transcribeRes = await fetch("/api/transcribe", {
          method: "POST",
          body: form,
        });

        if (!transcribeRes.ok) {
          const err = await transcribeRes.json();
          throw new Error(err.error || "Transcription failed");
        }

        const { text, demo } = await transcribeRes.json();
        setStatus(demo ? "Demo mode — extracting commitments…" : "Extracting commitments…");

        const extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: text }),
        });

        if (!extractRes.ok) {
          const err = await extractRes.json();
          throw new Error(err.error || "Extraction failed");
        }

        const { result } = await extractRes.json();
        const now = new Date().toISOString();

        const commitments: Commitment[] = (result.commitments || []).map(
          (c: {
            person: string;
            commitment: string;
            deadline: string | null;
            context: string;
          }) => {
            const deadlineDate = parseDeadline(c.deadline);
            let status: CommitmentStatus = "waiting";
            if (deadlineDate) {
              const days = Math.round(
                (new Date(deadlineDate).getTime() - Date.now()) / 86400000
              );
              if (days < 0) status = "overdue";
            }
            return {
              id: crypto.randomUUID(),
              person: c.person,
              commitment: c.commitment,
              deadline: c.deadline,
              deadlineDate,
              context: c.context,
              source: sourceName,
              status,
              createdAt: now,
              updatedAt: now,
            };
          }
        );

        onProcessed(commitments);
        setStatus(
          commitments.length
            ? `Extracted ${commitments.length} commitment${commitments.length > 1 ? "s" : ""}`
            : "No clear commitments found"
        );
      } catch (err) {
        console.error(err);
        setStatus(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsProcessing(false);
        setTimeout(() => setStatus(null), 4000);
      }
    },
    [onProcessed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isProcessing) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("audio/")) {
        processAudio(file, file.name);
      } else {
        setStatus("Please drop an audio file");
      }
    },
    [disabled, isProcessing, processAudio]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudio(file, file.name);
    e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        processAudio(blob, `recording-${new Date().toISOString().slice(0, 19)}.webm`);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setStatus("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed p-8 transition-all duration-300 sm:p-10",
          isDragging
            ? "scale-[1.02] border-indigo-400 bg-gradient-to-br from-indigo-100 via-violet-50 to-fuchsia-100 shadow-lg shadow-indigo-200/40 dark:from-indigo-950/50 dark:via-violet-950/30 dark:to-fuchsia-950/30"
            : isRecording
            ? "border-red-300 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-800 dark:from-red-950/30 dark:to-rose-950/20"
            : "border-indigo-200/70 bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/40 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50 dark:border-indigo-800/50 dark:from-zinc-900/80 dark:via-indigo-950/20 dark:to-violet-950/20 dark:hover:border-indigo-700",
          (disabled || isProcessing) && "pointer-events-none opacity-60"
        )}
      >
        {/* subtle inner glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/40 dark:to-transparent" />

        {isProcessing ? (
          <div className="relative flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
              <IconLoader className="relative h-11 w-11 animate-spin text-indigo-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              {status || "Processing…"}
            </p>
            <p className="text-xs text-zinc-400">This usually takes a few seconds</p>
          </div>
        ) : (
          <div className="relative">
            <div
              className={cn(
                "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-md transition-transform",
                isRecording
                  ? "bg-gradient-to-br from-red-400 to-rose-500 text-white animate-pulse-ring shadow-red-200"
                  : "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-indigo-200/50 animate-float dark:shadow-none"
              )}
            >
              {isRecording ? <IconMic className="h-8 w-8" /> : <IconWave className="h-8 w-8" />}
            </div>

            <p className="text-center text-base font-bold text-zinc-800 dark:text-zinc-100">
              {isRecording ? "Recording in progress…" : "Drop a voice memo or call"}
            </p>
            <p className="mt-1 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {isRecording
                ? "Tap stop when you're done"
                : "MP3, WAV, WEBM, M4A — or record live"}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {!isRecording && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200/50 transition hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] dark:shadow-indigo-900/30"
                >
                  <IconUpload className="h-4 w-4" />
                  Upload file
                </button>
              )}

              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-white/90 px-5 py-2.5 text-sm font-bold text-indigo-700 shadow-sm backdrop-blur transition hover:scale-[1.03] hover:bg-white active:scale-[0.98] dark:border-indigo-700 dark:bg-zinc-800/90 dark:text-indigo-300 dark:hover:bg-zinc-800"
                >
                  <IconMic className="h-4 w-4" />
                  Record
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200/40 transition hover:scale-[1.03] active:scale-[0.98]"
                >
                  <IconSquare className="h-4 w-4" />
                  Stop recording
                </button>
              )}
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {status && !isProcessing && (
        <p
          className={cn(
            "text-center text-sm font-semibold animate-scale-in",
            status.includes("Extracted")
              ? "text-emerald-600 dark:text-emerald-400"
              : status.includes("failed") || status.includes("denied") || status.includes("wrong")
              ? "text-red-600 dark:text-red-400"
              : "text-zinc-500"
          )}
        >
          {status}
        </p>
      )}
    </div>
  );
}
