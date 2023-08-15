import React, { SetStateAction, useEffect, useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  Image as IImage,
  Input,
  Modal,
  Row,
  Select,
  Upload,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import ImageCard from "../Cards/ImageCard";
import {
  arweave,
  currencyOptions,
  getMimeType,
  licenseOptionsWithRestriction,
} from "@/utils";
import { uploadAtomicAsset } from "@/lib/warp/asset";
import { UDL, APP_NAME, APP_VERSION, PUBLIC_KEY } from "@/utils/constants";
import { useActiveAddress, useApi } from "arweave-wallet-kit";
import { IPost, ITag } from "@/types";
import { addWaterMark } from "@/lib/watermark";
import { encryptFile } from "@/lib/cryptography/web";
import { useConnectedUserStore } from "@/lib/store";
import { dispatchTransaction } from "@/lib/arconnect";

const { Dragger } = Upload;

export interface IUploadModalProps {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  fetchPosts: () => Promise<void>;
}

export default function UploadModal({
  open,
  setOpen,
  fetchPosts,
}: IUploadModalProps) {
  const lockRef = useRef(false);
  const [uploadForm] = Form.useForm();
  const [temporaryFiles, setTemporaryFiles] = useState<any>([]);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const activeAddress = useActiveAddress();
  const walletApi = useApi();
  const { userAccount } = useConnectedUserStore();
  const [watermarkImage, setWatermarkImage] = useState<ArrayBufferLike>();
  const [license, setLicense] = useState("");
  const canvasRef = useRef(null);

  const handleResetCanvas = () => {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleLicenseChange = (value: string) => {
    setShowAmountInput(value !== "default");
    setLicense(value);
  };

  const formSubmitHandler = async (image: {
    title: string;
    topics?: string;
    description: string;
    license: string;
    currency: string;
    payment?: string;
    files: { file: File };
  }) => {
    setIsLoading(true);
    try {
      let topics: ITag[] = [];
      if (image.topics) {
        topics = image.topics.split(",").map((topic) => {
          topic = topic.trim();
          return { name: `topic:${topic}`, value: topic };
        });
      }
      const published = new Date().getTime();
      const contentType = await getMimeType(image.files.file);
      let tags = [
        { name: "Indexed-By", value: "ucm" },
        { name: "License", value: UDL },
        { name: "Payment-Mode", value: "Global-Distribution" },
        { name: "Title", value: image.title },
        { name: "Description", value: image.description },
        { name: "Type", value: "image" },
        { name: "Protocol", value: `${APP_NAME}-Post-v${APP_VERSION}` },
        { name: "Published", value: published.toString() },
      ].concat(topics);

      let watermarkTxId: any;

      if (image.license === "access") {
        const watermarkTx = await arweave.createTransaction({
          data: watermarkImage,
        });
        watermarkTx.addTag("Content-Type", contentType);
        const response = await dispatchTransaction(watermarkTx, walletApi);

        watermarkTxId = response?.id;

        tags = tags.concat([
          { name: "Access", value: "Restricted" },
          { name: "Preview", value: response?.id as string },
        ]);
      }

      if (image.license === "derivative-credit") {
        tags.push({ name: "Derivation", value: "Allowed-with-credit" });
      }

      if (image.license === "derivative-indication") {
        tags.push({
          name: "Derivation",
          value: "Allowed-with-indication",
        });
      }

      if (image.license === "commercial") {
        tags.push({ name: "Commercial-Use", value: "Allowed" });
      }

      if (image.license === "commercial-credit") {
        tags.push({ name: "Commercial-Use", value: "Allowed-with-credit" });
      }

      if (image.payment) {
        tags.push({ name: "License-Fee", value: "One-Time-" + image.payment });
      }

      if (image.currency && image.currency !== "U") {
        tags.push({ name: "Currency", value: image.currency });
      }
      let data = await new Response(image.files.file).arrayBuffer();

      if (image.license === "access") {
        const { encryptedData } = await encryptFile(
          image.files.file,
          PUBLIC_KEY
        );
        data = encryptedData;
      }
      const response = await uploadAtomicAsset(
        tags,
        JSON.stringify({
          title: image.title,
          description: image.description,
          creator: activeAddress,
          claimable: [],
          ticker: "ATOMIC-POST",
          name: image.title,
          balances: {
            [activeAddress as string]: 100,
          },
          emergencyHaltWallet: activeAddress as string,
          contentType,
          published,
          settings: [["isTradeable", true]],
          transferable: true,
        }),
        { "Content-Type": contentType, body: Buffer.from(data) }
      );
      if (response?.id) {
        await fetchPosts();
        setTemporaryFiles([]);
        message.success("Image uploaded succesfully!");
        uploadForm.resetFields();
        setOpen(false);
        setShowAmountInput(false);
      } else {
        throw new Error("Image upload error");
      }
    } catch (error) {
      console.log("error: ", error);
      message.error({
        content: "Image upload error",
      });
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setTemporaryFiles([]);
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    fileList: temporaryFiles,
    accept: "image/*",
    showUploadList: false,
    beforeUpload: () => false,
    onChange: async (info: any) => {
      if (lockRef.current) return;
      lockRef.current = true;
      const newFiles = info.fileList.filter(
        (infoUid: any) => infoUid?.attachmentType !== "uploadType"
      );

      const newFileInfos = newFiles.map((file: UploadFile) => {
        const thumbnailUrl = URL.createObjectURL(file.originFileObj as RcFile);
        return {
          file: file,
          uid: file.uid,
          name: file.name,
          attachmentType: "uploadType",
          attachmentUrl: thumbnailUrl,
        };
      });
      await setTemporaryFiles((prevFiles: UploadFile<any>[]) => [
        ...prevFiles,
        ...newFileInfos,
      ]);
      lockRef.current = false;
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  useEffect(() => {
    if (temporaryFiles.length > 0 && !watermarkImage && license === "access") {
      (async () => {
        const bufferData = await addWaterMark(
          temporaryFiles[0].file.originFileObj,
          userAccount?.profile.name ?? "BuyMeaStorage"
        );
        setWatermarkImage(bufferData);
      })();
    } else if (license !== "access") {
      handleResetCanvas();
      setWatermarkImage(undefined);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporaryFiles.length, license]);

  return (
    <Modal
      open={open}
      width="50vw"
      title="Upload Zone"
      onCancel={handleCancel}
      centered
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => uploadForm.submit()}
          loading={isLoading}
        >
          Submit
        </Button>,
      ]}
    >
      <Form
        form={uploadForm}
        layout="vertical"
        preserve={false}
        onFinish={formSubmitHandler}
      >
        <Row gutter={[16, 16]}>
          <Col md={12} xs={24}>
            <Form.Item style={{ marginBottom: 8 }} name="files">
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
            </Form.Item>
            <Row gutter={[8, 8]} style={{ padding: 8 }}>
              <IImage.PreviewGroup>
                {temporaryFiles?.map((file: any, index: number) => {
                  return <ImageCard key={index} attach={file} />;
                })}
              </IImage.PreviewGroup>
            </Row>

            <div
              style={{
                width: "160px ",
                height: "auto",
              }}
            >
              <canvas
                ref={canvasRef}
                id="canvas"
                style={{ maxWidth: "100%" }}
              ></canvas>
            </div>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                {
                  required: true,
                  message: "Title should not be empty!",
                },
              ]}
              style={{ marginBottom: 8 }}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              style={{ marginBottom: 8 }}
              rules={[{ required: true }]}
            >
              <Input.TextArea
                placeholder="Enter description"
                autoSize={{ minRows: 3, maxRows: 5 }}
              />
            </Form.Item>
            <Form.Item
              name="topics"
              label="Topics"
              help="Enter a comma-separated list topics"
              style={{ marginBottom: 8 }}
            >
              <Input.TextArea
                placeholder="Enter topics"
                autoSize={{ minRows: 2, maxRows: 3 }}
              />
            </Form.Item>
            <Form.Item
              name="license"
              label="License"
              rules={[
                {
                  required: true,
                  message: "please select license!",
                },
              ]}
              style={{ marginBottom: 8 }}
              initialValue="default"
            >
              <Select
                placeholder="Select license"
                options={licenseOptionsWithRestriction}
                onChange={handleLicenseChange}
              />
            </Form.Item>
            {showAmountInput && (
              <>
                <Form.Item
                  label="Currency"
                  name="currency"
                  rules={[{ required: showAmountInput }]}
                  initialValue="U"
                >
                  <Select
                    placeholder="Select currency"
                    options={currencyOptions}
                  />
                </Form.Item>
                <Form.Item
                  label="Payment"
                  name="payment"
                  rules={[{ required: showAmountInput }]}
                >
                  <Input placeholder="Amount in AR or U" type="number" />
                </Form.Item>
              </>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
