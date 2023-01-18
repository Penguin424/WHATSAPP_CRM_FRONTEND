import { MenuFoldOutlined } from "@ant-design/icons";
import { Drawer, Menu } from "antd";
import React from "react";
import { colorsCosbiome } from "../constants/colorSchemas";

interface IPropsDrawer {
  children: React.ReactNode;
}

const DrawerComponent = ({ children }: IPropsDrawer) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <MenuFoldOutlined
        style={{
          fontSize: "2.5rem",
          position: "absolute",
          top: "10px",
          right: "10px",
          color: colorsCosbiome.tertiary,
        }}
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="Cosbiome-cli"
        placement="left"
        closable={false}
        onClose={() => setOpen(false)}
        open={open}
        key="left"
      >
        <Menu>
          <Menu.Item key="1">Option 1</Menu.Item>
        </Menu>
      </Drawer>
      {children}
    </>
  );
};

export default DrawerComponent;
