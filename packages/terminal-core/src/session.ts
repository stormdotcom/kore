import { spawn } from "node-pty";
import type { IPty } from "node-pty";
import { EventEmitter } from "node:events";
import type { TerminalConfig } from "./types.js";

const DEFAULT_SCROLLBACK = 10000;

export class TerminalSession extends EventEmitter {
  public readonly id: string;
  public title: string;
  private pty: IPty;
  private buffer: string[] = [];
  private scrollback: number;
  private _exitCode: number | null = null;
  private _cwd: string;

  constructor(id: string, config: TerminalConfig = {}) {
    super();
    this.id = id;
    this._cwd = config.cwd ?? process.cwd();
    this.scrollback = DEFAULT_SCROLLBACK;

    // Detect default shell based on platform
    const defaultShell = this.getDefaultShell();
    const shell = config.shell ?? defaultShell;

    this.title = shell;

    // Spawn PTY
    this.pty = spawn(shell, [], {
      name: "xterm-256color",
      cols: config.cols ?? 80,
      rows: config.rows ?? 24,
      cwd: this._cwd,
      env: { ...process.env, ...config.env } as Record<string, string>,
    });

    this.attachPtyListeners();
  }

  private getDefaultShell(): string {
    const platform = process.platform;

    if (platform === "win32") {
      // Prefer PowerShell 7, fallback to PowerShell 5.1, then cmd
      return process.env["PWSH_PATH"] ??
             process.env["POWERSHELL_PATH"] ??
             "powershell.exe";
    } else {
      // Unix-like systems
      return process.env["SHELL"] ?? "/bin/bash";
    }
  }

  private attachPtyListeners(): void {
    this.pty.onData((data: string) => {
      this.buffer.push(data);

      // Trim buffer to scrollback limit
      if (this.buffer.length > this.scrollback) {
        this.buffer = this.buffer.slice(-this.scrollback);
      }

      this.emit("data", data);
    });

    this.pty.onExit(({ exitCode }: { exitCode: number }) => {
      this._exitCode = exitCode;
      this.emit("exit", exitCode);
    });
  }

  public write(data: string): void {
    if (this._exitCode === null) {
      this.pty.write(data);
    }
  }

  public resize(cols: number, rows: number): void {
    try {
      this.pty.resize(cols, rows);
    } catch (error) {
      this.emit("error", error);
    }
  }

  public getBuffer(): string[] {
    return [...this.buffer];
  }

  public getFullBuffer(): string {
    return this.buffer.join("");
  }

  public clearBuffer(): void {
    this.buffer = [];
  }

  public get cwd(): string {
    return this._cwd;
  }

  public get exitCode(): number | null {
    return this._exitCode;
  }

  public get isAlive(): boolean {
    return this._exitCode === null;
  }

  public get pid(): number {
    return this.pty.pid;
  }

  public kill(signal?: string): void {
    try {
      this.pty.kill(signal);
    } catch (error) {
      this.emit("error", error);
    }
  }

  public destroy(): void {
    this.kill();
    this.removeAllListeners();
    this.buffer = [];
  }
}
