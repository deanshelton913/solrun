import Container, { Service } from 'typedi';

import { LoggingService } from '@/app/services/LoggingService';

export interface HttpRequestConfig {
  method: string;
  url: string;
}

@Service()
export class HttpService {
  private loggingService: LoggingService;

  constructor() {
    this.loggingService = Container.get(LoggingService);
  }

  public async makeRequest<T>(
    conf: HttpRequestConfig
  ): Promise<{ data: T } | undefined> {
    try {
      const res = await fetch(conf.url, { method: conf.method });
      if (!res.ok) {
        this.loggingService.error(`HTTP ${res.status} for ${conf.url}`);
        return undefined;
      }
      const data = (await res.json()) as T;
      return { data };
    } catch (error) {
      this.loggingService.debug(`Error while requesting ${conf.url}`);
      this.loggingService.error(error);
      return undefined;
    }
  }
}
