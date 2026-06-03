type LogLevel = "debug" | "info" | "warn" | "error";

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (data !== undefined) {
    return `${base} ${JSON.stringify(data)}`;
  }
  return base;
}

const isProduction = process.env.NODE_ENV === "production";

export const logger = {
  debug(message: string, data?: unknown): void {
    if (!isProduction) {
      process.stdout.write(formatMessage("debug", message, data) + "\n");
    }
  },

  info(message: string, data?: unknown): void {
    process.stdout.write(formatMessage("info", message, data) + "\n");
  },

  warn(message: string, data?: unknown): void {
    process.stderr.write(formatMessage("warn", message, data) + "\n");
  },

  error(message: string, data?: unknown): void {
    process.stderr.write(formatMessage("error", message, data) + "\n");
  },
};
