# TTC Tracker
## Description
TTC Tracker is a Discord bot intended for the T2P Films server.
At the moment it only track service alerts and has a NTAS (Next Train Arrival System) feature for Line 2.

## Installation
1. Clone the repository
2. Install the dependencies
3. Create a .env file with the following variables:
```
DISCORD_TOKEN=<Discord bot token>
CLIENT_ID=<Discord bot client ID>
CLIENT_SECRET=<Discord bot client secret>
DB_PATH=<Path to location>/<Database name>.db
EVENTS_GUILD=<Guild ID>
EVENTS_CHANNEL=<Channel ID>
LINE1=<Line 1 emote ID>
LINE2=<Line 2 emote ID>
LINE3=<Line 3 emote ID>
LINE4=<Line 4 emote ID>
GREEN=<Green emote ID>
YELLOW=<Yellow emote ID>
RED=<Red emote ID>
GREENF=<Flashing Green emote ID>
YELLOWF=<Flashing Yellow emote ID>
REDF=<Flashing Red emote ID>
GREENFO=<Flashing offset Green emote ID>
YELLOWFO=<Flashing offset Yellow emote ID>
REDFO=<Flashing offset Red emote ID>
```

## Assets
This bot uses emotes to improve the look of the alerts.
You can use whatever you want for these, but it needs to be something.

## Usage
### Service Alerts
The bot will automatically post an embed into the channel specified in the .env file when any service alerts from the TTC that are active.<br>
This embed will be automatically updated every 30 seconds to reflect any changes to the alerts.<br>
If some of the fields contain too much information, it will be moved to an external embed with each alert being a field.<br>
For each alert, the embed will be formatted as so:
- Light Emote: The colour of the alert, flashing if it was reported by a discord member
- Line number: The line number of the alert, if its 1-4 it will try to use the emote
- Description: The description of the alert
- Light Emote: The colour of the alert, flashing offset if it was reported by a discord member
- Author: The author of the alert, if it was reported by a discord member it will be their discord name, if it's from the TTC it will be "AUTO"
#### Closures
Any closures that are posted will show here
#### Delays
Any delays that are posted will show here
#### Detours
Any detours that are posted will show here
#### Other
Any service alert that didn't fit into the above categories will show here
#### Slow Zones
Any slow zones that a discord member has reported will show here with `/slowzone <line> <location>`
#### Minor Alerts
Any minor alerts that a discord member has reported will show here with `/minorevent <line> <situatuion> (first point)`<br>
An extra embed will also be posted in a new message to allow more points to be added to these alerts.
#### Major Alerts
Any major alerts that a discord member has reported will show here with `/majorevent <line> <situatuion> (first point)`<br>
An extra embed will also be posted in a new message to allow more points to be added to these alerts.
<br><br>
#### Service Alerts Commands
- `/slowzone <line> <location>`: Report a slow zone<br>
- `/minorevent <line> <situatuion> (first point)`: Report a minor alert<br>
- `/majorevent <line> <situatuion> (first point)`: Report a major alert<br>
- `/addpoint <event ID> <update> (new severity)`: Add an update of the situation to an alert. If a new severity is provided it will change the severity. If left blank it will be the same<br>
- `/repost`: Will repost ALL embeds to keep everything in order. *Recommended to limit this command to admins*

### NTAS (Next Train Arrival System)
When the `/ntas <station>` command is used, the bot will reply with an embed containing the NTAS information for the station specified.<br>
Currently, only Line 2 is supported, but line 1 and 4 will be added in the future.<br>
The embed is updated every 20 seconds, for 10 minutes before it stops updating.<br>
The embed will be formatted as so:
- Title: Title of the embed
- Description: Description and station name
- Each field will contain:
  - Line: The line number
  - Direction: The direction of the train
  - Destination: The destination of the train
  - Time: The time until the next 3 trains arrive.
- Update button: Will update the embed with the latest information. *Supposed to force an update for a message that stopped updating, but it isn't working.*
#### NTAS Commands
- `/ntas <station>`: Get the NTAS information for the station specified

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.<br>
There are no tests for this project, so please make sure to test your changes thoroughly.<br>
Updates to this project will be used in the T2P Films server.<br>

## Planned Features
- [ ] Add Line 1 and 4 to NTAS (#1 https://github.com/gtaEPIC/ttc-tracker/issues/1)
- [ ] Add a vehicle tracker (#2 https://github.com/gtaEPIC/ttc-tracker/issues/2)
- [ ] Add a next bus tracker (#3 https://github.com/gtaEPIC/ttc-tracker/issues/3)

# Contact
Since this bot is intended for the T2P Films server, you can contact me there.<br>
[Discord invite](https://discord.gg/uC9upRK3gX)<br>
