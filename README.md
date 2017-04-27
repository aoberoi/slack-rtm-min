# Slack Minimal RTM client

A bare bones program to connect to Slack's RTM API. The purpose of this program is to inspect
messages on an RTM connection when debugging. Since it has practically no dependencies, issues
are isolated from any framework or tools a developer might use to build a client.

While its not designed to be a library, or a package for you to import, it can be useful as a
starting point if you want the absolute minimum for your application.

## Usage

Before you get started, you need a token to connect to the Slack API. Slack has many ways to get
a token including Bot User tokens (`xoxb`) and OAuth Access tokens (`xoxp`). Any of these will do.

Also note that this program is built for node v6 or greater (see `.nvmrc`).

Clone the repository:

`git clone https://github.com/aoberoi/slack-rtm-min.git`

Install the dependencies:

`npm install`

Now you're ready to run the program, but you have a few options in the form of environment
variables.

| Environment Variable | Required           | Type   | Default | Description |
|----------------------|--------------------|--------|---------|-------------|
| SLACK_TOKEN          | :white_check_mark: | string | none    | the token used to authorize the connection |
| SLACK_RTM_METHOD     |                    | `'rtm.connect'` or `'rtm.start'` | `'rtm.connect'` | the Web API method used to retrieve the WebSocket URL |
| SLACK_RTM_PARAMS     |                    | JSON string | `'{}'` | additional parameters to send with the web api method chosen in `SLACK_RTM_METHOD` |
| SLACK_ENV            |                    | string | production (`https://slack.com/api/`) | (internal use) |

Run the program with environment variables set:

`SLACK_TOKEN=xoxb-000000000000-aaaaaaaaaaaaaaaaaaaaaaaa node index.js`

Note: you may set the environment variables in any way you choose, doing so on the command line
is just one option.
