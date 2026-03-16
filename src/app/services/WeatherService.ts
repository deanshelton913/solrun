import { fetchWeatherApi } from 'openmeteo';
import Container, { Service } from 'typedi';

import { CacheService } from '@/app/services/CacheService';
import { GeocoderService } from '@/app/services/GeocoderService';

interface AnemicSingleWeatherReport {
  forecast: string[];
  dailyHighs: number[];
  weatherScore: number;
  latitude: number;
  longitude: number;
  averageTemp: number;
  normalizedScore?: number;
  normalizedTempDifference?: number;
  weightTempAdjusted?: number;
  normalizedDistance?: number;
}
export interface SingleWeatherReport extends AnemicSingleWeatherReport {
  cityName: string;
  distance: number;
  iataCode: string;
}

@Service()
export class WeatherService {
  private cacheService: CacheService;
  private geocoderService: GeocoderService;

  constructor() {
    this.cacheService = Container.get(CacheService);
    this.geocoderService = Container.get(GeocoderService);
  }

  /** Run async tasks with a max concurrency to avoid rate limits (e.g. Open-Meteo). */
  private async runWithConcurrencyLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let index = 0;
    async function worker(): Promise<void> {
      while (index < items.length) {
        const i = index++;
        results[i] = await fn(items[i], i);
      }
    }
    await Promise.all(
      Array.from({ length: Math.min(limit, items.length) }, () => worker())
    );
    return results;
  }

  private getCacheKey({
    lat,
    lon,
    days,
  }: {
    lat: number;
    lon: number;
    days: number;
  }) {
    return `weather:${lat}:${lon}:${days}`;
  }

  private weatherCodeToEnglish(code: number) {
    return (
      {
        0: 'CLEAR_SKY',
        1: 'MAINLY_CLEAR',
        2: 'PARTLY_CLOUDY',
        3: 'OVERCAST',
        45: 'FOG',
        48: 'RIME_FOG',
        51: 'DRIZZLE_LIGHT',
        53: 'DRIZZLE_MODERATE',
        55: 'DRIZZLE_DENSE_INTENSITY',
        56: 'FREEZING_DRIZZLE_LIGHT',
        57: 'FREEZING_DRIZZLE_DENSE',
        61: 'RAIN_SLIGHT',
        63: 'RAIN_MODERATE',
        65: 'RAIN_HEAVY',
        66: 'FREEZING_RAIN_LIGHT',
        67: 'FREEZING_RAIN_HEAVY_INTENSITY',
        71: 'SNOW_FALL_SLIGHT',
        73: 'SNOW_FALL_MODERATE',
        75: 'SNOW_FALL_HEAVY_INTENSITY',
        77: 'SNOW_GRAINS',
        80: 'RAIN_SHOWERS_SLIGHT',
        81: 'RAIN_SHOWERS_MODERATE',
        82: 'RAIN_SHOWERS_VIOLENT',
        85: 'SNOW_SHOWERS_SLIGHT',
        86: 'SNOW_SHOWERS_HEAVY',
        95: 'THUNDERSTORM_SLIGHT_OR_MODERATE',
        96: 'THUNDERSTORM_WITH_SLIGHT_HAIL',
        99: 'THUNDERSTORM_WITH_HEAVY_HAIL',
      }[code] || 'NOT_FOUND'
    );
  }

  private async _uncached_GetSingleAnemicReport({
    lat,
    lon,
    days,
  }: {
    lat: number;
    lon: number;
    days: number;
  }) {
    // This function returns values that are not common in JS post-processing.
    // The result of this call is an object which eventually returns a
    // Float32Array, requiring some rather strange postProcessing steps
    // to confirm the values are not NULL.
    const responses = await fetchWeatherApi(
      'https://api.open-meteo.com/v1/forecast',
      {
        latitude: lat,
        longitude: lon,
        daily: ['weather_code', 'temperature_2m_max'],
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        precipitation_unit: 'inch',
        timezone: 'America/Los_Angeles',
        forecast_days: days + 1, // we will remove "today"
      }
    );
    const daily = responses[0].daily();
    if (daily === null) {
      throw new Error('Failure By Design: Weather Daily Result is null');
    }
    const dailyVariables0 = daily.variables(0);
    if (dailyVariables0 === null) {
      throw new Error('Failure By Design: dailyVariables0 is null');
    }
    const dailyVariables0Array = dailyVariables0.valuesArray();

    if (dailyVariables0Array === null) {
      throw new Error('Failure By Design: dailyVariables0Array is null');
    }
    const dailyVariables1 = daily.variables(1);
    if (dailyVariables1 === null) {
      throw new Error('Failure By Design: dailyVariables1 is null');
    }
    const dailyVariables1Array = dailyVariables1.valuesArray();

    if (dailyVariables1Array === null) {
      throw new Error('Failure By Design: dailyVariables1Array is null');
    }

    const weatherCodes: number[] = Array.from(dailyVariables0Array);

    const temps: number[] = Array.from(dailyVariables1Array);
    const averageTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const weatherScore = weatherCodes.reduce((a, b) => a + b, 0);
    const forecast = weatherCodes.map(this.weatherCodeToEnglish);
    forecast.shift(); // Remove today. We requested N+1 days!
    temps.shift(); // Align with forecast (drop today)
    const dailyHighs = temps;
    return {
      forecast,
      dailyHighs,
      weatherScore,
      latitude: lat,
      longitude: lon,
      averageTemp,
    } as AnemicSingleWeatherReport;
  }

  private async _anemic_getSingleWeatherReport({
    lat,
    lon,
    days,
  }: {
    lat: number;
    lon: number;
    days: number;
  }) {
    const cacheKey = this.getCacheKey({ lat, lon, days });
    const oneDay = 24 * 60 * 60;
    return this.cacheService.cachedFunctionCall(cacheKey, oneDay, () =>
      this._uncached_GetSingleAnemicReport({ lat, lon, days })
    );
  }

  public async getRankedWeatherLocations({
    originCityName,
    topTravelDestinations,
    days,
    sortCriteria: {
      idealTemp = 85.0, // temp in degrees F
      distanceWeight = 0.5, // closer to me
      scoreWeight = 0.5, // more sun
      tempWeight = 0.9, // closer to idealTemp
    },
  }: {
    originCityName: string;
    topTravelDestinations: { name: string; iataCode: string }[];
    days: number;
    sortCriteria: {
      idealTemp: number;
      distanceWeight: number;
      scoreWeight: number;
      tempWeight: number;
    };
  }) {
    const OPEN_METEO_CONCURRENCY = 5;
    const resolvedPromises = await this.runWithConcurrencyLimit(
      topTravelDestinations,
      OPEN_METEO_CONCURRENCY,
      (destination) =>
        this.getSingleWeatherReport({
          fromCity: originCityName,
          toCity: destination.name,
          days,
        })
    );

    // Weighted sort
    const maxDistance = Math.max(
      ...resolvedPromises.map((item) => item.distance)
    );
    const maxScore = Math.max(
      ...resolvedPromises.map((item) => item.weatherScore)
    );
    const maxTempDifference = Math.max(
      ...resolvedPromises.map((item) => Math.abs(item.averageTemp - idealTemp))
    );

    for (const item of resolvedPromises) {
      // Calculate normalized values
      item.iataCode =
        topTravelDestinations.find((x) => x.name === item.cityName)?.iataCode ||
        '';
      item.normalizedDistance = item.distance / maxDistance;
      item.normalizedScore = item.weatherScore / maxScore;
      item.normalizedTempDifference =
        Math.abs(item.averageTemp - idealTemp) / maxTempDifference;

      // Initialize weightTempAdjusted based on temperature condition
      if (item.averageTemp < idealTemp - 10) {
        item.weightTempAdjusted = tempWeight * 0.5;
      } else {
        item.weightTempAdjusted = tempWeight;
      }

      // Ensure normalizedScore and normalizedTempDifference are set
      if (typeof item.normalizedScore !== 'number') {
        throw new Error(`normalizedScore is not a number for ${item.cityName}`);
      }
      if (typeof item.normalizedTempDifference !== 'number') {
        throw new Error(
          `normalizedTempDifference is not a number for ${item.cityName}`
        );
      }
    }

    // Now sort the resolvedPromises based on combined values
    const sorted = resolvedPromises.sort((a, b) => {
      const combinedA =
        Number(a.normalizedDistance) * distanceWeight +
        Number(a.normalizedScore) * scoreWeight +
        Number(a.normalizedTempDifference) * Number(a.weightTempAdjusted);
      const combinedB =
        Number(b.normalizedDistance) * distanceWeight +
        Number(b.normalizedScore) * scoreWeight +
        Number(b.normalizedTempDifference) * Number(b.weightTempAdjusted);

      return combinedA - combinedB;
    });

    return sorted;
  }

  public async getSingleWeatherReport({
    toCity,
    fromCity,
    days,
  }: {
    toCity: string;
    fromCity: string;
    days: number;
  }) {
    const toCords = await this._getLatLon(toCity);
    const fromCords = await this._getLatLon(fromCity);
    const anemicSingleWeatherReport = await this._anemic_getSingleWeatherReport(
      {
        ...toCords,
        days,
      }
    );

    return {
      ...anemicSingleWeatherReport,
      cityName: toCity,
      distance: this._getDistanceFromLatLonInKm(
        fromCords.lat,
        fromCords.lon,
        toCords.lat,
        toCords.lon
      ),
    } as SingleWeatherReport;
  }

  private _deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  private _getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    const R = 6371; // Radius of the earth in km
    const dLat = this._deg2rad(lat2 - lat1);
    const dLon = this._deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._deg2rad(lat1)) *
        Math.cos(this._deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  }

  private async _getLatLon(cityName: string) {
    const { latitude, longitude } =
      await this.geocoderService.cachedGeocodeCityName({
        cityName,
      });
    return { lat: latitude, lon: longitude };
  }
}
