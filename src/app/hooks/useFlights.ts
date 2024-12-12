'use client';
import axios from 'axios';
import { useState } from 'react';

export function useFlights() {
  const [isLoading, setIsLoading] = useState(false);

  async function fetchFlight({
    originLocationCode,
    destinationLocationCode,
  }: {
    originLocationCode: string;
    destinationLocationCode: string;
  }) {
    setIsLoading(true);
    const res = await axios.get(
      `/api/flights?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}`
    );
    setIsLoading(false);
    return res.data;
  }

  return { fetchFlight, isLoading };
}
