"use strict";
const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const {
  genericPayload,
  loginPayload,
  orderPayload,
  OrderValidityEnum
} = require("./const");
const { encrypt } = require("./utils");

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";

/**
 * Initializes a new client object with the app keys.
 * This client object can be further used to login multiple clients.
 * @class
 * @param {Object} conf - The conf object containing the app's API keys.
 * @example <caption>Initialize FivePaisaClient object</caption>
 * const FivePaisaClient = require("5paisajs")
 * const conf = {
   "appSource": "",
   "appName": "",
   "userId": "",
   "password": "",
   "userKey": "",
   "encryptionKey": ""
 * var client  = FivePaisaClient(conf)

 */
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
    ahPlaced: "N",
    IOCOrder: false,
    orderValidity: OrderValidityEnum.Day
  };

  // Request instance to be used throughout, with cookie support.
  const request_instance = axios.create({
    baseURL: BASE_URL,
    jar: cookieJar,
    withCredentials: true
  });
  request_instance.defaults.headers.common["Content-Type"] = "application/json";

  /**
   * Handles the response from the login method and returns a promise.
   * @method init
   * @memberOf FivePaisaClient
   * @param {Object} response
   */
  this.init = function (response) {
    var promise = new Promise(function (resolve, reject) {
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

  /**
   * Logs in the client.
   * @method login
   * @memberOf FivePaisaClient
   * @param {string} email - Client's email
   * @param {string} password - Client's password
   * @param {string} DOB - Client's DOB in YYYYMMDD format
   * @example <caption> Logging in a user </caption>
   * const conf = {
   * "appSource": "",
   * "appName": "",
   * "userId": "",
   * "password": "",
   * "userKey": "",
   * "encryptionKey": ""
   * }

   * const { FivePaisaClient} = require("5paisajs")
   *
   * var client = new FivePaisaClient(conf)
   *
   * // This client object can be used to login multiple users.
   * client.login("random_email@xyz.com", "password", "YYYYMMDD").then((response) => {
   *     client.init(response).then(() => {
   *         // Fetch holdings, positions or place orders here.
   *         // See following examples.
   *     })
   * }).catch((err) =>{
   *     // Oh no :/
   *     console.log(err)
   * })

   */
  this.login = function (email, password, DOB) {
    const encryptionKey = conf.encryptionKey;
    this.loginPayload.head.requestCode = LOGIN_REQUEST_CODE;
    this.loginPayload.body.Email_id = encrypt(encryptionKey, email);
    this.loginPayload.body.Password = encrypt(encryptionKey, password);
    this.loginPayload.body.My2PIN = encrypt(encryptionKey, DOB);
    var req = request_instance.post(LOGIN_ROUTE, loginPayload);
    return req;
  };

  /**
   * Fetches holdings for the client.
   * @method getHoldings
   * @memberOf FivePaisaClient
   * @returns {Array} Array containing holdings
   * @example <caption>Fetching holdings</caption>
   * client.getHoldings().then((holdings) => {
   *    console.log(holdings)
   *  }).catch((err) => {
   *    console.log(err)
   *  });
   */
  this.getHoldings = function () {
    this.genericPayload.head.requestCode = HOLDINGS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    var payload = this.genericPayload;
    var promise = new Promise(function (resolve, reject) {
      request_instance.post(HOLDINGS_ROUTE, payload).then(response => {
        if (response.data.body.Data.length === 0) {
          reject(response.data.body.Message);
        } else {
          resolve(response.data.body.Data);
        }
      });
    });
    return promise;
  };

  /**
   * Fetches orders for the client.
   * @method getOrderBook
   * @memberOf FivePaisaClient
   * @returns {Array} Array containing orders
   * @example <caption>Fetching orders</caption>
   * client.getOrderBook().then((orders) => {
   *    console.log(orders)
   *  }).catch((err) => {
   *    console.log(err)
   *  });
   */
  this.getOrderBook = function () {
    this.genericPayload.head.requestCode = ORDER_BOOK_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    var payload = this.genericPayload;
    var promise = new Promise(function (resolve, reject) {
      request_instance.post(ORDER_BOOK_ROUTE, payload).then(response => {
        if (response.data.body.OrderBookDetail.length === 0) {
          reject(response.data.body.Message);
        } else {
          resolve(response.data.body.OrderBookDetail);
        }
      });
    });
    return promise;
  };

  /**
   * Fetches margin details for the client.
   * @method getMargin
   * @memberOf FivePaisaClient
   * @returns {Array} Array containing margin details
   * @example <caption>Fetching margin details</caption>
   * client.getMargin().then((marginDetails) => {
   *    console.log(marginDetails)
   *  }).catch((err) => {
   *    console.log(err)
   *  });
   */
  this.getMargin = function () {
    this.genericPayload.head.requestCode = MARGIN_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    var payload = this.genericPayload;
    var promise = new Promise(function (resolve, reject) {
      request_instance.post(MARGIN_ROUTE, payload).then(response => {
        if (response.data.body.EquityMargin.length === 0) {
          reject(response.data.body.Message);
        } else {
          resolve(response.data.body.EquityMargin);
        }
      });
    });
    return promise;
  };

  /**
   * Fetches position details for the client.
   * @method getPositions
   * @memberOf FivePaisaClient
   * @returns {Array} Array containing position details
   * @example <caption>Fetching margins</caption>
   * client.getPositions().then((positionDetails) => {
   *    console.log(positionDetails)
   *  }).catch((err) => {
   *    console.log(err)
   *  });
   */
  this.getPositions = function () {
    this.genericPayload.head.requestCode = POSITIONS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    var payload = this.genericPayload;
    var promise = new Promise(function (resolve, reject) {
      request_instance.post(POSITIONS_ROUTE, payload).then(response => {
        if (response.data.body.NetPositionDetail.length === 0) {
          reject(response.data.body.Message);
        } else {
          resolve(response.data.body.NetPositionDetail);
        }
      });
    });
    return promise;
  };

  this._order_request = function (orderType) {
    this.orderPayload.body.OrderFor = orderType;
    this.orderPayload.head.requestCode = ORDER_PLACEMENT_REQUEST_CODE;
    this.orderPayload.body.ClientCode = CLIENT_CODE;
    this.orderPayload.body.OrderRequesterCode = CLIENT_CODE;
    var payload = this.orderPayload;
    var promise = new Promise(function (resolve, reject) {
      request_instance
        .post(ORDER_PLACEMENT_ROUTE, payload)
        .then(response => {
          resolve(response.data.body);
        })
        .catch(err => {
          reject(err);
        });
    });
    return promise;
  };

  /**
   * Parameter object containing options to place complex orders.
   * @typedef {Object} OrderRequestParams
   * @property {string} [exchangeSegment=C] - Exchange Segment. "C"- Cash, "D"- Derivative, "U" - Currency
   * @property {boolean} [atMarket=true] - true - For market order, false - For limit order
   * @property {boolean} [isStopLossOrder=false] - true - For stoploss order, false - For regular order
   * @property {float} [stopLossPrice=0] - This will be the trigger price. This will be set when user want to place stop loss order. (For Buy Stop loss, Trigger price should not be greater than Limit Price.
   *                                 And for Sell Stop Loss Order Trigger Price should not be less than Limit Price)
   * @property {boolean} [isVTD=false] -
   * @property {boolean} [isIOCOrder=false] - Send true in case order is IOC.
   * @property {boolean} [isIntraday=false] - true - For intraday order, false - for delivery order.
   * @property {boolean} [ahPlaced=N] - "Y -in case order placed after market closed. N-Normal Market time Order
   * @property {boolean} [DisQty] - Quantity exposed in the exchange. Disclosed quantity is never larger than order quantity.
   * @property {boolean} [IOCOrder=false] - true - For IOC order, false - For regular order.
   * @property {OrderValidityEnum} [iOrderValidity] - true - Order validity.
   *
   */

  /**
   * @typedef {Object} OrderResponse
   * @property {number} BrokerOrderID - Order ID
   * @property {string} ClientCode - ClientCode
   * @property {string} Exch - Exchange. "B" - BSE, "N" - NSE.
   * @property {string} ExchOrderID - Order ID generated by the exchange.
   * @property {string} ExchType - Exchange Segment. "C"- Cash, "D"- Derivative, "U" - Currency
   * @property {number} LocalOrderID - 0
   * @property {string} Message -
   * @property {number} RMSResponseCode -
   * @property {number} ScripCode -
   * @property {number} Status -
   * @property {string} Time - /Date(1599417000000+0530)/
   *
   */

  /**
   * Places a fresh order
   * @method placeOrder
   * @memberOf FivePaisaClient
   * @returns {OrderResponse}
   * @param {string} orderType - "BUY" - Buy, "SELL" - Sell
   * @param {string} scripCode - Scrip code of the scrip.
   * @param {number} qty - Quantity of the scrip to be traded.
   * @param {string} exchange - Exchange name. "N" - NSE, "B" - BSE
   * @param {OrderRequestParams} [params] - Parameters for placing complex orders
   */
  this.placeOrder = function (orderType, scripCode, qty, exchange, params) {
    if (orderType === undefined) {
      throw new Error(
        `No orderType specified, valid order types are "BUY" and "SELL"`
      );
    }
    if (scripCode === undefined) {
      throw new Error(`No scripCode specified`);
    }
    if (qty === undefined) {
      throw new Error("No quantity specified");
    }
    if (exchange == undefined) {
      throw new Error(
        `No exchange specified, valid exchange types are "NSE" and "BSE"`
      );
    }
    params = params || defaultOrderParams;
    this.orderPayload.body.OrderType = orderType;
    this.orderPayload.body.Qty = qty;
    this.orderPayload.body.ScripCode = scripCode;
    this.orderPayload.body.Exchange = exchange || defaultOrderParams.exchange;
    this.orderPayload.body.ExchangeType =
      params.exchangeSegment || defaultOrderParams.exchangeSegment;
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
    if (this.orderPayload.body.AHPlaced === "Y") {
      this.orderPayload.body.AtMarket = false;
    } else {
      this.orderPayload.body.AtMarket =
        params.atMarket || defaultOrderParams.atMarket;
    }
    this.orderPayload.body.TradedQty = 0;
    this.orderPayload.body.DisQty = params.DisQty || qty;
    this.orderPayload.body.IOCOrder =
      params.IOCOrder || defaultOrderParams.IOCOrder;
    this.orderPayload.iOrderValidity =
      params.iOrderValidity || defaultOrderParams.orderValidity;
    return this._order_request("P");
  };

  /**
   * Modifies an order
   * @method modifyOrder
   * @memberOf FivePaisaClient
   * @returns {Object}
   * @param {string} exchangeOrderID - Exchange order ID received from exchange.
   * @param {number} tradedQty - The traded quantity for the scrip. Incorrect value would lead to order rejection.
   * @param {number} scripCode - Scrip code of the scrip.
   */
  this.modifyOrder = function (exchangeOrderID, tradedQty, scripCode) {
    this.orderPayload.body.ExchOrderID = exchangeOrderID;
    this.orderPayload.body.TradedQty = tradedQty;
    this.orderPayload.body.ScripCode = scripCode;
    return this._order_request("M");
  };

  /**
   * Cancels an order
   * @method cancelOrder
   * @memberOf FivePaisaClient
   * @returns {Object}
   * @param {string} exchangeOrderID - Exchange order ID received from exchange.
   * @param {number} tradedQty - The traded quantity for the scrip. Incorrect value would lead to order rejection.
   * @param {number} scripCode - Scrip code of the scrip.
   */
  this.cancelOrder = function (exchangeOrderID, tradedQty, scripCode) {
    this.orderPayload.body.ExchOrderID = exchangeOrderID;
    this.orderPayload.body.TradedQty = tradedQty;
    this.orderPayload.body.ScripCode = scripCode;
    return this._order_request("C");
  };

  /**
   * Gets the order status of the orders provided
   * @method getOrderStatus
   * @memberOf FivePaisaClient
   * @returns {Object}
   * @param {Array} orderList - Array containing order details.
   * [
   *  {
   *      "Exch":"N",
   *      "ExchType":"C",
   *      "ScripCode":11111,
   *      "RemoteOrderID":"5712977609111312242"
   *  }
   * ]
   */
  this.getOrderStatus = function (orderList) {
    this.genericPayload.head.requestCode = ORDER_STATUS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    this.genericPayload.body.OrdStatusReqList = orderList;
    var payload = this.genericPayload;
    var promise = new Promise(function (resolve, reject) {
      request_instance.post(ORDER_STATUS_ROUTE, payload).then(response => {
        if (response.data.body.OrdStatusResLst.length === 0) {
          reject({ err: "No info found" });
        } else {
          resolve(response.data.body.OrdStatusReqList);
        }
      });
    });
    return promise;
  };

  /**
   * Gets the trade information for a set of trades provided
   * @method getTradeInfo
   * @memberOf FivePaisaClient
   * @returns {Object}
   * @param {Array} tradeDetailList - Array containing trades
   * [
   *  {
   *      "Exch":"N",
   *      "ExchType":"C",
   *      "ScripCode":11111,
   *      "RemoteOrderID":"5712977609111312242"
   *  }
   * ]
   */
  this.getTradeInfo = function (tradeDetailList) {
    this.genericPayload.head.requestCode = TRADE_INFO_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    this.genericPayload.body.TradeDetailList = tradeDetailList;
    var payload = this.genericPayload;
    var promise = new Promise(function (resolve, reject) {
      request_instance.post(TRADE_INFO_ROUTE, payload).then(response => {
        if (response.data.body.TradeDetail.length === 0) {
          reject({ err: "No info found" });
        } else {
          resolve(response.data.body.TradeDetail);
        }
      });
    });
    return promise;
  };
}

module.exports = {
  FivePaisaClient: FivePaisaClient,
  OrderValidityEnum: OrderValidityEnum
};
