import xapi from 'xapi';

xapi.Config.WebEngine.Mode.set('On');
xapi.Config.HttpClient.Mode.set('On');

xapi.Status.UserInterface.WebView.on(processWebViews);

const JDS_ORCHESTRATOR_URL = "https://all4jds.glitch.me/";
const AGENT_CONNECT_URL = "your_webex_connect_flow_trigger";
const AGENT_CONNECT_APPID = "your_web_chat_appId";

// const JDS_TOKEN = "bWFjcm8gaXMgc28gc2VjdXJlLi4u"; not used in this version of the code
var DEVICE_ID = "";
var SYSTEM_NAME = "";
var SERIAL_NUMBER = "";
var SYSTEM_SIP_URI = "";


let timeoutId = null;

function main(){
    xapi.Config.UserInterface.InstantMeeting.Invite.set("ManualAdd");
    xapi.Status.SystemUnit.BroadcastName.get().then(name => {
      xapi.Status.SystemUnit.ProductPlatform.get().then(platform => {
        if(name.toLowerCase().indexOf(platform.toLowerCase()) < 0){//We don't want "Al's Desk pro(Desk Pro)"
          SYSTEM_NAME = `${name}(${platform})`;
        } else {
          SYSTEM_NAME = name;
        }
        console.log(SYSTEM_NAME);
      });
    });
    xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get().then(serialNumber => {
      SERIAL_NUMBER = serialNumber;
      console.log(SERIAL_NUMBER);
      
    });
    xapi.Status.UserInterface.ContactInfo.ContactMethod.get().then((contactInfo) => {
      if(contactInfo.length > 0){
        for(let contact of contactInfo){
          if(contact.Number && contact.Number.indexOf("@") > 0){
              SYSTEM_SIP_URI = contact.Number;
              console.log(SYSTEM_SIP_URI); 
              break;
          }
        }
      }
    });
    xapi.Status.SystemUnit.Hardware.Module.DeviceId.get().then((deviceId) => {
      DEVICE_ID = deviceId;
      console.log(DEVICE_ID);
    })
}
main();

function clearTimeoutId(reason){
  clearTimeout(timeoutId);
  console.log(`${reason}: cleared timeoutId: ${timeoutId}`);
  timeoutId = null;
}

async function processWebViews(event) {
  console.log('processWebView', JSON.stringify(event));
  if (!event.hasOwnProperty('URL')) return;
  const url = event.URL;
  const id = event.id;
  console.log(`WebView URL Update - Id [${id}] URL [${url}]`);
  console.log(`WebView [${id}] is visible and contains a valid domain, checking URL hash parameters`);
  const hashes = parseHash(event.URL);

  if (hashes.length === 0) {
    console.log(`WebView [${id}] contains no valid hash parameters, ignoring`);
  } else {
    processHashes(hashes);
  }
}

function processHashes(hashes) {
  for(let hash of hashes){
      if (!hash.hasOwnProperty('command')) return;
      if(!hash.location || ["","null"].indexOf(hash.location.toLowerCase()) >= 0){
        hash.location = SYSTEM_NAME;
      }
      console.log(`WebView Command Recieved [${hash.command}]`);
      console.log("UpdatedHash:");
      console.log(hash);
      if(hash.destination){
        clearTimeoutId('new command');
        //the commercial should only show if there is an active timeout, 
        //which only happens when a new hash command is received.
        //That way dev devices don't play a commercial for every call/meeting unrelated to the kiosk 
        timeoutId = setTimeout(function(){ 
          clearTimeoutId('timeout');
        }, 20000);
        console.log(`timeoutId set: ${timeoutId}`);
      }
      switch (hash.command) {
        case 'dial':
          xapi.Command.Dial({ Number: hash.destination });
          break;
        case 'arrived':
          JDSOrchestratorEvent(hash, 'arrived');
          break;
        case 'quote':
          JDSOrchestratorEvent(hash, 'quote');
          break;
        case 'agent-connect':
          agentConnect(hash);
          break;
      }
  }
}

function alert(title, message, duration){
  if(title.toLowerCase() === "error"){
    console.error(title +': '+ message);
  } else {
    console.log(title +': '+ message);
  }
  xapi.Command.UserInterface.Message.Alert.Display
    ({Duration: duration ? duration : 4, Text: message, Title: title});
}

function JDSOrchestratorEvent(hash){
  let postConfig = {
    //AllowInsecureHTTPS: true,
    Header: ["Content-Type: application/json"],
    ResultBody: "PlainText",
    Url: JDS_ORCHESTRATOR_URL + "/jds-event"
  };
  let data= {
    id: "efdfs",
    specversion: "1.0",
    type: "task:new",
    source: "Kiosk",
    identity: hash.customerId,
    identitytype: "customerId",
    datacontenttype: "application/json",
    data: {
      channelType: hash.channelType,
    },
  }
  if(hash.command == "arrived"){
    data.data.origin = "Customer at " + hash.location
  } else if(hash.command == "quote"){
    data.data.origin = "Customer viewed quote "
    if(hash.quoteNumber){
      data.data.origin += `number ${hash.quoteNumber} `;
    }
    data.data.origin += "from " + hash.location;
  }
  xapi.Command.HttpClient.Post(postConfig, JSON.stringify(data))
}



function agentConnect(hash){
  alert('Connecting', 'Please wait while we connect you', 10);
  let payload = {
    "customerName":decodeURIComponent(hash.customerName),
    "customerEmail":decodeURIComponent(hash.customerEmail),
    "videoCallDestination": SYSTEM_SIP_URI,
    "inappmessaging.appId": AGENT_CONNECT_APPID,
    "inappmessaging.userId": DEVICE_ID
  }
  console.log('agentConnect payload:');
  console.log(payload);
  let postConfig = {
    //AllowInsecureHTTPS: true,
    Header: ["Content-Type: application/json"],
    ResultBody: "PlainText",
    Url: AGENT_CONNECT_URL
  };
  xapi.Command.HttpClient.Post(postConfig, JSON.stringify(payload)).then(result => {
    console.log("RESULT", result.Body);
  }).catch(err => {
    console.error('Error', err);
  });
}


function parseHash(url) {
  const hashes = url.split('#').slice(1)
  if (!hashes || hashes === '') return [];
  let results = [];
  let result;
  for(let hash of hashes){
     result = hash.split('&').reduce((acc, curr) => {
      const [key, value] = curr.split('=')
      if (value) acc[key] = value;
      return acc
    }, {});
    results.push(result);
  }
  console.log('parseHash results:');
  console.log(results);
  return results
}
