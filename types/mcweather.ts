export enum MinecraftWeatherType {
  RAIN = "rain",
  THUNDER = "thunder",
  CLEAR = "clear",
}

export const WeatherChangeMessages: Record<MinecraftWeatherType, string> = {
  [MinecraftWeatherType.RAIN]: `{"text":"Rain, rain, go away...","color":"dark_blue","italic":true}`,
  [MinecraftWeatherType.THUNDER]: `{"text":"Thunderbolts and lightning, very very frightening!","color":"yellow","italic":true}`,
  [MinecraftWeatherType.CLEAR]: `{"text":"Clear skies, my favorite!","color":"green","italic":true}`,
};
