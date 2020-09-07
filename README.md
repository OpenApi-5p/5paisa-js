# 5paisajs

Official Javascript client for 5paisa APIs natively written in .NET

## Installation

```
npm install 5paisajs --save
```

## Documentation

Docs are hosted at https://5paisa.github.io/5paisa-js/

## Usage

### Authentication

Get your API keys from https://www.5paisa.com/DeveloperAPI/APIKeys

```js
// Configuration for your app
const conf = {
    "appSource": "",
    "appName": "",
    "userId": "",
    "password": "",
    "userKey": "",
    "encryptionKey": ""
}

const { FivePaisaClient } = require("5paisajs")

var client = new FivePaisaClient(conf)

// This client object can be used to login multiple users.
client.login("random_email@xyz.com", "password", "YYYYMMDD").then((response) => {
    client.init(response).then(() => {
        // Fetch holdings, positions or place orders here.
        // Some things to try out are given below.
    })
}).catch((err) =>{
    // Oh no :/
    console.log(err)
})

```

### Fetch Holdings

```js
client.getHoldings().then((holdings) => {
    console.log(holdings)
}).catch((err) => {
    console.log(err)
});

/*
[
  {
    BseCode: 535755,
    CurrentPrice: 140,
    DPQty: 0,
    Exch: '\x00',
    ExchType: 'C',
    FullName: 'XYZ ABC',
    NseCode: 30108,
    POASigned: 'N',
    PoolQty: 1,
    Quantity: 1,
    ScripMultiplier: 1,
    Symbol: 'XYZ'
  }
]
*/
```

### Fetch Positions

```js
client.getPositions().then((positions) => {
    console.log(positions)
}).catch((err) => {
    console.log(err)
});
/*
[
  {
    BodQty: 0,
    BookedPL: 0,
    BuyAvgRate: 2.15,
    BuyQty: 2,
    BuyValue: 4.3,
    Exch: 'N',
    ExchType: 'C',
    LTP: 2.15,
    MTOM: 0,
    Multiplier: 1,
    NetQty: 2,
    OrderFor: 'D',
    PreviousClose: 2.25,
    ScripCode: 5831,
    ScripName: 'XYZ',
    SellAvgRate: 0,
    SellQty: 0,
    SellValue: 0
  }
]
*/
```

### Place cash order

```js
var options = {}
try {
      client.placeOrder("BUY", "11111", "1", "B", options).then((response) => {
          console.log(response)
        })
    }
catch (err) {
    console.log(err)
  }

/*
{
  BrokerOrderID: 302493444,
  ClientCode: '51882016',
  Exch: 'N',
  ExchOrderID: '',
  ExchType: 'C',
  LocalOrderID: 0,
  Message: 'Success',
  RMSResponseCode: 0,
  ScripCode: 11111,
  Status: 0,
  Time: '/Date(1598812200000+0530)/'
}
*/
```
