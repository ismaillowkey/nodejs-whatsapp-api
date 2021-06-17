# Requirement
Install Nodejs on your PC [https://nodejs.org/en/download/](https://nodejs.org/en/download/)


## Installation
In your project folder

```bash
npm install
```

## Usage

```bash 
npm start
```

Open your browser and type
[http://localhost:5000/auth/getqr](http://localhost:5000/auth/getqr)
Open your whatsapp and scan with web whatsapp

## Troubleshoot
If you get message
```
XXX binaries cannot be used on the 'linux-x64' platform
```

run command
```bash
rm -rf node_modules/sharp
rm -rf node_modules/whatsapp-web.js/sharp
```

# API Doc
## Auth
Getting QR Code
``GET : /auth/getqr``
> Used to get a QR Code to Log into Whatsapp Web
	- After Scan QR Code with whatsapp app 
	- Refresh browser, If logged in, returns a "Already Authenticated" message.

## Chat
Sending Messages (with your country number ,like 62xxx)
``POST : /chat/sendmessage/<phone_number>``
> Request Body
> - message - contains the message to be sent
<hr>