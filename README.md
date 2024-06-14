# Video interaction trigger into WxCC
This document provides instructions to trigger a video interaction into Webex Contact Center (WxCC). We will be using a Live Chat Inbound Flow for this.

## Overview
Webex Contact Center (WxCC) offers a comprehensive set of integration capabilities.
 
## Prerequisites & Dependencies
- Webex Connect services must be up and running, you can visit this [link](https://help.webex.com/en-us/article/nee1mb6/Get-started-with-Webex-Contact-Center#Cisco_Task_in_List_GUI.dita_d7731baf-98fb-4a45-8f75-30984a38fa75) for more details.
- A basic understanding of Live Chat channel asset configuration on Webex Connect is needed.


## Setup

### Create a Webex Connect Chat Asset

1. Log in to your WxConnent tenant
2. Navigate to the Menu **_Assets, Apps_**, click on **_Configure New App_** and choose **_Mobile / Web_**
3. Set a name of your choice, we will use 'my-chat-app' in this example
4. When you enable **_Live Chat / In-App Messaging_**, you can choose the Primary and Secondary Transport Protocol. Primary must be **_MQTT_**, and Secondary **_Web Socket_**.
5. Check the option **_Use Secured Port_**, and Save
6. When the application is saved, the buttons **_Register to Webex Engage_** and **_Configure Outbound Webhooks_** will be enabled. Click on **_Register to Webex Engage_**, select some of your existing Webex Connect services (if you do not have any you should create a new one), and click on the **_Register_** blue button.

### Entry Points and Queues setup
Log in to your WxCC tenant at https://portal-v2.wxcc-us1.cisco.com
> The URL 


 
 Download this Webex Connect Flow

 ## Disclaimer
 This flow can be used only for demo purposes
