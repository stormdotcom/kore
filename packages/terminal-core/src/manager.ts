import { EventEmitter } from "node:events";
import { TerminalSession } from "./session.js";
import type { TerminalConfig, TerminalOptions } from "./types.js";

export class TerminalManager extends EventEmitter {
  private sessions: Map<string, TerminalSession> = new Map();
  private sessionCounter = 0;
  private options: Required<TerminalOptions>;

  constructor(options: TerminalOptions = {}) {
    super();
    this.options = {
      maxScrollback: options.maxScrollback ?? 10000,
      defaultShell: options.defaultShell ?? this.getDefaultShell(),
      defaultCwd: options.defaultCwd ?? process.cwd(),
    };
  }

  private getDefaultShell(): string {
    if (process.platform === "win32") {
      return process.env["PWSH_PATH"] ??
             process.env["POWERSHELL_PATH"] ??
             "powershell.exe";
    }
    return process.env["SHELL"] ?? "/bin/bash";
  }

  public createSession(config: TerminalConfig = {}): TerminalSession {
    const id = `term-${++this.sessionCounter}`;

    const sessionConfig: TerminalConfig = {
      shell: config.shell ?? this.options.defaultShell,
      cwd: config.cwd ?? this.options.defaultCwd,
      cols: config.cols ?? 80,
      rows: config.rows ?? 24,
      env: config.env,
    };

    const session = new TerminalSession(id, sessionConfig);

    // Forward session events
    session.on("data", (data: string) => {
      this.emit("data", { sessionId: id, data });
    });

    session.on("exit", (exitCode: number) => {
      this.emit("exit", { sessionId: id, exitCode });
    });

    session.on("error", (error: Error) => {
      this.emit("error", { sessionId: id, error });
    });

    this.sessions.set(id, session);
    this.emit("session-created", { sessionId: id });

    return session;
  }

  public getSession(id: string): TerminalSession | undefined {
    return this.sessions.get(id);
  }

  public getAllSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  public destroySession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) {
      return false;
    }

    session.destroy();
    this.sessions.delete(id);
    this.emit("session-destroyed", { sessionId: id });
    return true;
  }

  public destroyAllSessions(): void {
    for (const [id, session] of this.sessions) {
      session.destroy();
      this.sessions.delete(id);
    }
  }

  public getSessionCount(): number {
    return this.sessions.size;
  }

  public hasSession(id: string): boolean {
    return this.sessions.has(id);
  }
}
