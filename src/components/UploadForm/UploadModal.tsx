import React, { SetStateAction, useRef, useState } from "react";
import {
  Button,
  Col,
  Form,
  Image,
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
import { arweave, getMimeType, licenseOptions } from "@/utils";
import { registerContract } from "@/lib/warp/asset";
import {
  UDL,
  APP_NAME,
  APP_VERSION,
  ATOMIC_ASSET_SRC,
} from "@/utils/constants";
import { useActiveAddress, useApi } from "arweave-wallet-kit";
import { ITag } from "@/types";

const { Dragger } = Upload;

export interface IUploadModalProps {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  fileList: UploadFile<any>[];
  setFileList: React.Dispatch<SetStateAction<UploadFile<any>[]>>;
}

export default function UploadModal({
  open,
  setOpen,
  fileList,
  setFileList,
}: IUploadModalProps) {
  const lockRef = useRef(false);
  const [uploadForm] = Form.useForm();
  const [temporaryFiles, setTemporaryFiles] = useState<any>([]);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const activeAddress = useActiveAddress();
  const walletApi = useApi();

  const handleLicenseChange = (value: string) => {
    setShowAmountInput(value !== "default");
  };

  const formSubmitHandler = async (image: {
    title: string;
    topics?: string;
    description: string;
    license: string;
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
        { name: "App-Name", value: "SmartWeaveContract" },
        { name: "App-Version", value: "0.3.0" },
        { name: "Content-Type", value: contentType },
        { name: "Indexed-By", value: "ucm" },
        { name: "License", value: UDL },
        { name: "Payment-Mode", value: "Global-Distribution" },
        { name: "Title", value: image.title },
        { name: "Description", value: image.description },
        { name: "Type", value: "image" },
        { name: "Protocol", value: `${APP_NAME}-Post-v${APP_VERSION}` },
        { name: "Published", value: published.toString() },
        {
          name: "Contract-Manifest",
          value:
            '{"evaluationOptions":{"sourceType":"redstone-sequencer","allowBigInt":true,"internalWrites":true,"unsafeClient":"skip","useConstructor":true}}',
        },
        { name: "Contract-Src", value: ATOMIC_ASSET_SRC },
        {
          name: "Init-State",
          value: JSON.stringify({
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
        },
      ].concat(topics);

      if (image.license === "access") {
        tags = tags.concat([
          { name: "Access", value: "Restricted" },
          { name: "Access-Fee", value: "One-Time-" + image.payment },
        ]);
      }
      if (image.license === "derivative") {
        tags = tags.concat([
          { name: "Derivation", value: "Allowed-with-license-fee" },
          { name: "Derivation-Fee", value: "One-Time-" + image.payment },
        ]);
      }
      if (image.license === "commercial") {
        tags = tags.concat([
          { name: "Commercial-Use", value: "Allowed" },
          { name: "Commercial-Fee", value: "One-Time-" + image.payment },
        ]);
      }
      const data = await new Response(image.files.file).arrayBuffer();
      const transaction = await arweave.createTransaction({ data });
      tags.forEach((tag) => transaction.addTag(tag.name, tag.value));

      await walletApi?.sign(transaction);
      const response = await walletApi?.dispatch(transaction);
      if (response?.id) {
        const contractTxId = await registerContract(response?.id);
        setTemporaryFiles([]);
        message.success("Image uploaded succesfully!");
        uploadForm.resetFields();
        setOpen(false);
        setShowAmountInput(false);
      } else {
        throw new Error("Image upload error");
      }
    } catch (error) {
      console.log(error);
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
              <Image.PreviewGroup>
                {temporaryFiles?.map((file: any, index: number) => {
                  return <ImageCard key={index} attach={file} />;
                })}
              </Image.PreviewGroup>
            </Row>
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
                options={licenseOptions}
                onChange={handleLicenseChange}
              />
            </Form.Item>
            {showAmountInput && (
              <Form.Item
                label="Payment"
                name="payment"
                rules={[{ required: showAmountInput }]}
              >
                <Input placeholder="Amount in $AR" type="number" />
              </Form.Item>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
