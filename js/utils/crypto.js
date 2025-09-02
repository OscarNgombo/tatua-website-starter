const secretKey = "T@tuaS0lut1onsK3y";

export const encryptData = (data) => {
  const jsonString = JSON.stringify(data);
  // Encrypt with AES-256 and return the Base64 representation
  return CryptoJS.AES.encrypt(jsonString, secretKey).toString();
};

export const decryptData = (encryptedData) => {
  if (!encryptedData) return null;

  // AES decryption
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedJson) {
      throw new Error("AES decryption resulted in an empty string.");
    }
    return JSON.parse(decryptedJson);
  } catch (aesError) {
    console.warn(
      "AES decryption failed. Attempting fallback for older data formats.",
      aesError.message
    );
  }

  return null;
};
