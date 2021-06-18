const date = new Date();
const today = date.getTime();
date.setDate(date.getDate() + 1);
const followingDay = date.getTime();

const GENERIC_PAYLOAD = {
  head: {
    appName: "",
    appVer: "1.0",
    key: "",
    osName: "WEB",
    requestCode: "",
    userId: "",
    password: ""
  },
  body: {
    ClientCode: ""
  }
};
const MARKET_PAYLOAD = {
  head: {
    appName: "",
    appVer: "1.0",
    key: "",
    osName: "WEB",
    requestCode: "5PMF",
    userId: "",
    password: ""
  },
  body: {
    Count: "",
    MarketFeedData: [],
    ClientLoginType:0,
    LastRequestTime:`/Date(${today})/`,
    RefreshRate:"H"
  }
};

const LOGIN_PAYLOAD = {
  head: {
    appName: "",
    appVer: "1.0",
    key: "",
    osName: "WEB",
    requestCode: "5PLoginV2",
    userId: "",
    password: ""
  },
  body: {
    Email_id: "",
    Password: "",
    LocalIP: "192.168.1.1",
    PublicIP: "192.168.1.1",
    HDSerailNumber: "",
    MACAddress: "",
    MachineID: "039377",
    VersionNo: "1.7",
    RequestNo: "1",
    My2PIN: "",
    ConnectionType: "1"
  }
};


const ORDER_PLACEMENT_PAYLOAD = {
  head: {
    appName: "",
    appVer: "1.0",
    key: "",
    osName: "WEB",
    requestCode: "",
    userId: "",
    password: ""
  },
  body: {
    ClientCode: "1234567",
    OrderFor: "P",
    Exchange: "B",
    ExchangeType: "C",
    Price: 0.0,
    OrderID: 0,
    OrderType: "BUY",
    Qty: 0,
    OrderDateTime: `/Date(${today})/`,
    ScripCode: "",
    AtMarket: false,
    RemoteOrderID: "1",
    ExchOrderID: 0,
    DisQty: 0,
    IsStopLossOrder: false,
    StopLossPrice: 0,
    IsVTD: false,
    IOCOrder: false,
    IsIntraday: false,
    PublicIP: "192.168.1.1",
    AHPlaced: "N",
    ValidTillDate: `/Date(${followingDay})/`,
    iOrderValidity: 0,
    TradedQty: 0,
    OrderRequesterCode: "",
    AppSource: 0
  }
};

/**
 * Enum for Order validity.
 * @readonly
 * @enum {number}
 */
const OrderValidityEnum = {
  Day: 0,
  GTD: 1,
  GTC: 2,
  IOC: 3,
  EOS: 4,
  FOK: 6
};

module.exports = {
  genericPayload: GENERIC_PAYLOAD,
  loginPayload: LOGIN_PAYLOAD,
  orderPayload: ORDER_PLACEMENT_PAYLOAD,
  marketpayload : MARKET_PAYLOAD,
  OrderValidityEnum: OrderValidityEnum
};
