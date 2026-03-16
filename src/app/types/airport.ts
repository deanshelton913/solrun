/**
 * Airport record from OurAirports (public domain).
 * Data source: https://davidmegginson.github.io/ourairports-data/
 */

export interface Airport {
  name: string;
  iataCode: string | null;
  icaoCode: string | null;
  /** OurAirports/ICAO-style identifier when no IATA/ICAO code. */
  ident?: string | null;
  municipality: string | null;
  countryCode: string | null;
  type: string | null;
  latitude: number | null;
  longitude: number | null;
}
