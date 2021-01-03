const crypto = require("crypto");

const iv = new Buffer.from([83, 71, 26, 58, 54, 35, 22, 11,
  83, 71, 26, 58, 54, 35, 22, 11]);

const AES256Encrypt = (key, text) => {

  let nodeCryptoKey = crypto.pbkdf2Sync(key, iv, 1000, 48, "sha1");
  const newiv = nodeCryptoKey.slice(0, 16);
  const newkey = nodeCryptoKey.slice(16, 48);
  let cipher = crypto.createCipheriv("aes256", newkey, newiv);
  let crypted = cipher.update(text, "utf8", "base64");
  crypted += cipher.final("base64");
  return crypted;
};

const AES128Encrypt = (key, text) => {

  let nodeCryptoKey = crypto.pbkdf2Sync(key, iv, 1000, 48, 'sha1');
  const newiv = nodeCryptoKey.slice(0, 16)
  const newkey = nodeCryptoKey.slice(16, 32)
  var cipher = crypto.createCipheriv('aes128', newkey, newiv)
  var crypted = cipher.update(text, 'utf8', 'base64')
  crypted += cipher.final('base64');
  return crypted;
}


module.exports = {
  AES256Encrypt: AES256Encrypt,
  AES128Encrypt: AES128Encrypt
};
