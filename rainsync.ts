import { Rcon } from "rcon-client";
import * as dotenv from "dotenv";
import { OpenMeteoAPIResponse } from "./types/openmeteo";
import { MinecraftWeatherType, WeatherChangeMessages } from "./types/mcweather"
import axios from "axios";
dotenv.config({ quiet: true });

let CURRENT_WEATHER: undefined | MinecraftWeatherType;

const INTERVAL_OFFSET = 30000; // Add this many ms to the interval returned by the OpenMeteo API, to allow for updates to come thru properly & to be kind API consumers.
const INTERVAL_JITTER = 10000; // And jitter it by this much, in case we're not the only ones offsetting by exactly INTERVAL_OFFSET.

if (
  !process.env.RCON_HOST ||
  !process.env.RCON_PORT ||
  !process.env.RCON_PASS ||
  !process.env.LATITUDE ||
  !process.env.LONGITUDE
) {
  throw new Error(
    `One or more required env vars are missing or undefined: RCON_{HOST,PORT,PASS}, LATITUDE, LONGITUDE.`,
  );
} else if (isNaN(parseInt(process.env.RCON_PORT))) {
  throw new Error(`RCON_PORT must be a numerical value.`);
}

console.log(
  `Opening RCON connection to ${process.env.RCON_HOST}:${process.env.RCON_PORT}...`,
);
const rcon = await Rcon.connect({
  host: process.env.RCON_HOST,
  port: parseInt(process.env.RCON_PORT),
  password: process.env.RCON_PASS,
});
console.log(`Connected to RCON!`);

function decideWeatherType(
  api_data: OpenMeteoAPIResponse,
): MinecraftWeatherType {
  if (
    api_data.current.precipitation > 0 ||
    api_data.current.rain > 0 ||
    api_data.current.snowfall > 0
  ) {
    return MinecraftWeatherType.RAIN;
  }
  return MinecraftWeatherType.CLEAR;
}

async function fetchAndUpdateWeather(): Promise<void> {
  console.log(`Querying OpenMeteo for current weather data...`);
  let response;
  try {
    response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${process.env.LATITUDE}&longitude=${process.env.LONGITUDE}&current=rain,precipitation,showers,snowfall`,
    );
  } catch (err) {
    console.error(
      `Exception caught while querying OpenMeteo, will retry in 30 seconds:\n`,
      err,
    );
    setTimeout(fetchAndUpdateWeather, 30000);
    return;
  }
  let api_data: OpenMeteoAPIResponse = response.data;
  let weather_type: MinecraftWeatherType = decideWeatherType(api_data);
  let next_query_interval =
    api_data.current.interval * 1000 +
    INTERVAL_OFFSET +
    Math.random() * (INTERVAL_JITTER - INTERVAL_JITTER / 2);
  console.log(
    `Based on the response, the weather will be set to "${weather_type}". The next query will happen in ${Number(next_query_interval / 1000).toFixed(2)} seconds.`,
  );
  if (CURRENT_WEATHER != weather_type) {
    await rcon.send(`weather ${weather_type}`);
    await rcon.send(`tellraw @a ${WeatherChangeMessages[weather_type]}`);
    CURRENT_WEATHER = weather_type;
  }
  setTimeout(fetchAndUpdateWeather, next_query_interval);
}

fetchAndUpdateWeather();
