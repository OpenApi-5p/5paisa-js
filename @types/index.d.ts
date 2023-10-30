declare module '5paisajs' {
    interface Conf {
      appSource: string;
      appName: string;
      userId: string;
      password: string;
      userKey: string;
      encryptionKey: string;
      clientCode?: string;
    }
  
    interface Payload {
      head: {
        appName: string;
        key: string;
        userId: string;
        password: string;
      };
    }
  
    interface OrderParams {
      exchangeSegment: string;
      isStopLossOrder: boolean;
      stopLossPrice: number;
      isIOCOrder: boolean;
      isIntraday: boolean;
      ahPlaced: string;
      IOCOrder: boolean;
      price: number;
      scripCode: string;
      scripData: string;
    }
  
    type OrderResponse = {
      BrokerOrderID: number;
      ClientCode: string;
      Exch: 'B' | 'N';
      ExchOrderID: string;
      ExchType: 'C' | 'D' | 'U';
      LocalOrderID: number;
      Message: string;
      RMSResponseCode: number;
      ScripCode: number;
      Status: number;
      Time: string;
    };
  
    interface OrderRequestParams {
      TrailingSL: number;
      StopLoss: number;
      LocalOrderIDNormal: number;
      LocalOrderIDSL: number;
      LocalOrderIDLimit: number;
      public_ip: string;
      traded_qty: number;
      order_for: string;
      DisQty: number;
      ExchOrderId: string;
      AtMarket: boolean;
      UniqueOrderIDNormal: string;
      UniqueOrderIDSL: string;
      UniqueOrderIDLimit: string;
    }
    
    interface BocoParams {
      TrailingSL: number;
      StopLoss: number;
      LocalOrderIDNormal: number;
      LocalOrderIDSL: number;
      LocalOrderIDLimit: number;
      public_ip: string;
      traded_qty: number;
      order_for: string;
      DisQty: number;
      ExchOrderId: string;
      AtMarket: boolean;
      UniqueOrderIDNormal: string;
      UniqueOrderIDSL: string;
      UniqueOrderIDLimit: string;
    }
  
    interface ResponseData {
      body: {
        Message: string;
        ClientCode: string;
        JWTToken: string;
        AccessToken: string;
        RequestToken: string;
      };
    }
  
    interface FivePaisaClient {
      init(response: { data: ResponseData }): Promise<void>;
      get_access_token(requesttoken: string): Promise<string>;
      set_access_token(accessToken: string): Promise<string>;
      get_oauth_session(requesttoken: string): Promise<string>;
      get_request_token(clientCode: string, totp: string, pin: string): Promise<string>;
      get_TOTP_Session(clientCode: string, totp: string, pin: string): Promise<string>;
      getHoldings(): Promise<Array<any>>;
      getOrderBook(): Promise<Array<any>>;
      getMargin(): Promise<Array<any>>;
      placeOrder(
          orderType: 'BUY' | 'SELL',
          qty: number,
          exchange: 'N' | 'B',
          params?: OrderParams
      ): Promise<OrderResponse>;
      bocoorder(
          scrip_code: number,
          Qty: number,
          LimitPriceInitialOrder: number,
          TriggerPriceInitialOrder: number,
          LimitPriceProfitOrder: number,
          BuySell: 'B' | 'S',
          Exch: 'N' | 'B',
          ExchType: 'C' | 'D' | 'U',
          RequestType: string,
          TriggerPriceForSL: number,
          params?: OrderRequestParams
      ): Promise<OrderResponse>;
      Mod_bo_order(
          orderType: 'BUY' | 'SELL',
          scripCode: number,
          qty: number,
          exchange: 'N' | 'B',
          exchangeOrderID: string,
          params?: OrderParams
      ): Promise<OrderResponse>;
      getPositions(): Promise<Array<any>>;
      modifyOrder(modify_params: {
        exchangeOrderID: string;
        Qty: number;
        Price: number;
        is_intraday: boolean;
        exchange: string;
        exchange_type: string;
      }): Promise<Object>;
      cancelOrder(exchangeOrderID: string): Promise<Object>;
      getOrderStatus(orderList: Array<Object>): Promise<Object>;
      getmarketdepth(DepthList: Array<string>): Promise<Object>;
      getTradeInfo(tradeDetailList: Array<Object>): Promise<Array<Object>>;
      getMarketFeed(reqlist: Array<Object>): Promise<Array<Object>>;
      fetch_market_feed_by_scrip(reqlist: Array<Object>): Promise<Array<Object>>;
      historicalData(
          Exch: string,
          Exchtype: string,
          scrip: string,
          timeframe: string,
          from: string,
          to: string
      ): Promise<any>;
      ideas_buy(): Promise<Object>;
      ideas_trade(): Promise<Object>;
      getTradeBook(): Promise<Array<Object>>;
    }
  
    const OrderValidityEnum: {
      DAY: string;
      IOC: string;
    };
  
    const FivePaisaClient: (conf: Conf) => FivePaisaClient;
  
    export {
      Conf,
      Payload,
      OrderParams,
      BocoParams,
      ResponseData,
      OrderResponse,  
      FivePaisaClient,
      OrderValidityEnum,
    };
  }
  