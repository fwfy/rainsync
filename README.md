# RainSync - Sync your IRL weather to your Minecraft server.
This project queries the OpenMeteo API for a given location (see `LATITUDE` and `LONGITUDE` env vars) and uses the returned values to send an appropriate `/weather ...` command via RCON to your Minecraft server.

Contributions are welcome, built without AI and AI contributions will be rejected immediately and publically shamed.

## Usage
Make a .env, and define the following environment variables:
- LATITUDE, LONGITUDE: The location to poll for weather.
- RCON_{HOST,PORT,PASS}: The connection details for your Minecraft server's RCON console.

Example .env file contents:
```env
# You can get these coordinates by right clicking somewhere on Google Maps and clicking the first option (the numbers). You probably don't need all the digits, I just trim it down to 2 decimal places arbitrarily. More precision probably wouldn't hurt though.
LATITUDE=43.65
LONGITUDE=-79.42
# This config should work out of the box if you're running this on the same machine as your server, you'll just have to enable RCON in your server.properties file.
RCON_HOST=127.0.0.1
RCON_PORT=25575
# Please use a secure password here. RCON gives full access to your Minecraft server's console, so you should really be careful about securing it.
RCON_PASS=hunter2
```

Now, you can just run it with Bun.js. Or you could compile it somehow with `tsup` or something, I dunno. I just use Bun because it's simpler and quicker.
