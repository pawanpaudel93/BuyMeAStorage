import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider } from "antd";
import { customTheme } from "@/config";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={customTheme}>
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
