export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  FATAL: 'fatal';
}

export interface LogPackage {
  // Backend packages
  CACHE: 'cache';
  CONTROLLER: 'controller';
  CRON_JOB: 'cron_job';
  DB: 'db';
  DOMAIN: 'domain';
  HANDLER: 'handler';
  REPOSITORY: 'repository';
  ROUTE: 'route';
  SERVICE: 'service';
  
  // Frontend packages
  API: 'api';
  COMPONENT: 'component';
  HOOK: 'hook';
  PAGE: 'page';
  STATE: 'state';
  STYLE: 'style';
  
  // Shared packages
  AUTH: 'auth';
  CONFIG: 'config';
  MIDDLEWARE: 'middleware';
  UTILS: 'utils';
}

export interface LogRequest {
  stack: 'backend' | 'frontend';
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  package: string;
  message: string;
}

export interface LogResponse {
  logID: string;
  message: string;
}

class Logger {
  private static instance: Logger;
  private readonly LOG_API_URL = 'http://20.244.56.144/evaluation-service/logs';
  private accessToken: string | null = null;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
  }

  private async sendLog(logData: LogRequest): Promise<LogResponse | null> {
    try {
      const response = await fetch(this.LOG_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` })
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok) {
        console.error(`Failed to send log: ${response.status} ${response.statusText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending log:', error);
      return null;
    }
  }

  public async log(
    stack: 'backend' | 'frontend',
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    packageName: string,
    message: string
  ): Promise<void> {
    const logData: LogRequest = {
      stack,
      level,
      package: packageName,
      message
    };

    await this.sendLog(logData);
  }

  public async debug(stack: 'backend' | 'frontend', packageName: string, message: string): Promise<void> {
    await this.log(stack, 'debug', packageName, message);
  }

  public async info(stack: 'backend' | 'frontend', packageName: string, message: string): Promise<void> {
    await this.log(stack, 'info', packageName, message);
  }

  public async warn(stack: 'backend' | 'frontend', packageName: string, message: string): Promise<void> {
    await this.log(stack, 'warn', packageName, message);
  }

  public async error(stack: 'backend' | 'frontend', packageName: string, message: string): Promise<void> {
    await this.log(stack, 'error', packageName, message);
  }

  public async fatal(stack: 'backend' | 'frontend', packageName: string, message: string): Promise<void> {
    await this.log(stack, 'fatal', packageName, message);
  }
}

export default Logger;