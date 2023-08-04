import React, { useEffect, useState } from "react";
import Account, { ArAccount } from "arweave-account";
import { Spin, Button, Typography } from "antd";
import ProfileWithData from "./ProfileWithData";
import "./Profile.module.css";

const { Text } = Typography;

function Profile({
  addr,
  showEditProfile = true,
}: {
  addr: string;
  showEditProfile: boolean;
}) {
  const [userAccount, setUserAccount] = useState<ArAccount | null>(null);
  const [hasFailed, setHasFailed] = useState<string | false>(false);

  async function fetchProfile() {
    try {
      const account = new Account();
      let user = await account.get(addr);
      if (
        user.profile.banner ===
        "ar://a0ieiziq2JkYhWamlrUCHxrGYnHWUAMcONxRmfkWt-k"
      ) {
        user = {
          ...user,
          profile: { ...user.profile, bannerURL: "/background.png" },
        };
      }
      if (
        user.profile.avatar ===
        "ar://OrG-ZG2WN3wdcwvpjz1ihPe4MI24QBJUpsJGIdL85wA"
      ) {
        user = {
          ...user,
          profile: {
            ...user.profile,
            avatarURL:
              "https://arweave.net/4eJ0svoPeMtU0VyYODTPDYFrDKGALIt8Js25tUERLPw",
          },
        };
      }
      setUserAccount(user);
    } catch (e) {
      console.log(e);
      setHasFailed(JSON.stringify(e));
    }
  }

  useEffect(() => {
    if (addr) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addr]);

  return (
    <div style={{ minHeight: "calc(100vh - 54px)", padding: "16px 24px" }}>
      {hasFailed ? (
        <>
          <Text type="danger">Something wrong happened :(</Text>
          <Button type="primary" onClick={fetchProfile}>
            Retry
          </Button>
        </>
      ) : userAccount ? (
        <ProfileWithData
          addr={addr}
          userAccount={userAccount}
          showEditProfile={showEditProfile}
          refetch={fetchProfile}
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
