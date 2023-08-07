import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";
import { Spin } from "antd";

export const withPublicRoutes = (Component: React.FC) => {
  // eslint-disable-next-line react/display-name
  const WithPublicRoutes = (props: any) => {
    const router = useRouter();
    const { connected } = useConnection();
    const address = useActiveAddress();

    console.log({ address, connected });

    useEffect(() => {
      if (address) {
        router.push("/home");
      }
    }, [address, router]);

    // if (address) {
    //   return null;
    // }

    return !address && connected === false ? (
      <Component {...props} />
    ) : (
      <div
        style={{
          height: "calc(100vh - 54px)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Spin />
      </div>
    );
  };

  return WithPublicRoutes;
};
