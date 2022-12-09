import CryptoJS from 'crypto-js';

export const dataEncrypt = (text, secret) => {
    const data = CryptoJS.AES.encrypt(JSON.stringify({ text }), secret).toString();
    return data;
};