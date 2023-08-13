export const symmetricKeyLength = 32;
export const encryptedKeyLength = 512;
export const ivLength = 12;
export const encryptedKeyIvLength = encryptedKeyLength + ivLength;
export const authTagLength = 16;
export const algorithm = "aes-256-gcm";

export const uint8ArrayToBase64String = (uint8Array: Uint8Array) => {
  return btoa(String.fromCharCode(...uint8Array));
};

export const base64StringToUint8Array = (base64String: string) => {
  return new Uint8Array(
    atob(base64String)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
};
