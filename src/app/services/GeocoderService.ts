import Container, { Service } from 'typedi';

import { CacheService } from '@/app/services/CacheService';
import { HttpService } from '@/app/services/HttpService';

interface GeocoderParams {
  cityName: string;
}

interface GeoCodeResultItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  feature_code: string;
  country_code: string;
  admin1_id: number;
  admin2_id: number;
  admin3_id: number;
  admin4_id: number;
  timezone: string;
  population: number;
  postcodes: string[];
  country_id: number;
  country: string;
  admin1: string;
  admin2: string;
  admin3: string;
  admin4: string;
}
@Service()
export class GeocoderService {
  // @Inject()
  private httpService: HttpService;
  // @Inject()
  private cacheService: CacheService;
  constructor() {
    this.cacheService = Container.get(CacheService);
    this.httpService = Container.get(HttpService);
  }

  private async uncachedGeocodeCityName(props: GeocoderParams) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURI(
      props.cityName
    )}`;
    const res = await this.httpService.makeRequest<{
      results: GeoCodeResultItem[];
    }>({ method: 'GET', url });
    if (res) {
      return res.data.results[0];
    }
    throw new Error(
      `Failure By Design: null geocode result for ${props.cityName}`
    );
  }

  public async cachedGeocodeCityName(props: GeocoderParams) {
    const oneDay = 24 * 60 * 60 * 100; // 100 days
    const cacheKey = `geocode:${encodeURI(props.cityName)}`;
    return this.cacheService.cachedFunctionCall<GeoCodeResultItem>(
      cacheKey,
      oneDay,
      () => this.uncachedGeocodeCityName(props)
    );
  }
}
