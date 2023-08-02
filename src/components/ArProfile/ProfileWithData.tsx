import React, { useState } from "react";
import { Avatar, Button, Tooltip, Typography, theme } from "antd";
import {
  TwitterOutlined,
  GithubOutlined,
  InstagramOutlined,
  FacebookOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { FaDiscord } from "react-icons/fa";
import { ArAccount } from "arweave-account";
import EditProfileModal from "./EditProfileModal";

const { Text } = Typography;

const { useToken } = theme;

export default function ProfileWithData({
  userAccount,
  showEditProfile,
  addr,
  refetch,
}: {
  addr: string;
  userAccount: ArAccount;
  showEditProfile: boolean;
  refetch?: () => void;
}) {
  const { token } = useToken();
  const [isOpen, setIsOpen] = useState(false);

  const onClose = () => {
    setIsOpen(false);
  };

  const onOpen = () => {
    setIsOpen(true);
  };

  return (
    <div style={{ width: "100%" }}>
      <EditProfileModal
        addr={addr}
        profile={userAccount.profile}
        isOpen={isOpen}
        onClose={onClose}
        refetch={refetch}
      />
      <div>
        <img
          style={{
            height: "330px",
            width: "100%",
            objectFit: "cover",
          }}
          src={userAccount.profile.bannerURL}
          alt="Banner"
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "-60px",
        }}
      >
        <Avatar
          size={120}
          src={userAccount.profile.avatarURL}
          style={{
            border: `2px solid ${token.colorPrimary}`,
            background: "white",
          }}
        />
      </div>

      <div style={{ padding: "24px 16px 8px 16px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <Text style={{ fontSize: "1.5rem", fontWeight: 500 }}>
            {userAccount.profile.name}
          </Text>
          <Text style={{ color: "gray.500" }}>
            <a
              href={`https://viewblock.io/arweave/address/${addr}`}
              target="_blank"
              rel="noreferrer"
            >
              {userAccount.handle}{" "}
            </a>
          </Text>

          <Text style={{ textAlign: "center" }}>{userAccount.profile.bio}</Text>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginBottom: showEditProfile ? 16 : 0,
          }}
        >
          {userAccount.profile.links.twitter && (
            <a
              href={`https://twitter.com/${userAccount.profile.links.twitter}`}
              target="_blank"
              rel="noreferrer"
            >
              <TwitterOutlined style={{ fontSize: 25 }} />
            </a>
          )}
          {userAccount.profile.links.github && (
            <a
              href={`https://github.com/${userAccount.profile.links.github}`}
              target="_blank"
              rel="noreferrer"
            >
              <GithubOutlined style={{ fontSize: 25 }} />
            </a>
          )}
          {userAccount.profile.links.instagram && (
            <a
              href={`https://instagram.com/${userAccount.profile.links.instagram}`}
              target="_blank"
              rel="noreferrer"
            >
              <InstagramOutlined style={{ fontSize: 25 }} />
            </a>
          )}
          {userAccount.profile.links.facebook && (
            <a
              href={`https://facebook.com/${userAccount.profile.links.facebook}`}
              target="_blank"
              rel="noreferrer"
            >
              <FacebookOutlined style={{ fontSize: 25 }} />
            </a>
          )}
          {userAccount.profile.links.discord && (
            <Tooltip
              title={userAccount.profile.links.discord}
              placement="bottom"
            >
              <span>
                <FaDiscord style={{ fontSize: 25, color: "purple" }} />
              </span>
            </Tooltip>
          )}
        </div>

        {showEditProfile && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Button
              onClick={() => onOpen()}
              icon={<ToolOutlined style={{ fontSize: 18 }} />}
              type="primary"
              style={{ borderRadius: "999px" }}
            >
              Edit Profile
            </Button>
            {userAccount.profile.handleName && (
              <Button
                type="primary"
                style={{ borderRadius: "999px" }}
                href={`/${userAccount.handle}`}
              >
                Buy Me a Storage Page
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
