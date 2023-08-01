import React, { SetStateAction, useEffect, useRef, useState } from "react";
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
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import ImageCard from "../Gallery/ImageCard";

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

  const formSubmitHandler = (values: any) => {
    console.log({ values });
    const filteredTemporaryFiles: any = temporaryFiles?.map((file: any) => {
      return {
        uid: file.uid,
        name: file.name,
        attachmentType: file.attachmentType,
        attachmentUrl: file.attachmentUrl,
      };
    });
    setFileList((prevFiles) => [...prevFiles, ...filteredTemporaryFiles]);
    setTemporaryFiles([]);
    message.success("Files successfully uploaded!");
    uploadForm.resetFields();
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
    setTemporaryFiles([]);
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    fileList: temporaryFiles,
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

  const licenseOptions = [
    {
      label: "UDL Default Public",
      value: "default",
    },
    {
      label: "UDL Restricted Access",
      value: "access",
    },
    {
      label: "UDL Commercial Use - One Time",
      value: "commercial",
    },
    {
      label: "UDL Derivative Works - One Time Payment",
      value: "derivative",
    },
  ];

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
        <Button key="submit" type="primary" onClick={() => uploadForm.submit()}>
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
                  return <ImageCard key={index} attach={file} fromUploadZone />;
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
              label="Currencty"
              rules={[
                {
                  required: true,
                  message: "please select license!",
                },
              ]}
              style={{ marginBottom: 8 }}
              initialValue="default"
            >
              <Select placeholder="Select license" options={licenseOptions} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
