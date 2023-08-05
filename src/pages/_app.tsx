import "@/styles/globals.css";
import NextNProgress from "nextjs-progressbar";
import type { AppProps } from "next/app";
import { ConfigProvider, Layout } from "antd";
import { customTheme } from "@/config";
import { ArweaveWalletKit, useConnection } from "arweave-wallet-kit";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const { Content } = Layout;

const NavBar = dynamic(
  async () => await import("@/components/Navigation/NavBar"),
  { ssr: false }
);
const PrivateLayout = dynamic(
  async () => await import("@/components/Layouts/privateLayout"),
  {
    ssr: false,
  }
);

const noOverlayWorkaroundScript = `
  window.addEventListener('error', event => {
    event.stopImmediatePropagation()
  })

  window.addEventListener('unhandledrejection', event => {
    event.stopImmediatePropagation()
  })
`;

export function AppLayout({ appProps }: { appProps: AppProps }) {
  const { Component, pageProps } = appProps;
  const router = useRouter();

  const { connected } = useConnection();

  const redirectToHome = () => {
    if (connected) {
      router.push("/home");
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    redirectToHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  return (
    <>
      {connected ? (
        <PrivateLayout>
          <NextNProgress color="#a62a22" />
          <Component {...pageProps} />
        </PrivateLayout>
      ) : (
        <Layout>
          <NavBar />
          <NextNProgress color="#a62a22" />
          <Content style={{ minHeight: "calc(100vh - 54px)" }}>
            <Component {...pageProps} />
          </Content>
        </Layout>
      )}
    </>
  );
}

export default function App(appProps: AppProps) {
  const { Component, pageProps } = appProps;
  const [logo, setLogo] = useState("/logo.svg");

  useEffect(() => {
    setLogo(`${window.location.origin}/logo.svg`);
  }, []);

  return (
    <ConfigProvider theme={customTheme}>
      <ArweaveWalletKit
        config={{
          permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
          ensurePermissions: true,
          appInfo: {
            name: "Buy Me a Storage",
            logo,
          },
        }}
        theme={{
          accent: { r: 166, g: 42, b: 34 },
        }}
      >
        <Head>
          <title>Buy Me a Storage</title>
          <meta name="description" content="Generated by create next app" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/logo.svg" />
          {process.env.NODE_ENV !== "production" && (
            <script
              dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}
            />
          )}
        </Head>
        <AppLayout appProps={appProps} />
      </ArweaveWalletKit>
    </ConfigProvider>
  );
}
