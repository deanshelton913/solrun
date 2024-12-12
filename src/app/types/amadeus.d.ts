/* eslint-disable unused-imports/no-unused-vars */
declare module 'amadeus' {
  type FlightOffersSearchResult = {
    result: {
      data: {
        price: {
          grandTotal: string;
          currency: string;
        };
        itineraries: {
          segments: {
            carrierCode: string;
            departure: { iataCode: string; at: string };
            arrival: { iataCode: string; at: string };
          }[];
        }[];
      }[];
    };
  };
  export default class Amadeus {
    constructor({
      clientSecret,
      clientId,
    }: {
      clientId: string;
      clientSecret: string;
    });
    public readonly shopping = {
      flightOffersSearch: {
        get: async ({
          originLocationCode,
          destinationLocationCode,
          departureDate,
          currencyCode,
          adults,
          nonStop,
          max,
        }: {
          originLocationCode: string;
          destinationLocationCode: string;
          departureDate: string;
          currencyCode: string;
          adults: string;
          nonStop: boolean;
          max: number;
        } = {}): FlightOffersSearchResult => {
          /**/
        },
      },
    };
  }
}
