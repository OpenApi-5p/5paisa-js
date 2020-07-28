"use strict";
const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const { genericPayload, loginPayload, orderPayload } = require("./const");
const { encrypt } = require("./utils");

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";

function FivePaisaClient(conf) {
  // Routes
  const BASE_URL = "https://Openapi.5paisa.com/VendorsAPI/Service1.svc";
  const LOGIN_ROUTE = `${BASE_URL}/V2/LoginRequestMobileNewbyEmail`;
  const MARGIN_ROUTE = `${BASE_URL}/V3/Margin`;
  const ORDER_BOOK_ROUTE = `${BASE_URL}/V2/OrderBook`;
  const HOLDINGS_ROUTE = `${BASE_URL}/V2/Holding`;
  const POSITIONS_ROUTE = `${BASE_URL}/V1/NetPositionNetWise`;
  const ORDER_PLACEMENT_ROUTE = `${BASE_URL}/V1/OrderRequest`;
  const ORDER_STATUS_ROUTE = `${BASE_URL}/OrderStatus`;
  const TRADE_INFO_ROUTE = `${BASE_URL}/TradeInformation`;

  // Request types
  const MARGIN_REQUEST_CODE = `5PMarginV3`;
  const ORDER_BOOK_REQUEST_CODE = `5POrdBkV2`;
  const HOLDINGS_REQUEST_CODE = `5PHoldingV2`;
  const POSITIONS_REQUEST_CODE = `5PNPNWV1`;
  const TRADE_INFO_REQUEST_CODE = `5PTrdInfo`;
  const ORDER_STATUS_REQUEST_CODE = `5POrdStatus`;
  const ORDER_PLACEMENT_REQUEST_CODE = `5POrdReq`;
  const LOGIN_REQUEST_CODE = `5PLoginV2`;
  var CLIENT_CODE = null;
  this.loginPayload = loginPayload;
  this.loginPayload.head.appName = conf.appName;
  this.loginPayload.head.key = conf.userKey;
  this.loginPayload.head.userId = conf.userId;
  this.loginPayload.head.password = conf.password;
  this.genericPayload = genericPayload;
  this.genericPayload.head.appName = conf.appName;
  this.genericPayload.head.key = conf.userKey;
  this.genericPayload.head.userId = conf.userId;
  this.genericPayload.head.password = conf.password;
  this.orderPayload = orderPayload;
  this.orderPayload.head.appName = conf.appName;
  this.orderPayload.head.key = conf.userKey;
  this.orderPayload.head.userId = conf.userId;
  this.orderPayload.head.password = conf.password;
  this.orderPayload.body.AppSource = conf.appSource;
  const defaultOrderParams = {
    exchange: "N",
    exchangeSegment: "C",
    atMarket: true,
    isStopLossOrder: false,
    stopLossPrice: 0,
    isVTD: false,
    isIOCOrder: false,
    isIntraday: false,
    ahPlaced: "N"
  };

  const request_instance = axios.create({
    baseURL: BASE_URL,
    jar: cookieJar,
    withCredentials: true
  });
  request_instance.defaults.headers.common["Content-Type"] = "application/json";

  this.init = function(response) {
    var promise = new Promise(function(resolve, reject) {
      if (response.data.body.ClientCode != "INVALID CODE") {
        console.log(GREEN, "Logged in");
        CLIENT_CODE = response.data.body.ClientCode;
        resolve();
      } else {
        console.log(RED, response.data.body.Message);
        reject(response.data.body.Message);
      }
    });

    return promise;
  };

  this.login = function(email, password, DOB) {
    const encryptionKey = conf.encryptionKey;
    this.loginPayload.head.requestCode = LOGIN_REQUEST_CODE;
    this.loginPayload.body.Email_id = encrypt(encryptionKey, email);
    this.loginPayload.body.Password = encrypt(encryptionKey, password);
    this.loginPayload.body.My2PIN = encrypt(encryptionKey, DOB);
    var req = request_instance.post(LOGIN_ROUTE, loginPayload);
    return req;
  };

  this.getHoldings = function() {
    this.genericPayload.head.requestCode = HOLDINGS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    request_instance
      .post(HOLDINGS_ROUTE, this.genericPayload)
      .then(response => {
        if (response.data.body.Data.length === 0) {
          console.log(RED, response.data.body.Message);
        } else {
          console.log(GREEN, response.data.body.Data);
        }
      });
  };

  this.getOrderBook = function() {
    this.genericPayload.head.requestCode = ORDER_BOOK_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    request_instance
      .post(ORDER_BOOK_ROUTE, this.genericPayload)
      .then(response => {
        if (response.data.body.OrderBookDetail.length === 0) {
          console.log(RED, response.data.body.Message);
        } else {
          console.log(GREEN, response.data.body.OrderBookDetail);
        }
      });
  };

  this.getMargin = function() {
    this.genericPayload.head.requestCode = MARGIN_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    request_instance.post(MARGIN_ROUTE, this.genericPayload).then(response => {
      if (response.data.body.EquityMargin.length === 0) {
        console.log(RED, response.data.body.Message);
      } else {
        console.log(GREEN, response.data.body.EquityMargin);
      }
    });
  };

  this.getPositions = function() {
    this.genericPayload.head.requestCode = POSITIONS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    request_instance
      .post(POSITIONS_ROUTE, this.genericPayload)
      .then(response => {
        if (response.data.body.NetPositionDetail.length === 0) {
          console.log(RED, response.data.body.Message);
        } else {
          console.log(GREEN, response.data.body.NetPositionDetail);
        }
      });
  };

  this._order_request = function(orderType) {
    this.orderPayload.body.OrderFor = orderType;
    this.orderPayload.head.requestCode = ORDER_PLACEMENT_REQUEST_CODE;
    this.orderPayload.body.ClientCode = CLIENT_CODE;
    this.orderPayload.body.OrderRequesterCode = CLIENT_CODE;
    console.log(this.orderPayload);
    request_instance
      .post(ORDER_PLACEMENT_ROUTE, this.orderPayload)
      .then(response => {
        console.log(GREEN, response.data.body);
      });
  };

  this.placeOrder = function(orderType, scripCode, qty, params) {
    if (orderType === undefined) {
      throw new Error(
        `No orderType specified, valid order types are "BUY" and "SELL"`
      );
    } else if (scripCode === undefined) {
      throw new Error(`No scripCode specified`);
    } else if (qty === undefined) {
      throw new Error("No quantity specified");
    }
    params = params || defaultOrderParams;
    this.orderPayload.body.OrderType = orderType;
    this.orderPayload.body.Qty = qty;
    this.orderPayload.body.ScripCode = scripCode;
    this.orderPayload.body.Exchange =
      params.exchange || defaultOrderParams.exchange;
    this.orderPayload.body.ExchangeType =
      params.exchangeSegment || defaultOrderParams.exchangeSegment;
    this.orderPayload.body.AtMarket =
      params.atMarket || defaultOrderParams.atMarket;
    this.orderPayload.body.DisQty = qty;
    this.orderPayload.body.IsStopLossOrder =
      params.isStopLossOrder || defaultOrderParams.isStopLossOrder;
    this.orderPayload.body.StopLossPrice =
      params.stopLossPrice || defaultOrderParams.stopLossPrice;
    this.orderPayload.body.IsVTD = params.isVTD || defaultOrderParams.isVTD;
    this.orderPayload.body.IOCOrder =
      params.isIOCOrder || defaultOrderParams.isIOCOrder;
    this.orderPayload.body.IsIntraday =
      params.isIntraday || defaultOrderParams.isIntraday;
    this.orderPayload.body.AHPlaced =
      params.ahPlaced || defaultOrderParams.ahPlaced;
    this.orderPayload.body.TradedQty = 0;
    this._order_request("P");
  };

  this.modifyOrder = function(exchangeOrderID, tradedQty, scripCode) {
    this.orderPayload.body.ExchOrderID = exchangeOrderID;
    this.orderPayload.body.TradedQty = tradedQty;
    this.orderPayload.body.ScripCode = scripCode;
    this._order_request("M");
  };

  this.cancelOrder = function(exchangeOrderID, tradedQty, scripCode) {
    this.orderPayload.body.ExchOrderID = exchangeOrderID;
    this.orderPayload.body.TradedQty = tradedQty;
    this.orderPayload.body.ScripCode = scripCode;
    this._order_request("C");
  };

  /*
  Expects a order:ist
  [{
        "Exch": "N",
        "ExchType": "C",
        "ScripCode": 11536,
        "RemoteOrderID": "5712977609111312242"
      }
  ]
  */

  this.getOrderStatus = function(orderList) {
    this.genericPayload.head.requestCode = ORDER_STATUS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    this.genericPayload.body.OrdStatusReqList = orderList;
    request_instance
      .post(ORDER_STATUS_ROUTE, this.genericPayload)
      .then(response => {
        if (response.data.body.OrdStatusResLst.length === 0) {
          console.log(RED, "No info found");
        } else {
          console.log(GREEN, response.data.body.OrdStatusReqList);
        }
      });
  };
  /*
  Expects a tradeDetailList
  [{
        "Exch": "N",
        "ExchType": "C",
        "ScripCode": 11536,
        "RemoteOrderID": "5712977609111312242"
      }
  ]
  */
  this.getTradeInfo = function(tradeDetailList) {
    this.genericPayload.head.requestCode = TRADE_INFO_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    this.genericPayload.body.TradeDetailList = tradeDetailList;
    request_instance
      .post(TRADE_INFO_ROUTE, this.genericPayload)
      .then(response => {
        if (response.data.body.TradeDetail.length === 0) {
          console.log(RED, "No info found");
        } else {
          console.log(GREEN, response.data.body.TradeDetail);
        }
      });
  };
}

module.exports = FivePaisaClient;
