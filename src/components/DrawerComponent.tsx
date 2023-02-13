import { MenuFoldOutlined } from "@ant-design/icons";
import { Drawer, Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colorsCosbiome } from "../constants/colorSchemas";
import { GlobalContext } from "../providers/GlobalProvider";

interface IPropsDrawer {
  children: React.ReactNode;
}

const DrawerComponent = ({ children }: IPropsDrawer) => {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { roleUser } = useContext(GlobalContext);

  return (
    <>
      <MenuFoldOutlined
        style={{
          fontSize: "2.5rem",
          position: "fixed",
          top: "10px",
          left: "96%",
          color: colorsCosbiome.tertiary,
          zIndex: 100,
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
            hidden={roleUser !== "ADMIN"}
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
            hidden={roleUser !== "ADMIN"}
            key="3"
            onClick={() => {
              navigate("/campañas");
            }}
          >
            CAMPAÑAS
          </Menu.Item>

          <Menu.Item
            hidden={roleUser !== "ADMIN"}
            key="4"
            onClick={() => {
              navigate("/contactodia");
            }}
          >
            CONTACTO DEL DÍA
          </Menu.Item>

          <SubMenu title="REPORTES" key="5">
            <Menu.Item
              key="5.1"
              onClick={() => {
                navigate("/reportes/calificacionesvendedor");
              }}
            >
              CALIFICACIONES
            </Menu.Item>
          </SubMenu>
        </Menu>
      </Drawer>
      {children}
    </>
  );
};

export default DrawerComponent;
