import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider, Layout } from "antd";
import { customTheme } from "@/config";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import Head from "next/head";
import React from "react";
import dynamic from "next/dynamic";
// import PrivateLayout from "@/layout/privateLayout";

const NavBar = dynamic(
  async () => await import("@/components/Navigation/NavBar"),
  {
    ssr: false,
  }
);
const PrivateLayout = dynamic(
  async () => await import("@/layout/privateLayout"),
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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider theme={customTheme}>
      <ArweaveWalletKit
        config={{
          permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION", "DISPATCH"],
          ensurePermissions: true,
          appInfo: {
            name: "Buy Me a Storage",
            logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAC+UlEQVRYw7WXS0iUURTHfzNRWZGjQbWy0pKyhZmJi15gQbQqaiM9aBFkFj1oF22koEVUi4oWYQ/SIgqiIip6Qi+QoAdWJmgaBMVo2dOyZJw2/4mPz3Nn5hv1wmVm7v/ce8499/zPORNiYGMsUAJMAbKBVuAmQzxGA1XAA6AXiPvm8aFSHAKqgaih1Dv75JFBHROAuykUe+f0wVReALQFUH4rqFtT3bwByE8i0wY8AzqAZsXA78F6c5fbY0A9MGsoo73aoTwKLJJMGNgLtAPvgafAWWAzkDdQqkUdyr0Bti1JLMSA68C8TAzY6DiwQvgKfV5KIyj79Fw5QQx4aBxU53mal/q+JwA73gIz0lGe7chwxUAE+KJblQJjgCv6nY4RHUBRKgMWGBtbhW3wrL0GJmo9ouxXAdQALUmMaAfGJTNgnbHpvLB640Y1wBKg3HNwGFgPdDmMuJDMgC3GhiPC7qVwcQx4BCyX/FSHN/qAxUH4f0zYjQBBdw7I0tN0Gvh9lwErDeHbwg4GMCAumoaASocXTFbMNIS/6zYLAxoQVyygeuHHdloGhIFPhvAa4Y/TTD4fRNlWecGKrWuuZzhlCDfpoNUpFNf66sB8IFf898u/SwjNUZuVqG5zHQrygNlJDNin/ZMUzMuAYVobbiSsHoBNHiCmSoZRiruAkcBSh/JG4SWKmcT6VY83/hq07Vf1ulXxCuT2uN4ywe06hyvzZcBzAy9VivevfwP4agBv1A2FxOMsKV8lq71vflEpOaxewPJOmYNBjQD7HZtafB1PPnAGuANcViUsFpajNeucBl3kgIGdTjQfzY7Nf5SGCx1siQBbRTlrf7fySgT4bOBrEwcVJSkcCVc3Kb0eBU4q5/ekqAuVOn+7gf9QXPwf5Y4ElMns9WRAgN2GzGHLpYXAiwEqj6o8+9P7L49Mp6eX6DdGALtEkaC3rgXGO84tA04Ah4Bp6bRmOcAO4ImPev7YaFZrntH/wVCacrmi5GRgFPAT+Ai8ksszHv8A8LIPt8fFsuoAAAAASUVORK5CYII=",
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
          <link
            rel="icon"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAC+UlEQVRYw7WXS0iUURTHfzNRWZGjQbWy0pKyhZmJi15gQbQqaiM9aBFkFj1oF22koEVUi4oWYQ/SIgqiIip6Qi+QoAdWJmgaBMVo2dOyZJw2/4mPz3Nn5hv1wmVm7v/ce8499/zPORNiYGMsUAJMAbKBVuAmQzxGA1XAA6AXiPvm8aFSHAKqgaih1Dv75JFBHROAuykUe+f0wVReALQFUH4rqFtT3bwByE8i0wY8AzqAZsXA78F6c5fbY0A9MGsoo73aoTwKLJJMGNgLtAPvgafAWWAzkDdQqkUdyr0Bti1JLMSA68C8TAzY6DiwQvgKfV5KIyj79Fw5QQx4aBxU53mal/q+JwA73gIz0lGe7chwxUAE+KJblQJjgCv6nY4RHUBRKgMWGBtbhW3wrL0GJmo9ouxXAdQALUmMaAfGJTNgnbHpvLB640Y1wBKg3HNwGFgPdDmMuJDMgC3GhiPC7qVwcQx4BCyX/FSHN/qAxUH4f0zYjQBBdw7I0tN0Gvh9lwErDeHbwg4GMCAumoaASocXTFbMNIS/6zYLAxoQVyygeuHHdloGhIFPhvAa4Y/TTD4fRNlWecGKrWuuZzhlCDfpoNUpFNf66sB8IFf898u/SwjNUZuVqG5zHQrygNlJDNin/ZMUzMuAYVobbiSsHoBNHiCmSoZRiruAkcBSh/JG4SWKmcT6VY83/hq07Vf1ulXxCuT2uN4ywe06hyvzZcBzAy9VivevfwP4agBv1A2FxOMsKV8lq71vflEpOaxewPJOmYNBjQD7HZtafB1PPnAGuANcViUsFpajNeucBl3kgIGdTjQfzY7Nf5SGCx1siQBbRTlrf7fySgT4bOBrEwcVJSkcCVc3Kb0eBU4q5/ekqAuVOn+7gf9QXPwf5Y4ElMns9WRAgN2GzGHLpYXAiwEqj6o8+9P7L49Mp6eX6DdGALtEkaC3rgXGO84tA04Ah4Bp6bRmOcAO4ImPev7YaFZrntH/wVCacrmi5GRgFPAT+Ai8ksszHv8A8LIPt8fFsuoAAAAASUVORK5CYII="
          />
          {process.env.NODE_ENV !== "production" && (
            <script
              dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }}
            />
          )}
        </Head>
        {/* <Layout>
            <NavBar />
            <Component {...pageProps} />
          </Layout> */}
        <PrivateLayout>
          <Component {...pageProps} />
        </PrivateLayout>
      </ArweaveWalletKit>
    </ConfigProvider>
  );
}
