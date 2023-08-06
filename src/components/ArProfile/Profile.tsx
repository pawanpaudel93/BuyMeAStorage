import React, { useEffect, useState } from "react";
import { Spin, Button, Typography } from "antd";
import ProfileWithData from "./ProfileWithData";
import "./Profile.module.css";
import { fetchProfile } from "@/utils";
import { useConnectedUserStore } from "@/lib/store";

const { Text } = Typography;

function Profile({
  addr,
  showEditProfile = true,
}: {
  addr: string;
  showEditProfile: boolean;
}) {
  const { userAccount, setUserAccount } = useConnectedUserStore();
  const [hasFailed, setHasFailed] = useState<string | false>(false);

  async function refetch() {
    try {
      const user = await fetchProfile({ address: addr, userHandle: "" });
      setUserAccount(user);
    } catch (e) {
      console.log(e);
      setHasFailed(JSON.stringify(e));
    }
  }

  useEffect(() => {
    if (addr && !userAccount) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr]);

  return (
    <div style={{ minHeight: "calc(100vh - 54px)" }}>
      {hasFailed ? (
        <>
          <Text type="danger">Something wrong happened :(</Text>
          <Button type="primary" onClick={refetch}>
            Retry
          </Button>
        </>
      ) : userAccount ? (
        <ProfileWithData
          addr={addr}
          userAccount={userAccount}
          showEditProfile={showEditProfile}
          refetch={refetch}
        />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "100px",
            minHeight: "calc(100vh - 54px)",
          }}
        >
          <Spin size="large" />
        </div>
      )}
    </div>
  );
}

export default Profile;
