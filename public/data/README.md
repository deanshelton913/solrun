# Airport data

- **Source:** [OurAirports](https://ourairports.com/data/) (public domain, updated daily).
- **Files:**
  - `airports.json` — all known airports with name, IATA/ICAO codes, municipality, country, type, and coordinates.
  - `starting-cities.json` — unique cities from IATA airports (municipality + country name) for the starting-city autocomplete.
- **Refresh:** From project root run: `pnpm run fetch-airports`
- **API:** `GET /api/airports` returns `{ airports: Airport[] }`. Static: `/data/airports.json`, `/data/starting-cities.json`
