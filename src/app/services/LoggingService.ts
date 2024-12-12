import { type ILogObj, Logger } from 'tslog';
import { Service } from 'typedi';

const log: Logger<ILogObj> = new Logger();

@Service()
export class LoggingService {
  private client: Logger<ILogObj>;
  constructor() {
    this.client = log;
  }
  public debug(...params: unknown[]) {
    this.client.debug(params);
  }
  public error(...params: unknown[]) {
    this.client.error(params);
  }
  public warn(...params: unknown[]) {
    this.client.warn(params);
  }
}
