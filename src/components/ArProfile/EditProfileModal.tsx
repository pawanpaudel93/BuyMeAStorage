import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Input,
  Image,
  Avatar,
  message,
  Space,
  Form,
  Tooltip,
  theme,
} from "antd";
import {
  FaDiscord,
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaGithub,
} from "react-icons/fa";
import { arweave, getErrorMessage } from "@/utils";
import { BiUserCircle } from "react-icons/bi";
import Account, { ArProfile } from "arweave-account";

const ACCEPTED_DISPATCH_SIZE = 120 * Math.pow(10, 3);

function EditProfileModal({
  addr,
  profile,
  isOpen,
  onClose,
  refetch,
}: {
  addr: string;
  profile: ArProfile;
  isOpen: boolean;
  onClose: () => void;
  refetch?: () => void;
}) {
  const [profileData, setProfileData] = useState<ArProfile>(profile);
  const [handleError, setHandleError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<{
    blobUrl: string;
    type: string;
  } | null>(null);
  const [bannerPicture, setBannerPicture] = useState<{
    blobUrl: string;
    type: string;
  } | null>(null);
  const [bannerPictureIsLoading, setBannerPictureIsLoading] = useState(false);
  const [pictureIsLoading, setPictureIsLoading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const bannerRef = useRef<any>(null);
  const avatarRef = useRef<any>(null);
  const [form] = Form.useForm();
  const { useToken } = theme;
  const { token } = useToken();

  useEffect(() => {
    if (profile && profile.handleName) {
      setProfileData({ ...profile, handleName: profile.handleName });
    }
  }, [profile]);

  const handleChangePicture = (e: FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      setProfilePicture({
        blobUrl: URL.createObjectURL(files[0]),
        type: files[0].type,
      });
      setIsUploaded(false);
    }
    e.currentTarget.files = null;
  };

  const handleChangeBannerPicture = (e: FormEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      setBannerPicture({
        blobUrl: URL.createObjectURL(files[0]),
        type: files[0].type,
      });
      setIsUploaded(false);
    }
    e.currentTarget.files = null;
  };

  const uploadPicture = async () => {
    setPictureIsLoading(true);
    if (profilePicture) {
      const blob = await fetch(profilePicture.blobUrl).then((r) => r.blob());

      const reader = new FileReader();
      reader.addEventListener("loadend", async () => {
        if (reader.result) {
          try {
            const tx = await arweave.createTransaction({ data: reader.result });
            tx.addTag("Content-Type", profilePicture.type);

            const winstons = await arweave.wallets.getBalance(addr);
            const balance = parseFloat(winstons);
            const fee = parseFloat(tx.reward);
            const numBytes = parseInt(tx.data_size);

            if (numBytes <= ACCEPTED_DISPATCH_SIZE) {
              const result = await window.arweaveWallet.dispatch(tx);
              setProfileData({ ...profileData, avatar: `ar://${result.id}` });
            } else if (balance >= fee) {
              await arweave.transactions.sign(tx);
              await arweave.transactions.post(tx);
              setProfileData({ ...profileData, avatar: `ar://${tx.id}` });
            } else {
              throw Error(
                "Not enough funds in your wallet.\n\nTransfer some AR tokens to your wallet or try an image smaller than 100KB in size."
              );
            }
            setIsUploaded(true);
          } catch (error: any) {
            handleUploadError(error);
          } finally {
            setPictureIsLoading(false);
          }
        }
      });
      reader.readAsArrayBuffer(blob);
    }
  };

  const uploadBannerPicture = async () => {
    setBannerPictureIsLoading(true);
    if (bannerPicture) {
      const blob = await fetch(bannerPicture.blobUrl).then((r) => r.blob());

      const reader = new FileReader();
      reader.addEventListener("loadend", async () => {
        if (reader.result) {
          try {
            const tx = await arweave.createTransaction({ data: reader.result });
            tx.addTag("Content-Type", bannerPicture.type);

            const winstons = await arweave.wallets.getBalance(addr);
            const balance = parseFloat(winstons);
            const fee = parseFloat(tx.reward);
            const numBytes = parseInt(tx.data_size);

            if (numBytes <= ACCEPTED_DISPATCH_SIZE) {
              const result = await window.arweaveWallet.dispatch(tx);
              setProfileData({
                ...profileData,
                banner: `ar://${result.id}`,
              });
            } else if (balance >= fee) {
              await arweave.transactions.sign(tx);
              await arweave.transactions.post(tx);
              setProfileData({
                ...profileData,
                banner: `ar://${tx.id}`,
              });
            } else {
              throw Error(
                "Not enough funds in your wallet.\n\nTransfer some AR tokens to your wallet or try an image smaller than 100KB in size."
              );
            }
            setIsUploaded(true);
          } catch (error: any) {
            handleUploadError(error);
          } finally {
            setBannerPictureIsLoading(false);
          }
        }
      });
      reader.readAsArrayBuffer(blob);
    }
  };

  const handleUploadError = (error: Error) => {
    message.error(`Update failed: ${getErrorMessage(error)}`);
  };

  const save = async () => {
    if (!profileData.handleName || profileData.handleName.length <= 0) {
      setHandleError(true);
    } else {
      setIsLoading(true);
      const account = new Account();
      try {
        await account.connect();
        const result = await account.updateProfile(profileData);
        message.success(
          `Your account has been successfully set! The network is processing your transaction: ${result.id}`
        );
        if (refetch) {
          refetch();
        }
      } catch (e) {
        message.error(`Sorry, something went wrong: ${getErrorMessage(e)}`);
      }

      setIsLoading(false);
      onClose();
    }
  };

  return (
    <>
      <Modal
        title="Edit profile information"
        open={isOpen}
        onCancel={onClose}
        style={{ top: 30 }}
        footer={
          <Space direction="horizontal">
            <Button onClick={onClose} shape="round">
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={save}
              shape="round"
              loading={isLoading}
            >
              Save
            </Button>
          </Space>
        }
      >
        <Tooltip
          placement="top"
          title={"Click to update banner"}
          arrow={true}
          color={token.colorPrimary}
        >
          <div style={{ cursor: "pointer" }}>
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleChangeBannerPicture}
              ref={bannerRef}
            />
            {bannerPicture ? (
              <div style={{ position: "relative" }}>
                <Image
                  // height={330}
                  width="100%"
                  src={bannerPicture.blobUrl}
                  preview={false}
                  onClick={() => bannerRef.current.click()}
                  alt=""
                />
                <Button
                  type="primary"
                  style={{
                    position: "absolute",
                    visibility: isUploaded ? "hidden" : "visible",
                    zIndex: 100,
                    top: 1,
                    left: 1,
                  }}
                  onClick={uploadBannerPicture}
                  loading={bannerPictureIsLoading}
                >
                  Upload
                </Button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <Image
                  // height={330}
                  width="100%"
                  src={profileData.bannerURL}
                  preview={false}
                  onClick={() => bannerRef.current.click()}
                  alt=""
                />
              </div>
            )}
          </div>
        </Tooltip>
        <Space direction="vertical" size={16}>
          <Tooltip
            placement="top"
            title={"Click to update avatar"}
            arrow={true}
            color={token.colorPrimary}
          >
            <div style={{ cursor: "pointer", position: "relative" }}>
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handleChangePicture}
                ref={avatarRef}
              />
              {profilePicture ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "-40px",
                  }}
                >
                  <Avatar
                    src={profilePicture.blobUrl}
                    size={80}
                    style={{
                      border: `2px solid ${token.colorPrimary}`,
                      borderRadius: "999px",
                      background: "white",
                    }}
                    onClick={() => avatarRef.current.click()}
                  />
                  <Button
                    type="primary"
                    style={{
                      position: "absolute",
                      visibility: isUploaded ? "hidden" : "visible",
                      zIndex: 100,
                      bottom: 1,
                      borderRadius: "999px",
                    }}
                    onClick={uploadPicture}
                    loading={pictureIsLoading}
                  >
                    Upload
                  </Button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "-40px",
                  }}
                >
                  <Avatar
                    src={profileData.avatarURL}
                    size={80}
                    style={{
                      border: `2px solid ${token.colorPrimary}`,
                      borderRadius: "999px",
                      background: "white",
                    }}
                    onClick={() => avatarRef.current.click()}
                  />
                </div>
              )}
            </div>
          </Tooltip>

          <Form
            form={form}
            layout="vertical"
            // onFinish={onFinish}
            // onFinishFailed={onFinishFailed}
            // autoComplete="off"
          >
            <Form.Item>
              <Input
                disabled
                addonBefore={<BiUserCircle />}
                value={profileData.avatar}
                placeholder="Avatar URI"
              />
            </Form.Item>

            <Form.Item>
              <Input
                addonBefore="@"
                placeholder="handle"
                value={profileData.handleName || ""}
                onChange={(e) => {
                  setProfileData({
                    ...profileData,
                    handleName: e.target.value,
                  });
                  setHandleError(false);
                }}
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Input
                addonBefore="Name"
                placeholder="Name"
                value={profileData.name || ""}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    name: e.target.value,
                  })
                }
                allowClear
              />
            </Form.Item>

            <Form.Item>
              <Input.TextArea
                placeholder="Bio"
                value={profileData.bio || ""}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
                allowClear
              />
            </Form.Item>

            <Form.Item>
              {[
                { icon: <FaTwitter />, label: "Twitter", field: "twitter" },
                { icon: <FaDiscord />, label: "Discord", field: "discord" },
                { icon: <FaGithub />, label: "Github", field: "github" },
                {
                  icon: <FaInstagram />,
                  label: "Instagram",
                  field: "instagram",
                },
                { icon: <FaFacebook />, label: "Facebook", field: "facebook" },
              ].map((item) => (
                <Input
                  key={item.field}
                  addonBefore={item.icon}
                  placeholder={`${item.label} handle`}
                  value={
                    (profileData.links as { [key: string]: string })[
                      item.field
                    ] || ""
                  }
                  style={{
                    marginBottom: item.field === "facebook" ? "0px" : "20px",
                  }}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    const urlRegex =
                      /^(?:(?:(?:https?|ftp):)?\/\/)?(?:(?:[\w-]+\.)+[a-z]{2,})(?:\/.*|$)$/i;
                    if (!urlRegex.test(inputValue)) {
                      setProfileData({
                        ...profileData,
                        links: {
                          ...profileData.links,
                          [item.field]: inputValue,
                        },
                      });
                    }
                  }}
                  allowClear
                />
              ))}
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </>
  );
}

export default EditProfileModal;
