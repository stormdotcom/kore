import type { IPty } from "node-pty";

export interface TerminalConfig {
  shell?: string;
  cwd?: string;
  env?: Record<string, string>;
  cols?: number;
  rows?: number;
}

export interface TerminalSession {
  id: string;
  pty: IPty;
  buffer: string[];
  scrollback: number;
  title: string;
  cwd: string;
  exitCode: number | null;
}

export interface TerminalOptions {
  maxScrollback?: number;
  defaultShell?: string;
  defaultCwd?: string;
}

export type TerminalEventType = "data" | "exit" | "title" | "error";

export interface TerminalEventMap {
  data: { sessionId: string; data: string };
  exit: { sessionId: string; exitCode: number };
  title: { sessionId: string; title: string };
  error: { sessionId: string; error: Error };
}
