import crypto from "crypto";
import {
  encryptedKeyLength,
  ivLength,
  encryptedKeyIvLength,
  authTagLength,
  algorithm,
} from "./common";

export async function decryptFile(
  encryptedData: ArrayBuffer,
  privateKey: string
): Promise<ArrayBuffer> {
  const encryptedBuffer = Buffer.from(encryptedData);

  // Extract the encryptedKey, iv, encryptedContent, and authTag from the encrypted data
  const encryptedKey = encryptedBuffer.slice(0, encryptedKeyLength);
  const iv = encryptedBuffer.slice(
    encryptedKeyLength,
    encryptedKeyLength + ivLength
  );
  const encryptedContent = encryptedBuffer.slice(
    encryptedKeyIvLength,
    encryptedBuffer.length - authTagLength
  );
  const authTag = encryptedBuffer.slice(encryptedBuffer.length - authTagLength);

  // Decrypt the symmetric key using the private key
  const symmetricKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    encryptedKey
  );

  // Create a new decipher object with GCM mode and set the IV and authentication tag
  const decipher = crypto.createDecipheriv(algorithm, symmetricKey, iv);
  decipher.setAuthTag(authTag);

  // Decrypt the content
  const decryptedContent = await decryptBuffer(encryptedContent, decipher);

  return decryptedContent;
}

function decryptBuffer(
  encryptedData: ArrayBuffer,
  decipher: crypto.Decipher
): Promise<Buffer> {
  return new Promise((resolve) => {
    const encryptedBuffer = Buffer.from(encryptedData);
    const decryptedChunks: Buffer[] = [];

    decipher.on("data", (chunk: Buffer) => {
      decryptedChunks.push(chunk);
    });

    decipher.on("end", () => {
      resolve(Buffer.concat(decryptedChunks));
    });

    decipher.end(encryptedBuffer);
  });
}
