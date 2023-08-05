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
