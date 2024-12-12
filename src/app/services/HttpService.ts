import axios, { type Axios, type AxiosRequestConfig, AxiosError } from 'axios';
import Container, { Service } from 'typedi';

import { LoggingService } from '@/app/services/LoggingService';

@Service()
export class HttpService {
  private client: Axios;
  private loggingService: LoggingService;

  constructor() {
    this.client = axios;
    this.loggingService = Container.get(LoggingService);
  }
  public async makeRequest<T>(conf: AxiosRequestConfig) {
    try {
      const newConf = {} as AxiosRequestConfig;
      return await this.client.request<T>({ ...conf, ...newConf });
    } catch (error) {
      this.loggingService.debug(`Error while requesting ${conf.url}`);
      if (error instanceof AxiosError) {
        if (error.response) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          this.loggingService.error(error.response.data);
        } else if (error.request) {
          /*
           * The request was made but no response was received, `error.request`
           * is an instance of XMLHttpRequest in the browser and an instance
           * of http.ClientRequest in Node.js
           */
          this.loggingService.error(error.request);
        } else {
          // Something happened in setting up the request and triggered an Error
          this.loggingService.error('Error', error.message);
        }
      }
    }
  }
}
