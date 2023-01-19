import { Button, DatePicker, Modal, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import useHttp from "../hooks/useHttp";
import moment from "moment";
import { RangeValue } from "rc-picker/lib/interface";
import { ColumnsType } from "antd/lib/table";
import { IContactosDB } from "../interfaces/Contactos";
import { colorsCosbiome } from "../constants/colorSchemas";
import ChatComponent from "../components/ChatComponent";
import { Datum } from "../interfaces/Chats";
import { IUsuarioDB } from "../interfaces/Usuarios";
import Swal from "sweetalert2";

const ContactosPage = () => {
  const [chats, setChats] = useState<IContactosDB[]>([]);
  const [openChatModal, setOpenChatModal] = useState<boolean>(false);
  const [openAsignarModal, setOpenAsignarModal] = useState<boolean>(false);
  const [selectChat, setSelectChat] = useState<IContactosDB | undefined>();
  const [users, setUsers] = useState<IUsuarioDB[]>([]);
  const [userId, setUserId] = useState<number>(0);

  const { get, update } = useHttp();

  useEffect(() => {
    handleGetContactos([moment().subtract(1, "day"), moment()]);
    handleGetUsers();
  }, []);

  const handleGetContactos = async (values: RangeValue<moment.Moment>) => {
    if (!values) return;

    const chatsDB = await get(
      `chats?filters[$and][0][createdAt][$gte]=${values[0]?.toISOString()}&filters[$and][1][createdAt][$lte]=${values[1]?.toISOString()}&sort=createdAt:DESC&populate[0]=vendedor&populate[1]=cliente`
    );

    setChats(chatsDB.data);
  };

  const handleGetUsers = async () => {
    const usersDB = await get("users");

    setUsers(usersDB);
  };

  const handleAsignarVendedor = async () => {
    try {
      if (!selectChat) return;

      const data = {
        vendedor: 1,
      };

      const chatUpdate = await update(
        `chats/${selectChat.id}?populate[0]=vendedor&populate[1]=cliente`,
        {
          data: data,
        }
      );

      setChats((chats) => {
        const index = chats.findIndex((chat) => chat.id === chatUpdate.id);

        if (index === -1) return chats;

        chats[index] = chatUpdate;

        return [...chats];
      });

      Swal.fire({
        icon: "success",
        title: "Asignado",
        text: "Vendedor asignado correctamente!",
      });

      setOpenAsignarModal(false);
      setSelectChat(undefined);
      setUserId(0);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salio mal!",
      });

      setOpenAsignarModal(false);
      setSelectChat(undefined);
      setUserId(0);
    }
  };

  const columuns: ColumnsType<IContactosDB> = [
    {
      title: "Nombre",
      dataIndex: ["attributes", "cliente", "data", "attributes", "nombre"],
      key: "id",
    },
    {
      title: "Ultimo mensaje",
      dataIndex: ["attributes", "ultimo"],
      key: "id",
    },
    {
      title: "Registro",
      dataIndex: ["attributes", "createdAt"],

      key: "id",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "Ultimo contacto",
      dataIndex: ["attributes", "updatedAt"],

      key: "id",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "Vendedor",
      dataIndex: ["attributes", "vendedor", "data", "attributes", "username"],
      key: "id",
      render: (value) => (value === null ? "Sin asignar" : value),
    },
    {
      title: "Acciones",
      dataIndex: ["attributes", "vendedor", "data", "attributes", "username"],
      key: "id",
      render: (value, record) => {
        return (
          <>
            <Button
              type="primary"
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
              }}
              onClick={() => {
                setSelectChat(record);
                setOpenAsignarModal(true);
              }}
            >
              Asignar
            </Button>
            <br />
            <Button
              className="mt-2"
              type="primary"
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
              }}
              onClick={() => {
                setSelectChat(record);
                setOpenChatModal(true);
              }}
            >
              Chat
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <>
      <Modal
        width="40%"
        title="Asignar vendedor"
        open={openAsignarModal}
        onCancel={() => setOpenAsignarModal(false)}
        footer={null}
      >
        <div className="row">
          <div className="col-md-12">
            <Select
              value={userId}
              placeholder="Selecciona un vendedor"
              style={{ width: "100%" }}
              onChange={(value) => {
                setUserId(value);
              }}
            >
              {users.map((user) => (
                <Select.Option key={`${user.id}-vendedor`} value={user.id}>
                  {user.username}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div className="col-md-12">
            <Button
              onClick={handleAsignarVendedor}
              className="mt-2"
              type="primary"
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
              }}
              block
            >
              Asignar
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        width="80%"
        title="Información del chat"
        open={openChatModal}
        onCancel={() => setOpenChatModal(false)}
        footer={null}
        style={{
          top: 10,
        }}
      >
        <div
          style={{
            height: "80vh",
          }}
        >
          <ChatComponent chat={selectChat as Datum} />
        </div>
      </Modal>

      <div
        className="container-fluid"
        style={{
          backgroundColor: "white",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxHeight: "100vh",
        }}
      >
        <h1 className="text-center">Contactos</h1>

        <div className="row">
          <div
            className="col-md-12"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DatePicker.RangePicker onChange={handleGetContactos} />
          </div>

          <div
            className="col-md-12 mt-5"
            style={{
              maxHeight: "70vh",
            }}
          >
            <Table columns={columuns} dataSource={chats} pagination={false} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactosPage;
