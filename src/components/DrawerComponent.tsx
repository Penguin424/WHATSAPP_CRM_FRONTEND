import { MenuFoldOutlined } from "@ant-design/icons";
import { Drawer, Menu } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colorsCosbiome } from "../constants/colorSchemas";

interface IPropsDrawer {
  children: React.ReactNode;
}

const DrawerComponent = ({ children }: IPropsDrawer) => {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <MenuFoldOutlined
        style={{
          fontSize: "2.5rem",
          position: "fixed",
          top: "10px",
          left: "96%",
          color: colorsCosbiome.tertiary,
        }}
        onClick={() => setOpen(true)}
      />
      <Drawer
        title="COSBIOME CRM"
        placement="left"
        closable={false}
        onClose={() => setOpen(false)}
        open={open}
        key="left"
      >
        <Menu>
          <Menu.Item
            key="1"
            onClick={() => {
              navigate("/contactos");
            }}
          >
            CONTACTOS
          </Menu.Item>
          <Menu.Item
            key="2"
            onClick={() => {
              navigate("/crm");
            }}
          >
            CRM
          </Menu.Item>

          <Menu.Item
            key="3"
            onClick={() => {
              navigate("/campañas");
            }}
          >
            CAMPAÑAS
          </Menu.Item>
        </Menu>
      </Drawer>
      {children}
    </>
  );
};

export default DrawerComponent;
