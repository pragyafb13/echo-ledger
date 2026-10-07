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
function IconFile({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );
}
function IconSquare({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="1" />
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
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all",
          isDragging
            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30"
            : "border-zinc-200 bg-zinc-50 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/50",
          (disabled || isProcessing) && "pointer-events-none opacity-60"
        )}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <IconLoader className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {status || "Processing…"}
            </p>
          </div>
        ) : (
          <>
            <IconFile className="mb-3 h-10 w-10 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Drop a voice memo or call recording
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              MP3, WAV, WEBM, M4A — or record live
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                <IconUpload className="h-4 w-4" />
                Upload file
              </button>

              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <IconMic className="h-4 w-4" />
                  Record
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-500 animate-pulse"
                >
                  <IconSquare className="h-4 w-4" />
                  Stop recording
                </button>
              )}
            </div>
          </>
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
        <p className="text-center text-sm text-zinc-500">{status}</p>
      )}
    </div>
  );
}
