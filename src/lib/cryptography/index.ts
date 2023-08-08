// @ts-expect-error no type check
import { generateKeyPair } from "human-crypto-keys";
// @ts-expect-error no type check
import * as crypto from "crypto-browserify";
// @ts-expect-error no type check
import { Readable } from "stream-browserify";
import { Buffer } from "buffer";

const symmetricKeyLength = 32;
const encryptedKeyLength = 512;
const ivLength = 12;
const encryptedKeyIvLength = encryptedKeyLength + ivLength;
const authTagLength = 16;
const algorithm = "aes-256-gcm";

export async function encryptFile(
  sourceData: File,
  publicKey: string
): Promise<{
  encryptedData: ArrayBuffer;
  iv: string;
  authTag: string;
  encryptedKey: string;
}> {
  const symmetricKey = crypto.randomBytes(symmetricKeyLength);

  const encryptedKey = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    symmetricKey
  );

  // Generate a random initialization vector
  const iv = crypto.randomBytes(ivLength);

  // Create a new cipher object
  const cipher = crypto.createCipheriv(algorithm, symmetricKey, iv, {
    authTagLength,
  });

  // Read the content of the File as ArrayBuffer
  const sourceDataArrayBuffer = await readFileAsArrayBuffer(sourceData);

  // Encrypt the source data using the cipher
  const encryptedData = Buffer.concat([
    encryptedKey,
    iv,
    Buffer.from(await encryptBuffer(sourceDataArrayBuffer, cipher)),
    cipher.getAuthTag(),
  ]).buffer;

  return {
    encryptedData,
    iv: bufferToBase64(iv),
    authTag: bufferToBase64(cipher.getAuthTag()),
    encryptedKey: bufferToBase64(encryptedKey),
  };
}

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
    -authTagLength
  );
  const authTag = encryptedBuffer.slice(-authTagLength);

  // Decrypt the symmetric key using the private key
  const symmetricKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    encryptedKey
  );

  // Create a new decipher object with GCM mode and set the IV and authentication tag
  const decipher = crypto.createDecipheriv(algorithm, symmetricKey, iv, {
    authTagLength: authTagLength,
  });
  decipher.setAuthTag(authTag);

  // Decrypt the content
  const decryptedContent = await decryptBuffer(encryptedContent, decipher);

  return decryptedContent.buffer;
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

function encryptBuffer(
  data: ArrayBuffer,
  cipher: crypto.Cipher
): Promise<Buffer> {
  return new Promise((resolve) => {
    const dataArray = new Uint8Array(data);
    const encryptedChunks: Uint8Array[] = [];

    cipher.on("data", (chunk: Buffer) => {
      encryptedChunks.push(chunk);
    });

    cipher.on("end", () => {
      resolve(Buffer.concat(encryptedChunks));
    });

    const readStream = new Readable({
      read() {
        this.push(dataArray);
        this.push(null);
      },
    });

    readStream.pipe(cipher);
  });
}

export async function createKeyPair() {
  const keys = await generateKeyPair(
    { id: "rsa", modulusLength: 4096 },
    { privateKeyFormat: "pkcs1-pem" }
  );

  return keys;
}

function bufferToBase64(buf: ArrayBuffer) {
  const binstr = Array.prototype.map
    .call(new Uint8Array(buf), function (ch) {
      return String.fromCharCode(ch);
    })
    .join("");
  return btoa(binstr);
}

function base64ToBuffer(base64: string) {
  const binstr = atob(base64);
  const buf = new Uint8Array(binstr.length);
  for (let i = 0; i < binstr.length; i++) {
    buf[i] = binstr.charCodeAt(i);
  }
  return buf.buffer;
}

function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result instanceof ArrayBuffer) {
        resolve(event.target.result);
      } else {
        reject(new Error("Failed to read the file as ArrayBuffer."));
      }
    };

    reader.onerror = (event) => {
      reject(
        event.target?.error ||
          new Error("An error occurred while reading the file.")
      );
    };

    reader.readAsArrayBuffer(file);
  });
}
