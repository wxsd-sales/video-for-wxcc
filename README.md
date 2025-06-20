# Interaction trigger into WxCC
This document provides instructions to trigger a customer interaction with Webex Contact Center (WxCC). 

## Overview
Webex Contact Center (WxCC) offers a comprehensive set of integration capabilities. Reading this document you will learn how to set WxCC Entry Points and Queues, Webex Engage and Connect Assets, and the neeed Live Chat Inbound Webex Connect Flow to trigger the interaction.
 
## Prerequisites & Dependencies
- Webex Connect services must be up and running, you can visit this [link](https://help.webex.com/en-us/article/nee1mb6/Get-started-with-Webex-Contact-Center#Cisco_Task_in_List_GUI.dita_d7731baf-98fb-4a45-8f75-30984a38fa75) to get more details
- _Webex CC Task_ and _Webex CC Engage_ nodes must be in an Authorized state, you can visit this [link](https://help.webex.com/en-us/article/n954r0k/Set-up-digital-channels-in-Webex-Contact-Center) to get more details
- A basic understanding of Live Chat channel asset configuration for Webex Connect is needed

## Setup

### Create a Webex Connect Chat Asset

1. Log in to your WxConnent tenant
2. Navigate to the Menu **_Assets, Apps_**, click on **_Configure New App_** and choose **_Mobile / Web_**
3. Set a name of your choice, we will use 'my_chat_app' in this example
4. When you enable **_Live Chat / In-App Messaging_**, you can choose the Primary and Secondary Transport Protocol. Primary must be **_MQTT_**, and Secondary **_Web Socket_**.
5. Check the option **_Use Secured Port_**, and Save
6. When the application is saved, the buttons **_Register to Webex Engage_** and **_Configure Outbound Webhooks_** will be enabled. Click on **_Register to Webex Engage_**, select some of your existing Webex Connect services (if you do not have any you should create a new one), and click on the **_Register_** blue button.
Please write down the **_Client Key_** value, you will need it later.
7. Go to back to **_Assets, Apps_**. You will see a list of Apps, write down the **_App ID_** for the one you just created

### Webex Engage Asset setup
1. Log in Control Hub as Contact Center Admin, and under **SERVICES** go to Contact Center. On the right side panel, click on **Webex Engage**.
2. Navigate to **_New Digital Channels_**
3. Navigate to **_Assets -> Channels Assets_**, and click on the pen icon for the Asset with the same name you chose in the previous step (my_chat_app in this example)
4. Go to **_Websites_**, and add a new web site
5. Set the following mandatory values (these are examples):
 - Display Name = Support
 - First message = Hi there
 - Domain = *.mydomain.com

### Entry Points and Queues setup
Now we need to configure the system for sending the interaction to the right queue:
1. Log in Control Hub as Contact Center Admin, and under **SERVICES** go to Contact Center.
2. Navigate to the Menu **_Channels_** and click on **_Create Channel_**
3. Set the following values, and then Click on **_Save_**
 - Name = Chat-EP (this is an example)
 - Channel Type = Chat
 - Asset Name = Select the WxConnect Asset Name you created in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#create-a-webex-connect-chat-asset), 'my_chat_app' in this example
 - Service Level Threshold = 120 (this is an example)
 - And a Description of your choice and your prefered Timezone
4. Navigate to the Menu **_Queues_** and create a new Queue
5. Set the following values, and then Click on **_Save_**
  - Name = Chat-queue (this is an example)
  - Add a Description of your choice
  - Queue Type = Inbound Queue
  - Channel Type = Chat
  - Queue Routing Type = Longest Available Agent (this is an example)
  - Click on **Create Group_** in the **_Contact Routing Settings_**. Choose the Team of agents that you want to answer these interactions
  - Service Level Threshold and Maximum Time in Queue = 120 (this is an example)
  - Maximum Time in Queue = 60 (this is an example)

### Webex Connect Flow
1. Download the [flow](https://github.com/wxsd-sales/video-for-wxcc/blob/main/63672.workflow)
2. Go to the Service you chose in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#create-a-webex-connect-chat-asset) and create a new flow
3. Set a name of your choice, 'my_chat_flow' in this example. As **Method**_, choose **_Upload a flow_**, and choose the flow file you downloaded
4. Select **_Create new Event_** and choose a Name for your Webhook (chat-webhook in this example)
5. Use this Sample Input, and click on Parse
   ```
   {"customerName": "",
   "customerEmail": "",
   "videoCallDestination": "",
   "inappmessaging.appId": "",
   "inappmessaging.userId": ""}
   ```
7. Save
Your Flow Init configuration should look like this:

<img width="500" alt="image" src="https://github.com/wxsd-sales/video-for-wxcc/assets/22101144/c097943c-1aa7-457d-b9d9-99b12bae5be2">

Follow the next steps before publishing the flow:
1. Edit some of the Custom Variables:
- _serviceKey_ = Use the Client Key Value created in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#create-a-webex-connect-chat-asset)
 - _liveChatDomain_ = The value you chose in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#webex-engage-asset-setup) (*.mydomain.com in this example)
3. Open the _Receive_ Node and click on **_Save_**
4. Open the _Queue Task_ Node, and select the queue you created in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#entry-points-and-queues-setup) (Chat-queue in this example)
5. Open the _Resolve Conversation_ Node, and change the Flow Id value. You can find this value in the WxConnect Services list:
 <img width="500" alt="image" src="https://github.com/wxsd-sales/video-for-wxcc/assets/22101144/87b593d2-210b-4b02-acae-8ba293ec3eba">

6. If you want, you can also edit the _Flow Init_ node Transaction Action Set Variable Action, for the variable _resolveConversationMessage_: this is the text shown in the WxCC Agent Desktop when the interaction is accepted.

## Example

In this [video](https://app.vidcast.io/share/975ce20b-1c2b-4c6d-a340-df70b42a96e3) you can see an example of what you can create. After the creation of the Webex Connect Flow, you should follow these additional steps:

1. Import this [macro](https://github.com/wxsd-sales/video-for-wxcc/blob/main/macro.js) on the Cisco video device (A Desk Pro was used in this example)
2. Customer Date is taken from JDS WxCC. Customer Journey is also updated with thiw new interaction



## How to trigger the flow
Now you only need to trigger the flow from your application:
  ```
  curl --location URL \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "customerName": NAME,
      "customerEmail": EMAIL,
      "videoCallDestination": VIDEO_CALL_DESTINATION,
      "inappmessaging.appId": APPID,
      "inappmessaging.userId":"UUID"
  }'
  ```
URL = The Webhook URL configured in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#webex-connect-flow)

NAME = Customer name that will be shown in the WxCC Agent Desktop

EMAIL = Customer email. If you are planning to use JDS, this must be the customer email for the identity in JDS

VIDEOCALLDESTINATION = A custom variable that you can control in the flow. For video use cases like [this](https://github.com/wxsd-sales/video-cc-widget-lit), this will be the Video SIP URi destination

APPID = The **_App ID_** configured in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#webex-connect-flow)

UUID = A unique UUID of your choice

## License

All contents are licensed under the MIT license. Please see [license](https://github.com/wxsd-sales/video-cc-widget-lit/blob/main/LICENSE) for details.

## Disclaimer

This flow can be used only for demo purposes.

Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex use cases, but are not Official Cisco Webex Branded demos.

## Questions
Please, contact the WXSD team at wxsd@external.cisco.com for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to reach our team.
