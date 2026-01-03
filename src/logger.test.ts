/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, setLogLevel } from './logger';

describe('Logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('success()', () => {
    it('should log success message with checkmark', () => {
      logger.success('Operation completed');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('✓');
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('Operation completed');
    });
  });

  describe('error()', () => {
    it('should log error message with cross', () => {
      logger.error('Something went wrong');

      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      expect(consoleErrorSpy.mock.calls[0]?.[0]).toContain('✗');
      expect(consoleErrorSpy.mock.calls[0]?.[0]).toContain('Something went wrong');
    });
  });

  describe('warn()', () => {
    it('should log warning message with warning symbol', () => {
      logger.warn('This is a warning');

      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      expect(consoleWarnSpy.mock.calls[0]?.[0]).toContain('⚠');
      expect(consoleWarnSpy.mock.calls[0]?.[0]).toContain('This is a warning');
    });
  });

  describe('info()', () => {
    it('should log info message with info symbol', () => {
      logger.info('Just FYI');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('ℹ');
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('Just FYI');
    });
  });

  describe('log()', () => {
    it('should log plain message without any symbols', () => {
      logger.log('Plain message');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toBe('Plain message');
    });
  });

  describe('request()', () => {
    it('should log HTTP request with timestamp', () => {
      logger.request('GET', '/api/users');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      const message = consoleLogSpy.mock.calls[0]?.[0] as string;
      expect(message).toContain('GET');
      expect(message).toContain('/api/users');
      expect(message).toMatch(/\[\d{1,2}:\d{2}:\d{2}.*\]/); // Timestamp pattern
    });
  });

  describe('banner()', () => {
    it('should log multiple lines with empty lines before and after', () => {
      logger.banner(['Line 1', 'Line 2', 'Line 3']);

      expect(consoleLogSpy).toHaveBeenCalledTimes(5); // Empty line + 3 lines + empty line
      expect(consoleLogSpy.mock.calls[0]?.[0]).toBeUndefined(); // First call is empty line (no args)
      expect(consoleLogSpy.mock.calls[1]?.[0]).toContain('Line 1');
      expect(consoleLogSpy.mock.calls[2]?.[0]).toContain('Line 2');
      expect(consoleLogSpy.mock.calls[3]?.[0]).toContain('Line 3');
      expect(consoleLogSpy.mock.calls[4]?.[0]).toBeUndefined(); // Last call is empty line (no args)
    });

    it('should color URLs in banner', () => {
      logger.banner(['Server running at', 'http://localhost:3000/']);

      expect(consoleLogSpy).toHaveBeenCalledTimes(4); // Empty + 2 lines + empty
      // URLs should be colored (they will have ANSI escape codes)
      const urlLine = consoleLogSpy.mock.calls[2]?.[0] as string;
      expect(urlLine).toContain('http://localhost:3000/');
    });

    it('should bold lines starting with rocket emoji', () => {
      logger.banner(['🚀 API Faker is running!']);

      expect(consoleLogSpy).toHaveBeenCalledTimes(3); // Empty + 1 line + empty
      const rocketLine = consoleLogSpy.mock.calls[1]?.[0] as string;
      expect(rocketLine).toContain('🚀');
      expect(rocketLine).toContain('API Faker is running!');
    });
  });

  describe('debug()', () => {
    it('should log debug message with bug emoji', () => {
      setLogLevel('debug');
      logger.debug('Debugging information');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('🐛');
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('Debugging information');
    });

    it('should not log debug message when level is info', () => {
      setLogLevel('info');
      logger.debug('This should not appear');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log debug message when level is trace', () => {
      setLogLevel('trace');
      logger.debug('This should appear');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('🐛');
    });
  });

  describe('trace()', () => {
    it('should log trace message with magnifying glass emoji', () => {
      setLogLevel('trace');
      logger.trace('Trace information');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('🔍');
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('Trace information');
    });

    it('should not log trace message when level is debug', () => {
      setLogLevel('debug');
      logger.trace('This should not appear');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not log trace message when level is info', () => {
      setLogLevel('info');
      logger.trace('This should not appear');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('setLogLevel()', () => {
    it('should filter logs based on trace level (show all)', () => {
      setLogLevel('trace');
      
      logger.trace('Trace message');
      logger.debug('Debug message');
      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('should filter logs based on debug level (hide trace)', () => {
      setLogLevel('debug');
      
      logger.trace('Trace message');
      logger.debug('Debug message');
      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    it('should filter logs based on info level (hide trace and debug)', () => {
      setLogLevel('info');
      
      logger.trace('Trace message');
      logger.debug('Debug message');
      logger.info('Info message');

      expect(consoleLogSpy).toHaveBeenCalledOnce();
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('ℹ');
    });

    it('should not affect other log methods', () => {
      setLogLevel('info');
      
      logger.success('Success');
      logger.error('Error');
      logger.warn('Warning');
      logger.log('Plain');

      // All of these should still work regardless of log level
      expect(consoleLogSpy).toHaveBeenCalledTimes(2); // success, log
      expect(consoleErrorSpy).toHaveBeenCalledOnce(); // error
      expect(consoleWarnSpy).toHaveBeenCalledOnce(); // warn
    });
  });
});
