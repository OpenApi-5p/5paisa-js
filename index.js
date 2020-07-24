"use strict";
const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const { genericPayload, loginPayload } = require("./const");
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

  this.holdings = function() {
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
}

module.exports = FivePaisaClient;
