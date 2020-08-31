# 5paisajs

Official Javascript client for 5paisa APIs natively written in .NET

## Installation

```
npm install 5paisajs --save
```

## Usage

<!-- eslint-disable strict -->

```js
const conf = {
    "appSource": "",
    "appName": "",
    "userId": "",
    "password": "",
    "userKey": "",
    "encryptionKey": ""
}

const FivePaisaClient = require("5paisajs")

var client = new FivePaisaClient(conf)

// Logging in
client.login("random_email@xyz.com", "password", "YYYYMMDD").then((response) => {
    client.init(response).then(() => {
        client.getHoldings().then((response) => {
            console.log(response)
        }).catch((err) => {
            console.log(err)
        })
    })
}).catch()

```
