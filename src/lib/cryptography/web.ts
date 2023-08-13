// @ts-expect-error no type check
import * as crypto from "crypto-browserify";
// @ts-expect-error no type check
import { Readable } from "stream-browserify";
import { Buffer } from "buffer";
import {
  symmetricKeyLength,
  ivLength,
  algorithm,
  authTagLength,
} from "./common";

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

function bufferToBase64(buf: ArrayBuffer) {
  const binstr = Array.prototype.map
    .call(new Uint8Array(buf), function (ch) {
      return String.fromCharCode(ch);
    })
    .join("");
  return btoa(binstr);
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
