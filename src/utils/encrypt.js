import CryptoJS from 'crypto-js';

export const encryptPayload = (payload) => {
  const payloadString = JSON.stringify(payload);

  const key = CryptoJS.enc.Utf8.parse("AasHditT3cHnoL0gieSaNdS@lut!oNsS");
  const iv = CryptoJS.enc.Utf8.parse("B@D@B@UN5@G@CH@@");

  const encrypted = CryptoJS.AES.encrypt(payloadString, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
};
