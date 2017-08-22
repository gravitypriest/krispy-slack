Slack bot that will tell you when the Krispy Kreme Hot Light is on. Can configure to a Krispy Kreme location of your choice (US only).

Included geocoded postal codes file comes from from http://www.geonames.org.

Use your RTM token either as the environment variable `SLACK_TOKEN` or in a JSON file in the repo directory with the format: `{ "token": "<your token here>" }`

To ask for hotlight status, type `!hotlight` in channel.

To configure location, type `!hotlight configure` and follow the bot's prompts. To cancel configuration, type `!hotlight configure cancel`.