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

#### Authenticating with TOTP

Get your API keys from (https://tradestation.5paisa.com/apidoc)

```js
// Configuration for your app
const conf = {
  appSource: "",
  appName: "",
  userId: "",
  password: "",
  userKey: "",
  encryptionKey: "",
  clientCode: "",
};

const { FivePaisaClient } = require("5paisajs");

var client = new FivePaisaClient(conf);

// This client object can be used to login multiple users.
client
  .get_TOTP_Session("Client code", "TOTP", "PIN")
  .then(response => {
    // Fetch holdings, positions or place orders here.
    // Some things to try out are given below.
  })
  .catch(err => {
    // Oh no :/
    console.log(err);
  });
```

#### Authenticating with Access Token

Get your API keys from (https://tradestation.5paisa.com/apidoc)

```js
// Configuration for your app
const conf = {
  appSource: "",
  appName: "",
  userId: "",
  password: "",
  userKey: "",
  encryptionKey: "",
  clientCode: "",
};

const { FivePaisaClient } = require("5paisajs");

var client = new FivePaisaClient(conf);

// This client object can be used to login multiple users.
const access_token = "";

client
.set_access_token(access_token)
.then((res) => {
    // Fetch holdings, positions or place orders here.
    // Some things to try out are given below.
})
.catch(err => {
    // Oh no :/
    console.log(err);
  });;
```

#### Authenticating with Request Token

Get your API keys from (https://tradestation.5paisa.com/apidoc)

#### OAUTH Approach
First get a token by logging in to -> https://dev-openapi.5paisa.com/WebVendorLogin/VLogin/Index?VendorKey=<Your Vendor Key>&ResponseURL=<Redirect URL>

VendorKey is UesrKey for individuals user

for e.g. you can use ResponseURL as https://www.5paisa.com/technology/developer-apis
Pass the token received in the response url after successful login to get an access token (this also sets the token for all the APIs you use)-
Please note that you need to copy the request token from URL and paste in this code and start the code within 30s.

client.get_oauth_session('Your Request Token')

After successful authentication, you should get a Logged in!! message in console

```js
// Configuration for your app
const conf = {
  appSource: "",
  appName: "",
  userId: "",
  password: "",
  userKey: "",
  encryptionKey: "",
  clientCode: "",
};

const { FivePaisaClient } = require("5paisajs");

var client = new FivePaisaClient(conf);

// This client object can be used to login multiple users.
const request_token = "";

client
.get_oauth_session(request_token)
.then((res) => {
    // Fetch holdings, positions or place orders here.
    // Some things to try out are given below.
})
.catch(err => {
    // Oh no :/
    console.log(err);
  });;
```

### Fetch Holdings

```js
client
  .getHoldings()
  .then(holdings => {
    console.log(holdings);
  })
  .catch(err => {
    console.log(err);
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
client
  .getPositions()
  .then(positions => {
    console.log(positions);
  })
  .catch(err => {
    console.log(err);
  });
```

### Place order

```js
var options = {
  exchangeSegment: "C",
  atMarket: false,
  stopLossPrice: 0,
  isVTD: false,
  isIOCOrder: false,
  isIntraday: false,
  ahPlaced: "N",
  IOCOrder: false,
  price: 208
};
try {
  client.placeOrder("BUY", "1660", "1", "N", options).then(response => {
    console.log(response);
  });
} catch (err) {
  console.log(err);
}
```

### Modify order

```js
    client.modifyOrder("1100000007628729", "1", "210", "1660", false, "N", "C", true).then((response) => {
            console.log(response)
        })
    } ).catch((err) => {
        console.log(err)
    });
```

### Cancel Order

```js
 client.cancelOrder("1100000007973827", "1", "205", "1660", false, "N", "C", false).then((response) => {
            console.log(response)
        })
    } ).catch((err) => {
        console.log(err)
    });
```

### Place BO-CO Order

```js
var a = {};
client
  .bocoorder(1660, 1, 205, 0, 217, "B", "N", "C", "P", 200, a)
  .then(Response => {
    console.log(Response);
  })
  .catch(err => {
    console.log(err);
  });
// Note : For Cover order par Order_for='c'
```

### Modified Bo-Co Order

```js
var a = {
  ExchOrderId: "1100000008193800"
};
client
  .bocoorder(1660, 1, 205, 0, 217, "B", "N", "C", "M", 200, a)
  .then(Response => {
    console.log(Response);
  })
  .catch(err => {
    console.log(err);
  });

// Note : We Can not Modify Target And Stoploss legs
```

### Modify legs of Executed Bo-Co Order

```js
var ab = {
  price: 215
};

client
  .Mod_bo_order("S", 1660, 1, "N", "1100000008697274", ab)
  .then(Response => {
    console.log(Response);
  })
  .catch(err => {
    console.log(err);
  });
// Note : This is for modify profit order.

var ab = {
  isStopLossOrder: true,
  stopLossPrice: 205,
  isIntraday: true,
  atMarket: true
};

client
  .Mod_bo_order("S", 1660, 1, "N", "1100000008697274", ab)
  .then(Response => {
    console.log(Response);
  })
  .catch(err => {
    console.log(err);
  });
// Note : this is for modify stoploss order.
```

### MarketFeed

```js
a = [
  {
    Exch: "N",
    ExchType: "D",
    Symbol: "NIFTY 27 MAY 2021 CE 14500.00",
    Expiry: "20210527",
    StrikePrice: "14500",
    OptionType: "CE"
  }
];

client
  .getMarketFeed(a)
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.log(err);
  });
```

### MarketDepth

```js
a = [
  { Exchange: "N", ExchangeType: "D", ScripCode: "51440" },
  { Exchange: "N", ExchangeType: "C", ScripCode: "1660" }
];
client
  .getmarketdepth(a)
  .then(response => {
    console.log(response);
  })
  .catch(err => {
    console.log(err);
  });
```

### Historical Data

```js
// historicalData(<Exchange>,<Exchange Type>,<Scrip Code>,<Time Frame>,<From Data>,<To Date>)
a = client.historicalData("n", "c", "1660", "1m", "2021-05-31", "2021-06-01");

//Note: Timeframe should be from this list ['1m','5m','10m','15m','30m','60m','1d']
```
