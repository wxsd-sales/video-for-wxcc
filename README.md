# Video interaction trigger into WxCC
This document provides instructions to trigger a video interaction into Webex Contact Center (WxCC). We will be using a Live Chat Inbound Flow for this.

## Overview
Webex Contact Center (WxCC) offers a comprehensive set of integration capabilities.
 
## Prerequisites & Dependencies
- Webex Connect services must be up and running, you can visit this [link](https://help.webex.com/en-us/article/nee1mb6/Get-started-with-Webex-Contact-Center#Cisco_Task_in_List_GUI.dita_d7731baf-98fb-4a45-8f75-30984a38fa75) to get more details
- Webex CC Task and Webex CC Engage nodes must be in an Authorized state, you can visit this [link](https://help.webex.com/en-us/article/n954r0k/Set-up-digital-channels-in-Webex-Contact-Center) to get more details
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

### Webex Engage Asset setup
1. Log in to your WxCC tenant at https://portal-v2.wxcc-us1.cisco.com
> The login URL will change depending on your region
2. Navigate to **_New Digital Channels_**
3. Navigate to **_Assets -> Channels Assets_**, and click on the pen icon for the Asset with the same name you chose in the previous step (my_chat_app in this example)
4. Go to **_Websites_**, and add a new web site
5. Set the following mandatory values (these are examples):
 - Display Name = Support
 - First message = Hi there
 - Domain = *.mydomain.com

### Entry Points and Queues setup
Now we need to configure the system for sending the interaction to the right queue:
1. Log in to your WxCC tenant at https://portal-v2.wxcc-us1.cisco.com
> The login URL will change depending on your region
2. Navigate to the Menu **_Provisioning -> Entry Points/Queues -> Entry Point_** and create a new Entry Point
3. Set the following values, and then Click on **_Save_**
 - Name = Chat-EP (this is an example)
 - Type = Entry Point
 - Channel Type = Chat
 - Asset Name = Select the WxConnect Asset Name you created in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#create-a-webex-connect-chat-asset), 'my_chat_app' in this example
 - Service Level Threshold = 120 (this is an example)
 - And a Description of your choice
4. Navigate to the Menu **_Provisioning -> Entry Points/Queues -> Queue_** and create a new Queue
5. Set the following values, and then Click on **_Save_**
  - Name = Chat-queue (this is an example)
  - Add a Description of your choice
  - Type = Queue
  - Channel Type = Chat
  - Queue Routing Type = Longest Available Agent (this is an example)
  - Click on **_Add Group_** in the **_Contact Routing Settings_**. Choose the Team of agents that you want to answer these interactions
  - Service Level Threshold and Maximum Time in Queue = 120 (this is an example)

### Webex Connect Flow
1. Download the [flow](https://github.com/wxsd-sales/video-for-wxcc/blob/main/35435.workflow)
2. Go to the Service you chose in the [previous step](https://github.com/wxsd-sales/video-for-wxcc/blob/main/README.md#create-a-webex-connect-chat-asset) and create a new flow
3. Set a name of your choice, 'my_chat_flow' in this example. As **Method**_, choose **_Upload a flow_**, and choose the flow file you downloaded
4. Select **_Create new Event_** and choose a Name for your webhook (chat-webhook in this example)
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

 ## Disclaimer
 This flow can be used only for demo purposes
