// import CryptoJS from 'crypto-js';

// export const dataEncrypt = (text, secret) => {
//     const data = CryptoJS.AES.encrypt(JSON.stringify({ text }), secret).toString();
//     return data;
// };

import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

export const dataEncrypt = (text, secret) => {
    const data = AES.encrypt(text, secret).toString();
    return data;
};

export const dataDecrypt = (text, secret) => {
    const bytes = AES.decrypt(text, secret);
    const originalText = bytes.toString(Utf8);
    return originalText;
};