import React, { useState, useEffect } from "react";
import { Button, Col, Form, Input, Row, Select, Space, Image } from "antd";
import domtoimage from "dom-to-image";
import { withPrivateRoutes } from "@/hoc";

const GenerateButtons = () => {
  const [buttonColor, setButtonColor] = useState("#00ff04");
  const [buttonText, setButtonText] = useState("Buy me a storage");
  const [buttonFontColor, setButtonFontColor] = useState("black");
  const [buttonFontFamily, setButtonFontFamily] = useState("Arial");
  const [buttonFontSize, setButtonFontSize] = useState(52);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const red = parseInt(buttonColor.slice(1, 3), 16);
    const green = parseInt(buttonColor.slice(3, 5), 16);
    const blue = parseInt(buttonColor.slice(5, 7), 16);
    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;
    setButtonFontColor(brightness < 128 ? "white" : "black");
  }, [buttonColor]);

  const handleDownloadClick = () => {
    setIsLoading(true);
    const element = document.getElementById("buttonToDownload");

    if (element) {
      domtoimage.toPng(element).then(function (dataUrl) {
        const link = document.createElement("a");
        link.download = "logo.png";
        link.href = dataUrl;
        link.click();
      });
    }
    setIsLoading(false);
  };

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino Linotype",
    "Impact",
    "Comic Sans MS",
  ];

  return (
    <Space
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginTop: "50px",
      }}
    >
      <Button
        style={{
          backgroundColor: buttonColor,
          color: buttonFontColor,
          fontFamily: buttonFontFamily,
          fontSize: buttonFontSize,
          height: "153px",
          width: "auto",
          borderRadius: "4px",
          display: "flex",
          flexDirection: "row",
          gap: "12px",
          justifyContent: "center",
          alignItems: "center",
        }}
        id="buttonToDownload"
        onClick={() => {}}
        loading={isLoading}
      >
        <Image src="/icon.svg" preview={false} height={100} alt="" />
        <span>{buttonText}</span>
      </Button>
      <Row justify="center" align="middle">
        <Col span={24} style={{ marginTop: 20 }}>
          <Form>
            <Form.Item label="Button Text">
              <Input
                placeholder="Enter button text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                maxLength={30}
              />
            </Form.Item>

            <Form.Item label="Button Font Size">
              <Input
                type="number"
                value={buttonFontSize}
                onChange={(e) => setButtonFontSize(parseInt(e.target.value))}
                style={{ height: "36px" }}
              />
            </Form.Item>

            <Form.Item label="Button Color">
              <Input
                type="color"
                value={buttonColor}
                onChange={(e) => setButtonColor(e.target.value)}
                style={{ height: "36px" }}
              />
            </Form.Item>

            <Form.Item label="Button Font Family">
              <Select
                value={buttonFontFamily}
                onChange={(value) => setButtonFontFamily(value)}
              >
                {fontFamilies.map((family) => (
                  <Select.Option key={family} value={family}>
                    {family}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Col>

        <Col span={24} style={{ marginTop: 20, textAlign: "center" }}>
          <Button
            type="primary"
            onClick={handleDownloadClick}
            loading={isLoading}
          >
            Download
          </Button>
        </Col>
      </Row>
    </Space>
  );
};

export default withPrivateRoutes(GenerateButtons);
