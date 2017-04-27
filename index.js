const https = require('https');
const qs = require('querystring');
const WebSocket = require('ws');

const environment = process.env.SLACK_ENV || '';
const rtmMethod = function () {
  switch (process.env.SLACK_RTM_METHOD) {
    case 'rtm.start':
      return 'rtm.start';
    default:
      return 'rtm.connect'
  }
}();
const rtmMethodUrl = `https://${ environment ? `${environment}.` : '' }slack.com/api/${rtmMethod}`;

const token = process.env.SLACK_TOKEN;
if (!token) {
  throw new Error('Cannot run without a Slack token');
}

const additionalParams = function () {
  if (process.env.SLACK_RTM_PARAMS) {
    return JSON.parse(process.env.SLACK_RTM_PARAMS);
  } else {
    return {};
  }
}

const params = Object.assign({ token }, additionalParams);
const paramsQs = qs.stringify(params);

function createWebsocket(url) {
  const ws = new WebSocket(url, { perMessageDeflate: false });
  let nextMessageId = 1;
  let pingerInterval;

  function startPinger() {
    pingerInterval = setInterval(() => {
      console.log('Message Send Ping');
      // ws.send(JSON.stringify({
      //   id: nextMessageId,
      //   type: 'ping',
      //   pingTime: Date.now()
      // }));
      // nextMessageId++;
      ws.ping(null, false, true);
    }, 5000);
  }

  function stopPinger() {
    clearInterval(pingerInterval);
  }

  ws.on('open', () => {
    console.log('WebSocket Open');
    startPinger();
  });
  ws.on('close', (code, reason) => {
    console.log('WebSocket Close:', code, reason);
    // TODO: handle CLOSE_ABNORMAL or any other conditions in which reconnect should occur
    stopPinger();
  });
  ws.on('message', (data) => {
    console.log('WebSocket Message')
    const message = JSON.parse(data);
    if ('ok' in message) {
      // This message is in response to an outgoing message
      if (!message.ok) {
        console.error('Message Response Error');
        console.error(message.error);
      } else {
        console.log('Message Response');
        console.log(message);
      }
    } else {
      switch (message.type) {
        case 'ping':
          console.log('Message Received Ping');
          console.warn('UNHANDLED');
        case 'pong':
          console.log('Message Received Pong');
          console.log('RTT (ms):', Date.now() - message.pingTime);
        default:
          console.log('Message Received');
          console.log(message);
      }
    }
  });
  ws.on('ping', () => {
    console.log('WebSocket Received Ping');
  })
  ws.on('pong', () => {
    console.log('WebSocket Received Pong');
    console.warn('UNEXPECTED');
  })
  ws.on('error', (error) => {
    console.error('WebSocket Error')
    console.error(error)
  });
}

const rtmRequestUrl = `${rtmMethodUrl}?${paramsQs}`;
console.log('RTM Request URL: ', rtmRequestUrl);
https
  .get(rtmRequestUrl, (res) => {
    console.log('Response Status: ', res.statusCode);
    let responseString = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => responseString += chunk);
    res.on('end', () => {
      const responseJson = JSON.parse(responseString);
      if (!responseJson.ok) {
        console.error('Response Not OK');
        console.error(responseJson);
        return;
      }
      if (responseJson.warning) {
        console.warn('Response Warnings');
        console.warn(responseJson.warning);
      }
      console.log('Response');
      console.log(responseJson);
      createWebsocket(responseJson.url);
    });
  })
  .on('error', console.error);
