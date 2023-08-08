import Arweave from "arweave";
import ArDB from "ardb";
import Account, { ArAccount } from "arweave-account";

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
  // {
  //   label: "UDL Restricted Access",
  //   value: "access",
  // },
  {
    label: "UDL Commercial Use - Allowed",
    value: "commercial",
  },
  {
    label: "UDL Commercial Use - Allowed With Credit",
    value: "commercial-credit",
  },
  {
    label: "UDL Derivative Works - Allowed With Credit",
    value: "derivative-credit",
  },
  {
    label: "UDL Derivative Works - Allowed With Indication",
    value: "derivative-indication",
  },
];

export const licenseOptionsWithRestriction = [
  {
    label: "UDL Default Public",
    value: "default",
  },
  {
    label: "UDL Restricted Access",
    value: "access",
  },
  {
    label: "UDL Commercial Use - Allowed",
    value: "commercial",
  },
  {
    label: "UDL Commercial Use - Allowed With Credit",
    value: "commercial-credit",
  },
  {
    label: "UDL Derivative Works - Allowed With Credit",
    value: "derivative-credit",
  },
  {
    label: "UDL Derivative Works - Allowed With Indication",
    value: "derivative-indication",
  },
];

export const currencyOptions = [
  {
    label: "U",
    value: "U",
  },
  {
    label: "AR",
    value: "AR",
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

export function formatHandle(handle: string) {
  const position = handle.length - 7;
  return handle.slice(0, position) + "-" + handle.slice(position + 1);
}

export function getHandle(formattedHandle: string) {
  const position = formattedHandle.length - 7;
  return (
    formattedHandle.slice(0, position) +
    "#" +
    formattedHandle.slice(position + 1)
  );
}

export async function fetchProfile({
  address,
  userHandle,
}: {
  address?: string;
  userHandle?: string;
}) {
  let user;
  if (!address) {
    const account = new Account();
    user = await account.find(userHandle as string);
  } else {
    const account = new Account();
    user = await account.get(address);
  }

  if (!user) {
    throw new Error("Account not available.");
  }

  if (
    user.profile.banner === "ar://a0ieiziq2JkYhWamlrUCHxrGYnHWUAMcONxRmfkWt-k"
  ) {
    user = {
      ...user,
      profile: { ...user.profile, bannerURL: "/background.png" },
    };
  }

  if (
    user.profile.avatar === "ar://OrG-ZG2WN3wdcwvpjz1ihPe4MI24QBJUpsJGIdL85wA"
  ) {
    user = {
      ...user,
      profile: {
        ...user.profile,
        avatarURL: "/avatar.svg",
      },
    };
  }

  user = { ...user, handle: formatHandle(user.handle) };
  return user as ArAccount;
}

export async function getArweavePrice() {
  const response = await (
    await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd"
    )
  ).json();
  return response.arweave.usd;
}

export const COLORS = [
  "brown",
  "teal",
  "green",
  "blue",
  "purple",
  "orange",
  "yellow",
  "pink",
  "cyan",
  "magenta",
  "white",
  "black",
  "gray",
  "silver",
];

export const getArrayBufferSizeInKB = (data: ArrayBuffer) => {
  const arrayBufferSizeInBytes = data.byteLength;
  const arrayBufferSizeInKB = arrayBufferSizeInBytes / 1024;
  return arrayBufferSizeInKB;
};
