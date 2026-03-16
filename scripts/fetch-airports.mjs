#!/usr/bin/env node
/**
 * Fetches airport data from OurAirports (Public Domain, updated daily)
 * https://davidmegginson.github.io/ourairports-data/
 * Outputs public/data/airports.json for use in the app.
 */

import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AIRPORTS_CSV_URL =
  'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv';
const COUNTRIES_CSV_URL =
  'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/countries.csv';
const REGIONS_CSV_URL =
  'https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/regions.csv';
const OUT_DIR = `${__dirname}/../public/data`;
const OUT_FILE = `${OUT_DIR}/airports.json`;
const STARTING_CITIES_FILE = `${OUT_DIR}/starting-cities.json`;

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (inQuotes) {
      current += c;
    } else if (c === ',') {
      result.push(current.trim());
      current = '';
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  // Fetch country names for display
  const countriesRes = await fetch(COUNTRIES_CSV_URL);
  if (!countriesRes.ok) throw new Error(`Failed to fetch countries: ${countriesRes.status}`);
  const countryLines = (await countriesRes.text()).split(/\r?\n/).filter((l) => l.length > 0);
  const countryHeader = parseCSVLine(countryLines[0]);
  const codeIdx = countryHeader.indexOf('code');
  const nameIdx = countryHeader.indexOf('name');
  const countryNameByCode = {};
  for (let i = 1; i < countryLines.length; i++) {
    const row = parseCSVLine(countryLines[i]);
    if (row[codeIdx] && row[nameIdx]) countryNameByCode[row[codeIdx].replace(/"/g, '')] = row[nameIdx].replace(/"/g, '');
  }

  const regionsRes = await fetch(REGIONS_CSV_URL);
  if (!regionsRes.ok) throw new Error(`Failed to fetch regions: ${regionsRes.status}`);
  const regionLines = (await regionsRes.text()).split(/\r?\n/).filter((l) => l.length > 0);
  const regionHeader = parseCSVLine(regionLines[0]);
  const regionCodeIdx = regionHeader.indexOf('code');
  const regionNameIdx = regionHeader.indexOf('name');
  const regionNameByCode = {};
  for (let i = 1; i < regionLines.length; i++) {
    const row = parseCSVLine(regionLines[i]);
    if (row[regionCodeIdx] && row[regionNameIdx]) regionNameByCode[row[regionCodeIdx].replace(/"/g, '')] = row[regionNameIdx].replace(/"/g, '');
  }

  const res = await fetch(AIRPORTS_CSV_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const header = parseCSVLine(lines[0]);
  const idx = (name) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`Column not found: ${name}`);
    return i;
  };
  const col = {
    name: idx('name'),
    type: idx('type'),
    iso_country: idx('iso_country'),
    iso_region: idx('iso_region'),
    municipality: idx('municipality'),
    iata_code: idx('iata_code'),
    icao_code: idx('icao_code'),
    ident: idx('ident'),
    latitude_deg: idx('latitude_deg'),
    longitude_deg: idx('longitude_deg'),
  };

  const airports = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < header.length) continue;
    const name = row[col.name];
    if (!name || name === 'null') continue;
    const iataCode = (row[col.iata_code] || '').trim();
    const icaoCode = (row[col.icao_code] || '').trim();
    const ident = (row[col.ident] || '').trim();
    const code = iataCode || icaoCode || ident || null;
    if (!code) continue;
    airports.push({
      name: name.replace(/"/g, ''),
      iataCode: iataCode || null,
      icaoCode: icaoCode || (ident.length === 4 ? ident : null),
      ident: ident || null,
      municipality: (row[col.municipality] || '').trim() || null,
      countryCode: (row[col.iso_country] || '').trim() || null,
      isoRegion: (row[col.iso_region] || '').trim() || null,
      type: (row[col.type] || '').trim() || null,
      latitude: parseFloat(row[col.latitude_deg]) || null,
      longitude: parseFloat(row[col.longitude_deg]) || null,
    });
  }

  const out = createWriteStream(OUT_FILE, { encoding: 'utf8' });
  out.write(JSON.stringify(airports, null, 0));
  out.end();
  await new Promise((resolve, reject) => {
    out.on('finish', resolve);
    out.on('error', reject);
  });
  console.log(`Wrote ${airports.length} airports to ${OUT_FILE}`);

  // Build unique starting cities from IATA airports (municipality + region/country)
  // For US: "Municipality, State, United States" so "South Dakota" is searchable
  const seen = new Set();
  const startingCities = [];
  for (const a of airports) {
    if (!a.iataCode) continue;
    const municipality = (a.municipality || a.name || '').trim();
    if (!municipality) continue;
    const countryName = countryNameByCode[a.countryCode] || a.countryCode || '';
    let name;
    if (a.countryCode === 'US' && a.isoRegion) {
      const regionName = regionNameByCode[a.isoRegion] || a.isoRegion.replace(/^US-/, '');
      name = regionName ? `${municipality}, ${regionName}, United States` : `${municipality}, ${countryName}`;
    } else {
      name = countryName ? `${municipality}, ${countryName}` : municipality;
    }
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    startingCities.push({ name });
  }
  startingCities.sort((a, b) => a.name.localeCompare(b.name));
  const citiesOut = createWriteStream(STARTING_CITIES_FILE, { encoding: 'utf8' });
  citiesOut.write(JSON.stringify(startingCities, null, 0));
  citiesOut.end();
  await new Promise((resolve, reject) => {
    citiesOut.on('finish', resolve);
    citiesOut.on('error', reject);
  });
  console.log(`Wrote ${startingCities.length} starting cities to ${STARTING_CITIES_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
