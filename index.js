'use strict';
const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const request = require('request');
const pd = require('node-pandas');

const {
  genericPayload,
  loginPayload,
  orderPayload,
  marketpayload,
  OrderValidityEnum,
  totpPayload,
  accessTokenPayload,
  marketscripPayload
} = require('./const');
const {AES128Encrypt, AES256Encrypt} = require('./utils');

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';

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
  const BASE_URL = 'https://Openapi.5paisa.com/VendorsAPI/Service1.svc';
  const MARGIN_ROUTE = `${BASE_URL}/V4/Margin`;
  const ORDER_BOOK_ROUTE = `${BASE_URL}/V2/OrderBook`;
  const HOLDINGS_ROUTE = `${BASE_URL}/V3/Holding`;
  const POSITIONS_ROUTE = `${BASE_URL}/V1/NetPositionNetWise`;
  const ORDER_PLACEMENT_ROUTE = `${BASE_URL}/V1/PlaceOrderRequest`;
  const ORDER_MODIFY_ROUTE = `${BASE_URL}/V1/ModifyOrderRequest`;
  const ORDER_CANCEL_ROUTE = `${BASE_URL}/V1/CancelOrderRequest`;
  const ORDER_STATUS_ROUTE = `${BASE_URL}/V2/OrderStatus`;
  const TRADE_INFO_ROUTE = `${BASE_URL}/V1/TradeInformation`;
  const BO_CO_ROUTE = `${BASE_URL}/SMOOrderRequest`;
  const BO_MOD_ROUTE = `${BASE_URL}/ModifySMOOrder`;
  const WEBSOCKET_ROUTE = `https://openfeed.5paisa.com/Feeds/api/UserActivity/LoginCheck`;
  const Market_ROUTE = `${BASE_URL}/MarketFeed`;
  const MARKET_SCRIP_ROUTE = `${BASE_URL}/V1/MarketFeed`;
  const MARKET_DEPTH_ROUTE = `${BASE_URL}/MarketDepth`;
  const IDEAS_ROUTE = `${BASE_URL}/TraderIDEAs`;
  const TOTP_ROUTE = `${BASE_URL}/TOTPLogin`;
  const ACCESS_TOKEN_ROUTE = `${BASE_URL}/GetAccessToken`;
  const TRADEBOOK_ROUTE = `${BASE_URL}/V1/TradeBook`;
  // Request types
  const MARGIN_REQUEST_CODE = `5PMarginV3`;
  const ORDER_BOOK_REQUEST_CODE = `5POrdBkV2`;
  const HOLDINGS_REQUEST_CODE = `5PHoldingV2`;
  const POSITIONS_REQUEST_CODE = `5PNPNWV1`;
  const TRADE_INFO_REQUEST_CODE = `5PTrdInfo`;
  const ORDER_STATUS_REQUEST_CODE = `5POrdStatus`;
  const ORDER_PLACEMENT_REQUEST_CODE = `5PPlaceOrdReq`;
  const ORDER_MODIFY_REQUEST_CODE = `5PModifyOrdReq`;
  const ORDER_CANCEL_REQUEST_CODE = `5PCancelOrdReq`;
  const LOGIN_REQUEST_CODE = `5PLoginV4`;
  const BO_CO_REQUEST_CODE = '5PSMOOrd';
  const MOD_BO_REQUEST_CODE = '5PSModMOOrd';
  const MARKET_DEPTH_REQUEST_CODE = '5PMD';
  const IDEAS_REQUEST_CODE = '5PTraderIDEAs';
  const TRADEBOOK_REQUEST_CODE = '5PTrdBkV1';

  // client code 
  let CLIENT_CODE = conf.clientCode ? conf.clientCode : null;

  // login api payload
  this.loginPayload = loginPayload;
  this.loginPayload.head.appName = conf.appName;
  this.loginPayload.head.key = conf.userKey;
  this.loginPayload.head.userId = conf.userId;
  this.loginPayload.head.password = conf.password;

  // generic payload
  this.genericPayload = genericPayload;
  this.genericPayload.head.appName = conf.appName;
  this.genericPayload.head.key = conf.userKey;
  this.genericPayload.head.userId = conf.userId;
  this.genericPayload.head.password = conf.password;

  // order placement api payload
  this.orderPayload = orderPayload;
  this.orderPayload.head.appName = conf.appName;
  this.orderPayload.head.key = conf.userKey;
  this.orderPayload.head.userId = conf.userId;
  this.orderPayload.head.password = conf.password;
  this.orderPayload.body.AppSource = conf.appSource;

  // market payload
  this.marketpayload = marketpayload;
  this.marketpayload.head.appName = conf.appName;
  this.marketpayload.head.key = conf.userKey;
  this.marketpayload.head.userId = conf.userId;
  this.marketpayload.head.password = conf.password;
  
  // market scrip payload
  this.marketscripPayload = marketscripPayload;
  this.marketscripPayload.head.key = conf.userKey;

  // totp payload
  this.totpPayload = totpPayload;
  this.totpPayload.head.Key = conf.userKey;

  // access token payload
  this.accessTokenPayload = accessTokenPayload;
  this.accessTokenPayload.head.Key = conf.userKey;
  this.accessTokenPayload.body.EncryKey = conf.encryptionKey;
  this.accessTokenPayload.body.UserId = conf.userId;


  let jwttoken = '';

  const defaultOrderParams = {
    exchangeSegment: 'C',
    isStopLossOrder: false,
    stopLossPrice: 0,
    isIOCOrder: false,
    isIntraday: false,
    ahPlaced: 'N',
    IOCOrder: false,
    price: 0,
    scripCode: '',
    scripData: '',
  };
  const defaultbocoParams = {
    TrailingSL: 0,
    StopLoss: 0,
    LocalOrderIDNormal: 0,
    LocalOrderIDSL: 0,
    LocalOrderIDLimit: 0,
    public_ip: '192.168.1.1',
    traded_qty: 0,
    order_for: 'S',
    DisQty: 0,
    ExchOrderId: '0',
    AtMarket: false,
    UniqueOrderIDNormal: '',
    UniqueOrderIDSL: '',
    UniqueOrderIDLimit: '',
  };

  // Request instance to be used throughout, with cookie support.
  const request_instance = axios.create({
    baseURL: BASE_URL,
    jar: cookieJar,
    withCredentials: true,
  });
  request_instance.defaults.headers.common['Content-Type'] = 'application/json';
  request_instance.defaults.headers.common['5Paisa-API-Uid'] = 'ka7SFqAU6SC';

  /**
   * Handles the response from the login method and returns a promise.
   * @method init
   * @memberOf FivePaisaClient
   * @param {Object} response
   */
  this.init = function(response) {
    const promise = new Promise(function(resolve, reject) {
      if (response.data.body.Message == '') {
        console.log(GREEN, `Logged in`);
        CLIENT_CODE = response.data.body.ClientCode;
        resolve();
      } else {
        console.log(RED, response.data.body.Message);
        reject(response.data.body.Message);
      }
    });
    jwttoken = response.data.body.JWTToken;

    return promise;
  };

  this.get_access_token = function(requesttoken) {
    try {
      this.accessTokenPayload.body.RequestToken = requesttoken;

      const promise = new Promise(function(resolve, reject) {
        request_instance
            .post(ACCESS_TOKEN_ROUTE, accessTokenPayload)
            .then((response) => {
              if (CLIENT_CODE === null) {
                CLIENT_CODE = response.data.body.ClientCode;
              }

              if (
                !response?.data?.body?.AccessToken ||
              response.data.body.AccessToken === null ||
              response.data.body.AccessToken === ''
              ) {
                reject(response.data.body.AccessToken);
              } else {
                jwttoken = response.data.body.AccessToken;
                resolve(response.data.body.AccessToken);
              }
            }).catch((err) => console.log(err));
      });

      return promise;
    } catch (err) {
      console.error(err);
    }
  };

  this.set_access_token = function(accessToken){
    try {
      const promise = new Promise(function(resolve, reject) {
        if (accessToken === null || accessToken === '') {
          console.log("Please pass access token");
          reject(accessToken);
        } else {
          jwttoken = accessToken;
          resolve(jwttoken);
        }
      })
      return promise;
    } catch (err) {
      console.error(err);
    }
  }

  // generate access token from OAuth
  this.get_oauth_session = function(requesttoken) {
    try {
      const promise = new Promise((resolve, reject) => {
        this.get_access_token(requesttoken)
        .then((res)=>{
          console.log("Logged in!!");
          resolve(res);
        }).catch((err) => reject(err))
      })
      return promise;
    } catch (err) {
      console.error(err);
    }
  };


  this.get_request_token = function(clientCode, totp, pin) {
    if(!CLIENT_CODE){
      CLIENT_CODE = clientCode;
    }
    this.totpPayload.body.Email_ID = CLIENT_CODE;
    this.totpPayload.body.TOTP = totp;
    this.totpPayload.body.PIN = pin;
    try {
      const promise = new Promise(function(resolve, reject) {
        request_instance.post(TOTP_ROUTE, totpPayload).then((response) => {
          if (response.data.body.RequestToken === null) {
            reject(response.data.body.RequestToken);
          } else {
            resolve(response.data.body.RequestToken);
          }
        });
      });

      return promise;
    } catch (err) {
      console.error(err);
    }
  };

  this.get_TOTP_Session = function(clientCode, totp, pin) {
    try {
      const promise = new Promise((resolve, reject) => {
        this.get_request_token(clientCode, totp, pin)
            .then((response) => {
              this.get_access_token(response)
                  .then((res) => {
                    if (res === null || res === '') {
                      reject(res);
                    } else {
                      resolve(res);
                    }
                  })
                  .catch((err2) => reject(err2));
            })
            .catch((err) => reject(err));
      });

      return promise;
    } catch (err) {
      console.error(err);
    }
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

  this.getHoldings = function() {
    this.genericPayload.head.requestCode = HOLDINGS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    const payload = this.genericPayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };

    const promise = new Promise(function(resolve, reject) {
      try {
        request_instance
            .post(HOLDINGS_ROUTE, payload, {headers: headers})
            .then((response) => {
              if (response.data.body.Data.length === 0) {
                reject(response.data.body.Message);
              } else {
                resolve(response.data.body.Data);
              }
            });
      } catch (err) {
        console.error(err);
      }
      });

    return promise;
  };

  /**
   * Fetches orders for the client.
   * @method getOrderBook
   * @memberOf FivePaisaClient
   * @return {Array} Array containing orders
   * @example <caption>Fetching orders</caption>
   * client.getOrderBook().then((orders) => {
   *    console.log(orders)
   *  }).catch((err) => {
   *    console.log(err)
   *  });
   */
  this.getOrderBook = function() {
    this.genericPayload.head.requestCode = ORDER_BOOK_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    const payload = this.genericPayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };
    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(ORDER_BOOK_ROUTE, payload, {headers: headers})
          .then((response) => {
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
   * @return {Array} Array containing margin details
   * @example <caption>Fetching margin details</caption>
   * client.getMargin().then((marginDetails) => {
   *    console.log(marginDetails)
   *  }).catch((err) => {
   *    console.log(err)
   *  });
   */
  this.getMargin = function() {
    this.genericPayload.head.requestCode = MARGIN_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    const payload = this.genericPayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };
    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(MARGIN_ROUTE, payload, {headers: headers})
          .then((response) => {
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
   * @return {Array} Array containing position details
   * @example <caption>Fetching margins</caption>
   * client.getPositions().then((positionDetails) => {
   *    console.log(positionDetails)
   *  }).catch((err) => {
   *    console.log(err)
   *  });
   */
  this.getPositions = function() {
    this.genericPayload.head.requestCode = POSITIONS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    const payload = this.genericPayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };
    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(POSITIONS_ROUTE, payload, {headers: headers})
          .then((response) => {
            if (response.data.body.NetPositionDetail.length === 0) {
              reject(response.data.body.Message);
            } else {
              resolve(response.data.body.NetPositionDetail);
            }
          });
    });

    return promise;
  };

  this._order_request = function(orderType) {
    let requrl = '';
    let payload;

    if (orderType === 'P') {
      this.orderPayload.head.requestCode = ORDER_PLACEMENT_REQUEST_CODE;
      requrl = ORDER_PLACEMENT_ROUTE;
      this.orderPayload.body.ClientCode = CLIENT_CODE;
      payload = this.orderPayload;
    } else if (orderType === 'M') {
      this.orderPayload.head.requestCode = ORDER_MODIFY_REQUEST_CODE;
      requrl = ORDER_MODIFY_ROUTE;
      this.orderPayload.body.ClientCode = CLIENT_CODE;
      payload = this.orderPayload;
    } else if (orderType === 'C') {
      this.genericPayload.head.requestCode = ORDER_CANCEL_REQUEST_CODE;
      requrl = ORDER_CANCEL_ROUTE;
      payload = this.genericPayload;
    } else {
      throw new Error('No Such orderType specified');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };

    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(requrl, payload, {
            headers: headers,
          })
          .then((response) => {
            resolve(response.data.body);
          })
          .catch((err) => {
            reject(err);
          });
    });

    return promise;
  };

  /**
   * Parameter object containing options to place complex orders.
   * @typedef {Object} OrderRequestParams
   * @property {float} [price=0] - Rate at which you want to Buy / Sell the stock. (price=0 for at market order)
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
   * @return {OrderResponse}
   * @param {string} orderType - "BUY" - Buy, "SELL" - Sell
   * @param {number} qty - Quantity of the scrip to be traded.
   * @param {string} exchange - Exchange name. "N" - NSE, "B" - BSE
   * @param {OrderRequestParams} [params] - Parameters for placing complex orders
   */
  this.placeOrder = function(orderType, qty, exchange, params) {
    if (orderType === undefined) {
      throw new Error(
          `No orderType specified, valid order types are "BUY" and "SELL"`,
      );
    }

    if (qty === undefined) {
      throw new Error('No quantity specified');
    }

    if (exchange == undefined) {
      throw new Error(
          `No exchange specified, valid exchange types are "NSE" and "BSE"`,
      );
    }

    params = params || defaultOrderParams;
    if (params.IsGTCOrder !== undefined) {
      this.orderPayload.body.IsGTCOrder = params.IsGTCOrder;
    }

    if (params.IsEOSOrder !== undefined) {
      this.orderPayload.body.IsEOSOrder = params.IsEOSOrder;
    }

    this.orderPayload.body.OrderType = orderType;
    this.orderPayload.body.Qty = qty;
    if (params.scripCode === undefined) {
      this.orderPayload.body.ScripData = params.scripData;
    } else {
      this.orderPayload.body.ScripCode = params.scripCode;
    }

    this.orderPayload.body.Price = params.price || defaultOrderParams.price;
    this.orderPayload.body.Exchange = exchange || defaultOrderParams.exchange;
    this.orderPayload.body.ExchangeType =
      params.exchangeSegment || defaultOrderParams.exchangeSegment;
    this.orderPayload.body.DisQty = qty;
    this.orderPayload.body.IsStopLossOrder =
      params.isStopLossOrder || defaultOrderParams.isStopLossOrder;
    this.orderPayload.body.StopLossPrice =
      params.stopLossPrice || defaultOrderParams.stopLossPrice;
    this.orderPayload.body.IsIOCOrder =
      params.isIOCOrder || defaultOrderParams.isIOCOrder;
    this.orderPayload.body.IsIntraday =
      params.isIntraday || defaultOrderParams.isIntraday;
    this.orderPayload.body.IsAHOrder =
      params.ahPlaced || defaultOrderParams.ahPlaced;
    this.orderPayload.body.DisQty = params.DisQty || qty;

    return this._order_request('P');
  };

  this.bocoorder = function(
      scrip_code,
      Qty,
      LimitPriceInitialOrder,
      TriggerPriceInitialOrder,
      LimitPriceProfitOrder,
      BuySell,
      Exch,
      ExchType,
      RequestType,
      TriggerPriceForSL,
      params,
  ) {
    params = params || defaultbocoParams;
    this.genericPayload.body.ScripCode = scrip_code;
    this.genericPayload.body.Qty = Qty;
    this.genericPayload.body.LimitPriceInitialOrder = LimitPriceInitialOrder;
    this.genericPayload.body.TriggerPriceInitialOrder = TriggerPriceInitialOrder;
    this.genericPayload.body.LimitPriceProfitOrder = LimitPriceProfitOrder;
    this.genericPayload.body.BuySell = BuySell;
    this.genericPayload.body.Exch = Exch;
    this.genericPayload.body.ExchType = ExchType;
    this.genericPayload.body.RequestType = RequestType;
    this.genericPayload.body.TriggerPriceForSL = TriggerPriceForSL;
    this.genericPayload.body.TrailingSL =
      params.TrailingSL || defaultbocoParams.TrailingSL;
    this.genericPayload.body.StopLoss =
      params.StopLoss || defaultbocoParams.StopLoss;
    this.genericPayload.body.LocalOrderIDNormal =
      params.LocalOrderIDNormal || defaultbocoParams.LocalOrderIDNormal;
    this.genericPayload.body.LocalOrderIDSL =
      params.LocalOrderIDSL || defaultbocoParams.LocalOrderIDSL;
    this.genericPayload.body.LocalOrderIDLimit =
      params.LocalOrderIDLimit || defaultbocoParams.LocalOrderIDLimit;
    this.genericPayload.body.PublicIp =
      params.public_ip || defaultbocoParams.public_ip;
    this.genericPayload.body.TradedQty =
      params.traded_qty || defaultbocoParams.traded_qty;
    if (LimitPriceProfitOrder === 0) {
      this.genericPayload.body.OrderFor = 'C';
    } else {
      this.genericPayload.body.OrderFor =
        params.order_for || defaultbocoParams.order_for;
    }

    this.genericPayload.body.DisQty = params.DisQty || defaultbocoParams.DisQty;
    this.genericPayload.body.ExchOrderId =
      params.ExchOrderId || defaultbocoParams.ExchOrderId;
    this.genericPayload.body.AtMarket =
      params.AtMarket || defaultbocoParams.AtMarket;
    this.genericPayload.body.UniqueOrderIDNormal =
      params.UniqueOrderIDNormal || defaultbocoParams.UniqueOrderIDNormal;
    this.genericPayload.body.UniqueOrderIDSL =
      params.UniqueOrderIDSL || defaultbocoParams.UniqueOrderIDSL;
    this.genericPayload.body.UniqueOrderIDLimit =
      params.UniqueOrderIDLimit || defaultbocoParams.UniqueOrderIDLimit;
    this.genericPayload.body.AppSource = conf.appSource;
    this.genericPayload.body.OrderRequesterCode = CLIENT_CODE;
    this.genericPayload.head.requestCode = BO_CO_REQUEST_CODE;

    this.genericPayload.body.ClientCode = CLIENT_CODE;

    const payload = this.genericPayload;

    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(BO_CO_ROUTE, payload)
          .then((response) => {
            resolve(response.data.body);
          })
          .catch((err) => {
            reject(err);
          });
    });

    return promise;
  };

  this.Mod_bo_order = function(
      orderType,
      scripCode,
      qty,
      exchange,
      exchangeOrderID,
      params,
  ) {
    params = params || defaultOrderParams;
    this.orderPayload.body.ExchOrderID = exchangeOrderID;
    this.orderPayload.body.OrderType = orderType;
    this.orderPayload.body.Qty = qty;
    this.orderPayload.body.ScripCode = scripCode;
    this.orderPayload.body.Price = params.price || defaultOrderParams.price;
    this.orderPayload.body.Exchange = exchange || defaultOrderParams.exchange;
    this.orderPayload.body.ExchangeType =
      params.exchangeSegment || defaultOrderParams.exchangeSegment;
    this.orderPayload.body.DisQty = qty;
    this.orderPayload.body.IsStopLossOrder =
      params.isStopLossOrder || defaultOrderParams.isStopLossOrder;
    this.orderPayload.body.TriggerPriceForSL =
      params.stopLossPrice || defaultOrderParams.stopLossPrice;
    this.orderPayload.body.IsVTD = params.isVTD || defaultOrderParams.isVTD;
    this.orderPayload.body.IOCOrder =
      params.isIOCOrder || defaultOrderParams.isIOCOrder;
    this.orderPayload.body.IsIntraday =
      params.isIntraday || defaultOrderParams.isIntraday;
    this.orderPayload.body.AHPlaced =
      params.ahPlaced || defaultOrderParams.ahPlaced;
    if (this.orderPayload.body.AHPlaced === 'Y') {
      this.orderPayload.body.AtMarket = false;
    } else {
      this.orderPayload.body.AtMarket =
        params.atMarket || defaultOrderParams.atMarket;
    }

    this.orderPayload.body.TradedQty = 0;
    this.orderPayload.body.LegType = 0;
    this.orderPayload.body.TMOPartnerOrderID = 0;
    this.orderPayload.body.DisQty = params.DisQty || qty;
    this.orderPayload.body.IOCOrder =
      params.IOCOrder || defaultOrderParams.IOCOrder;
    this.orderPayload.iOrderValidity =
      params.orderValidity || defaultOrderParams.orderValidity;
    this.orderPayload.head.requestCode = MOD_BO_REQUEST_CODE;
    this.orderPayload.body.ClientCode = CLIENT_CODE;
    this.orderPayload.body.OrderRequesterCode = CLIENT_CODE;
    this.orderPayload.body.OrderFor = 'M';

    const payload = this.orderPayload;

    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(BO_MOD_ROUTE, payload)
          .then((response) => {
            resolve(response.data.body);
          })
          .catch((err) => {
            reject(err);
          });
    });

    return promise;
  };

  /**
   * Modifies an order
   * @method modifyOrder
   * @memberOf FivePaisaClient
   * @returns {Object}
   * @param {string} exchangeOrderID - Exchange order ID received from exchange.
   * @param {number} Qty - Qty that you want to buy.
   * @param {boolean} is_intraday- true if you want to do intraday else false.
   * @param {string} exchange - Exchange
   * @param {string} exchange_type - exchange type you want to trade.
   * @param {object} [params] - Parameters for placing complex orders
   */
  
  this.modifyOrder = function(
      modify_params
  ) {
    this.orderPayload.body.ExchOrderID = modify_params.exchangeOrderID;
    this.orderPayload.body.Qty = modify_params.Qty;
    this.orderPayload.body.Price = modify_params.Price;
    
    this.orderPayload.body.IsIntraday = modify_params.is_intraday;
    this.orderPayload.body.Exchange = modify_params.exchange;
    this.orderPayload.body.ExchangeType = modify_params.exchange_type;

    return this._order_request('M');
  };

  /**
   * Cancels an order
   * @method cancelOrder
   * @memberOf FivePaisaClient
   * @return {Object}
   * @param {string} exchangeOrderID - Exchange order ID received from exchange.
   * @param {string} exchange - Exchange
   * @param {string} exchange_type - exchange type you want to trade.
   */
  this.cancelOrder = function(exchangeOrderID) {
    this.genericPayload.body.ExchOrderID = exchangeOrderID;

    return this._order_request('C');
  };
  

  /**
   * Gets the order status of the orders provided
   * @method getOrderStatus
   * @memberOf FivePaisaClient
   * @return {Object}
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
  this.getOrderStatus = function(orderList) {
    this.genericPayload.head.requestCode = ORDER_STATUS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    this.genericPayload.body.OrdStatusReqList = orderList;
    const payload = this.genericPayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };

    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(ORDER_STATUS_ROUTE, payload, {headers: headers})
          .then((response) => {
            if (response.data.body.OrdStatusResLst === 0) {
              reject({err: 'No info found'});
            } else {
              resolve(response.data.body);
            }
          });
    });

    return promise;
  };

  this.getmarketdepth = function(DepthList) {
    this.genericPayload.head.requestCode = MARKET_DEPTH_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    this.genericPayload.body.Count = '1';
    this.genericPayload.body.Data = DepthList;
    const payload = this.genericPayload;

    const promise = new Promise(function(resolve, reject) {
      request_instance.post(MARKET_DEPTH_ROUTE, payload).then((response) => {
        if (response.data.body.Data.length === 0) {
          reject({err: 'No info found'});
        } else {
          resolve(response.data.body);
        }
      });
    });

    return promise;
  };

  /**
   * Gets the trade information for a set of trades provided
   * @method getTradeInfo
   * @memberOf FivePaisaClient
   * @return {Object}
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
  this.getTradeInfo = function(tradeDetailList) {
    this.genericPayload.head.requestCode = TRADE_INFO_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    this.genericPayload.body.TradeDetailList = tradeDetailList;
    const payload = this.genericPayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };
    const promise = new Promise(function(resolve, reject) {
      request_instance
          .post(TRADE_INFO_ROUTE, payload, {headers: headers})
          .then((response) => {
            if (response.data.body.TradeDetail.length === 0) {
              reject({err: 'No info found'});
            } else {
              resolve(response.data.body.TradeDetail);
            }
          });
    });

    return promise;
  };

  this.getMarketFeed = function(reqlist) {
    this.marketpayload.body.Count = CLIENT_CODE;
    this.marketpayload.body.MarketFeedData = reqlist;

    const payload = this.marketpayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };

    return new Promise(function(resolve, reject) {
      try {
      request_instance
          .post(Market_ROUTE, payload, {headers: headers})
          .then((response) => { 
            if (response.data.body.Data === null ) {
              resolve(response.data.body.Message);
            } 
            if(response.data.body.Data?.length === 0){
              resolve(response.data.body.Message);
            }
            else {
              resolve(response.data.body.Data);
            }
            
          })
          .catch((err) => 
          reject());
        } catch (err) {
          console.error(err);
        }
    });
  };


  this.fetch_market_feed_by_scrip = function(reqlist) {
    this.marketscripPayload.body.MarketFeedData = reqlist;

    const payload = this.marketscripPayload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwttoken}`,
    };

    return new Promise(function(resolve, reject) {
      try {
      request_instance
          .post(MARKET_SCRIP_ROUTE, payload, {headers: headers})
          .then((response) => { 
            if (response.data.body.Data === null ) {
              resolve(response.data.body.Message);
            } 
            if(response.data.body.Data?.length === 0){
              resolve(response.data.body.Message);
            }
            else {
              resolve(response.data.body.Data);
            }
            
          })
          .catch((err) => 
          reject());
        } catch (err) {
          console.error(err);
        }
    });
  };

  this.historicalData = function(Exch, Exchtype, scrip, timeframe, from, to) {
    const timeList = ['1m', '5m', '10m', '15m', '30m', '60m', '1d'];
    const res = timeList.includes(timeframe);

    if (res === true) {
      const req_data = {
        ClientCode: CLIENT_CODE,
        JWTToken: jwttoken,
      };

      request_instance
          .post(
              'https://Openapi.5paisa.com/VendorsAPI/Service1.svc/ValidateClientToken',
              req_data,
          )
          .then((response) => {
            if (response.data.Message === 'Success') {
              const h = {
                'Ocp-Apim-Subscription-Key': 'c89fab8d895a426d9e00db380b433027',
                'x-clientcode': CLIENT_CODE,
                'x-auth-token': jwttoken,
              };

              const url = `https://openapi.5paisa.com/historical/${Exch}/${Exchtype}/${scrip}/${timeframe}?from=${from}&end=${to}`;

              // set header
              const headers = h;

              request.get({headers: headers, url: url, method: 'GET'}, function(
                  e,
                  r,
                  body,
              ) {
                const bodyValues = JSON.parse(body);
                const candleList = bodyValues.data.candles;
                const columns = [
                  'Datetime',
                  'Open',
                  'High',
                  'Low',
                  'Close',
                  'Volume',
                ];
                const df = pd.DataFrame(candleList, columns);

                return df.show;
              });
            } else {
              return response.data;
            }
          });
    } else {
      return 'Time frame is invalid.';
    }
  };

  this.ideas_buy = function() {
    this.genericPayload.head.requestCode = IDEAS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    const payload = this.genericPayload;
    const promise = new Promise(function(resolve, reject) {
      request_instance.post(IDEAS_ROUTE, payload).then((response) => {
        if (response.data.body.Data.length === 0) {
          reject(response.data.body.Message);
        } else {
          const bodyValues = JSON.parse(response.data.body.Data[0].payload);
          const df = pd.DataFrame(bodyValues);
          resolve(df);
        }
      });
    });

    return promise;
  };

  this.ideas_trade = function() {
    this.genericPayload.head.requestCode = IDEAS_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    const payload = this.genericPayload;
    const promise = new Promise(function(resolve, reject) {
      request_instance.post(IDEAS_ROUTE, payload).then((response) => {
        if (response.data.body.Data.length === 0) {
          reject(response.data.body.Message);
        } else {
          const bodyValues = JSON.parse(response.data.body.Data[1].payload);
          const df = pd.DataFrame(bodyValues);
          resolve(df);
        }
      });
    });

    return promise;
  };

  this.getTradeBook = function() {
    this.genericPayload.head.requestCode = TRADEBOOK_REQUEST_CODE;
    this.genericPayload.body.ClientCode = CLIENT_CODE;
    const payload = this.genericPayload;
    const promise = new Promise(function(resolve, reject) {
      request_instance.post(TRADEBOOK_ROUTE, payload).then((response) => {
        if (response.data.body.TradeBookDetail.length === 0) {
          reject(response.data.body.Message);
        } else {
          resolve(response.data.body.TradeBookDetail);
        }
      });
    });

    return promise;
  };
}

module.exports = {
  FivePaisaClient: FivePaisaClient,
  OrderValidityEnum: OrderValidityEnum,
};
