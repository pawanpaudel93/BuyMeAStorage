import { useConnection } from "arweave-wallet-kit";
import Link from "next/link";

export const withPublicRoutes = (Component: React.FC) => {
  // eslint-disable-next-line react/display-name
  return (props: any) => {
    const { connected } = useConnection();

    return connected ? <Link href="/" /> : <Component {...props} />;
  };
};
