import Arweave from "arweave";
import ArDB from "ardb";

export function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  )
    return (error as { message: string }).message;

  try {
    return new Error(JSON.stringify(error)).message;
  } catch {
    return String(error);
  }
}

export const arweave = Arweave.init({
  host: "arweave.net", // Hostname or IP address for a Arweave host
  port: 443, // Port
  protocol: "https", // Network protocol http or https
  timeout: 20000, // Network request timeouts in milliseconds
  logging: false,
});

export const ardb = new ArDB(arweave);

export const licenseOptions = [
  {
    label: "UDL Default Public",
    value: "default",
  },
  {
    label: "UDL Restricted Access",
    value: "access",
  },
  {
    label: "UDL Commercial Use - One Time",
    value: "commercial",
  },
  {
    label: "UDL Derivative Works - One Time Payment",
    value: "derivative",
  },
];

export function getMimeType(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type) resolve(file.type);
    const fileReader = new FileReader();

    fileReader.onloadend = function (event: ProgressEvent<EventTarget>) {
      if (!event.target) {
        reject(new Error("FileReader onloadend: event target is null."));
        return;
      }

      const target = event.target as FileReader;
      let mimeType = "";

      const arr = new Uint8Array(target.result as ArrayBuffer).subarray(0, 4);
      let header = "";

      for (let index = 0; index < arr.length; index++) {
        header += arr[index].toString(16);
      }

      // View other byte signature patterns here:
      // 1) https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
      // 2) https://en.wikipedia.org/wiki/List_of_file_signatures
      switch (header) {
        case "89504e47": {
          mimeType = "image/png";
          break;
        }
        case "47494638": {
          mimeType = "image/gif";
          break;
        }
        case "52494646":
        case "57454250":
          mimeType = "image/webp";
          break;
        case "49492A00":
        case "4D4D002A":
          mimeType = "image/tiff";
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          mimeType = "image/jpeg";
          break;
        default: {
          mimeType = file.type;
          break;
        }
      }

      resolve(mimeType);
    };

    fileReader.onerror = function (event: ProgressEvent<EventTarget>) {
      if (!event.target) {
        reject(new Error("FileReader onerror: event target is null."));
        return;
      }

      const target = event.target as FileReader;
      reject(target.error || new Error("FileReader onerror: unknown error."));
    };

    fileReader.readAsArrayBuffer(file);
  });
}

export function capitalizeAndFormat(input: string) {
  return input
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
