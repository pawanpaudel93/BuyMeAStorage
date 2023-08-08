import ArProfile from "@/components/ArProfile/Profile";
import { withPrivateRoutes } from "@/hoc";
import { Spin } from "antd";
import { useActiveAddress } from "arweave-wallet-kit";

function Profile() {
  const address = useActiveAddress();

  console.log({ address });

  if (!address) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
          minHeight: "calc(100vh - 54px)",
        }}
      >
        <Spin />
      </div>
    );
  }

  return <ArProfile addr={address as string} showEditProfile={true} />;
}

export default withPrivateRoutes(Profile);
