import CryptoJS from 'crypto-js';

export const dataEncrypt = (text, secret) => {
    const data = CryptoJS.AES.encrypt(text, secret).toString();
    return data;
};

export const dataDecrypt = (text, secret) => {
    var bytes = CryptoJS.AES.decrypt(text, secret);
    var data = bytes.toString(CryptoJS.enc.Utf8);
    return data;
};