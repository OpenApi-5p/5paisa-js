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

module.exports = {
  genericPayload: GENERIC_PAYLOAD,
  loginPayload: LOGIN_PAYLOAD
};
