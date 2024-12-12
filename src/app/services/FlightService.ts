import Amadeus from 'amadeus';
import Container, { Service } from 'typedi';

import { CacheService } from '@/app/services/CacheService';
import { LoggingService } from '@/app/services/LoggingService';

interface FlightSearchProps {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
}
export interface FlightData {
  grandTotal: string;
  currency: string;
  departAirport: string;
  departTime: string;
  airline: string;
  arrivalAirport: string;
  arriveTime: string;
}

const amadeus = new Amadeus({
  clientId: String(process.env.AMADEUS_CLIENT_ID),
  clientSecret: String(process.env.AMADEUS_CLIENT_SECRET),
});

@Service()
export class FlightService {
  private cacheService: CacheService;
  private loggingService: LoggingService;
  constructor() {
    this.cacheService = Container.get(CacheService);
    this.loggingService = Container.get(LoggingService);
  }
  private getCacheKey = ({
    originLocationCode,
    destinationLocationCode,
    departureDate,
  }: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
  }) => {
    return `flight:${originLocationCode}:${destinationLocationCode}:${departureDate}`;
  };

  private async uncachedFlightSearch({
    originLocationCode,
    destinationLocationCode,
    departureDate,
  }: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
  }): Promise<FlightData> {
    try {
      const res = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        currencyCode: 'USD',
        adults: '1',
        nonStop: true,
        max: 1,
      });
      const flightData = res.result.data;
      this.loggingService.debug({ flightData });
      if (!flightData[0]) {
        this.loggingService.error(
          `Flight data came back empty for ${originLocationCode}=>${destinationLocationCode}`
        );
        return {
          grandTotal: '',
          currency: '',
          departAirport: '',
          departTime: '',
          airline: '',
          arrivalAirport: '',
          arriveTime: '',
        }; // empty result. No flight
      }
      const obj = {
        grandTotal: flightData[0].price.grandTotal,
        currency: flightData[0].price.currency,
        departAirport:
          flightData[0].itineraries[0].segments[0].departure.iataCode,
        departTime: flightData[0].itineraries[0].segments[0].departure.at,
        airline: flightData[0].itineraries[0].segments[0].carrierCode,
        arrivalAirport:
          flightData[0].itineraries[0].segments[0].arrival.iataCode,
        arriveTime: flightData[0].itineraries[0].segments[0].arrival.at,
      };
      return obj;
    } catch (e) {
      this.loggingService.debug('error while calling the flight service');
      this.loggingService.error(e);
      throw e;
    }
  }
  public async getFromCacheOnly(props: FlightSearchProps) {
    const cacheKey = this.getCacheKey(props);
    const str = await this.cacheService.getFromCacheOnly(cacheKey);
    if (str === null) return null;
    return JSON.parse(str) as FlightData;
  }

  public async cachedFlightSearch(props: FlightSearchProps) {
    const cacheKey = this.getCacheKey(props);
    const oneDay = 24 * 60 * 60;
    return this.cacheService.cachedFunctionCall<FlightData | null>(
      cacheKey,
      oneDay,
      () => this.uncachedFlightSearch(props)
    );
  }
}
