import pc from 'picocolors';

/**
 * Log level enum
 */
export type LogLevel = 'trace' | 'debug' | 'info';

/**
 * Current log level setting
 */
let currentLogLevel: LogLevel = 'info';

/**
 * Log level priority map
 */
const LOG_LEVELS = {
  trace: 0,
  debug: 1,
  info: 2,
};

/**
 * Set the current log level
 *
 * @param level - Log level to set ('trace' | 'debug' | 'info')
 *
 * @example
 * ```typescript
 * setLogLevel('debug'); // Show debug and info logs, hide trace
 * setLogLevel('trace'); // Show all logs
 * setLogLevel('info');  // Show only info logs (default)
 * ```
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Check if a message should be logged based on current log level
 *
 * @param messageLevel - Level of the message to log
 * @returns True if message should be logged
 */
function shouldLog(messageLevel: LogLevel): boolean {
  return LOG_LEVELS[messageLevel] >= LOG_LEVELS[currentLogLevel];
}

/**
 * Logger utility for colored console output
 *
 * Provides consistent, color-coded logging throughout the application.
 * Follows a standard format: [LEVEL] Message
 */
export const logger = {
  /**
   * Log success message in green
   *
   * @param message - Success message
   *
   * @example
   * ```typescript
   * logger.success('Server started successfully');
   * // Output: ✓ Server started successfully (in green)
   * ```
   */
  success(message: string): void {
    console.log(pc.green(`✓ ${message}`));
  },

  /**
   * Log error message in red
   *
   * @param message - Error message
   *
   * @example
   * ```typescript
   * logger.error('Failed to load file');
   * // Output: ✗ Failed to load file (in red)
   * ```
   */
  error(message: string): void {
    console.error(pc.red(`✗ ${message}`));
  },

  /**
   * Log warning message in yellow
   *
   * @param message - Warning message
   *
   * @example
   * ```typescript
   * logger.warn('Using default port');
   * // Output: ⚠ Using default port (in yellow)
   * ```
   */
  warn(message: string): void {
    console.warn(pc.yellow(`⚠ ${message}`));
  },

  /**
   * Log info message in cyan
   *
   * @param message - Info message
   *
   * @example
   * ```typescript
   * logger.info('Watching for changes...');
   * // Output: ℹ Watching for changes... (in cyan)
   * ```
   */
  info(message: string): void {
    console.log(pc.cyan(`ℹ ${message}`));
  },
  
  /**
   * Log debug message in dim gray (for verbose/debug mode)
   *
   * @param message - Debug message
   *
   * @example
   * ```typescript
   * logger.debug('Loading configuration from file');
   * // Output: 🐛 Loading configuration from file (in dim gray)
   * ```
   */
  debug(message: string): void {
    if (shouldLog('debug')) {
      console.log(pc.dim(pc.gray(`🐛 ${message}`)));
    }
  },

  /**
   * Log trace message in magenta (for very detailed tracing)
   *
   * @param message - Trace message
   *
   * @example
   * ```typescript
   * logger.trace('Entering function xyz');
   * // Output: 🔍 Entering function xyz (in magenta)
   * ```
   */
  trace(message: string): void {
    if (shouldLog('trace')) {
      console.log(pc.magenta(`🔍 ${message}`));
    }
  },

  /**
   * Log plain message without color
   *
   * @param message - Message to log
   *
   * @example
   * ```typescript
   * logger.log('http://localhost:3000');
   * // Output: http://localhost:3000
   * ```
   */
  log(message: string): void {
    console.log(message);
  },

  /**
   * Log request in gray (for non-quiet mode)
   *
   * @param method - HTTP method
   * @param url - Request URL
   *
   * @example
   * ```typescript
   * logger.request('GET', '/api/users');
   * // Output: [timestamp] GET /api/users (in gray)
   * ```
   */
  request(method: string, url: string): void {
    const timestamp = new Date().toLocaleTimeString();
    console.log(pc.gray(`[${timestamp}] ${method} ${url}`));
  },

  /**
   * Log formatted banner
   *
   * @param lines - Array of lines to display
   *
   * @example
   * ```typescript
   * logger.banner([
   *   '🚀 API Faker is running!',
   *   '',
   *   '  Resources:',
   *   '  http://localhost:3000/'
   * ]);
   * ```
   */
  banner(lines: string[]): void {
    console.log();
    for (const line of lines) {
      // Color URLs in cyan
      if (line.includes('http://') || line.includes('https://')) {
        const colored = line.replace(/(https?:\/\/[^\s]+)/g, (url) => pc.cyan(url));
        console.log(colored);
      } else if (line.startsWith('🚀')) {
        // Color rocket emoji line in bold
        console.log(pc.bold(line));
      } else {
        console.log(line);
      }
    }
    console.log();
  },
};
