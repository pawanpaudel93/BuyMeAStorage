import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useActiveAddress, useConnection } from "arweave-wallet-kit";

export const withPrivateRoutes = (Component: any) => {
  const WithPrivateRoutes = (props: any) => {
    const { connected } = useConnection();
    const address = useActiveAddress();
    const router = useRouter();

    useEffect(() => {
      if (!address) {
        router.push("/");
      }
    }, [address, router]);

    if (!address) {
      return null;
    }
    return <Component {...props} />;
  };

  return WithPrivateRoutes;
};
