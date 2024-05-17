import CryptoJS from "crypto-js";

const secretKey =
  process.env.NEXT_PUBLIC_CRYPTO_SERET_KEY || "4cfv416fdc474vcf7v4fcfd7vv4cd6c";

const storeSessionStorage = (name: string, token: string) => {
  token = encryptData(token, secretKey);
  window.sessionStorage.setItem(name, token);
};

const getSessionStorage = (name: string): string | null => {
  const data = window.sessionStorage.getItem(name);
  if (data === null) {
    return null;
  } else {
    const value = decryptData(data, secretKey);
    return value;
  }
};

const removeSessionStorage = (name: string) => {
  window.sessionStorage.removeItem(name);
};

// Encrypt Data
function encryptData(data: string, secretKey: string): string {
  const ciphertext = CryptoJS.AES.encrypt(data, secretKey, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return ciphertext.toString();
}

// Decrypt Data
function decryptData(encryptedData: string, secretKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return plaintext;
}

export const getImageUrl = (photoUrl: string) => {
  if (!photoUrl) return "https://avatar.iran.liara.run/public/boy";
  if (photoUrl.startsWith("/")) {
    return process.env.NEXT_PUBLIC_API_MEDIA_URL
      ? `${process.env.NEXT_PUBLIC_API_MEDIA_URL}${photoUrl}`
      : photoUrl;
  }
  return photoUrl;
};

export {
  storeSessionStorage,
  getSessionStorage,
  removeSessionStorage,
  encryptData,
  decryptData,
};
