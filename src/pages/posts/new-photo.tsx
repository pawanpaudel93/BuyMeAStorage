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
  Space,
  Upload,
  message,
} from "antd";
import { InboxOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import ImageCard from "@/components/Gallery/ImageCard";
import { useRouter } from "next/router";

const { Dragger } = Upload;

export default function NewPhoto() {
  const [photoForm] = Form.useForm();
  const lockRef = useRef(false);
  const router = useRouter();
  const [fileList, setFileList] = useState<any>([]);

  const formSubmitHandler = (values: any) => {
    console.log({ values });

    setFileList([]);
    message.success("Files successfully uploaded!");
    photoForm.resetFields();
  };

  const resetHandler = () => {
    photoForm.resetFields();
    setFileList([]);
  };

  const props: UploadProps = {
    name: "file",
    multiple: false,
    fileList: fileList,
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
      await setFileList((prevFiles: UploadFile<any>[]) => [
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
    <Row style={{ width: "100%", padding: "16px 24px" }}>
      <Form
        form={photoForm}
        layout="vertical"
        preserve={false}
        onFinish={formSubmitHandler}
        style={{ width: "100%" }}
      >
        <Row style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/posts")}
          >
            Go Back
          </Button>
        </Row>
        <Row gutter={[16, 16]}>
          <Col md={24} xs={24}>
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
                {fileList?.map((file: any, index: number) => {
                  return <ImageCard key={index} attach={file} />;
                })}
              </Image.PreviewGroup>
            </Row>
          </Col>
          <Col md={24} xs={24}>
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
              <Select placeholder="Select license" options={licenseOptions} />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end" style={{ marginTop: 12 }}>
          <Space>
            <Button onClick={resetHandler}>Reset</Button>
            <Button type="primary" onClick={() => photoForm.submit()}>
              Publish
            </Button>
          </Space>
        </Row>
      </Form>
    </Row>
  );
}
