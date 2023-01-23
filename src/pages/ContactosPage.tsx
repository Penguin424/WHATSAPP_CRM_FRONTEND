import { Button, DatePicker, Divider, Modal, Select, Table, Tag } from "antd";
import React, { useContext, useEffect, useState } from "react";
import useHttp from "../hooks/useHttp";
import moment from "moment";
import { RangeValue } from "rc-picker/lib/interface";
import type { ColumnsType } from "antd/lib/table";
import { colorsCosbiome } from "../constants/colorSchemas";
import ChatComponent from "../components/ChatComponent";
import { IChatsDB } from "../interfaces/Chats";
import { IUsuarioDB } from "../interfaces/Usuarios";
import Swal from "sweetalert2";
import { GlobalContext } from "../providers/GlobalProvider";
import { strapiFlatten } from "../utils/flatten";

const ContactosPage = () => {
  const [chats, setChats] = useState<IChatsDB[]>([]);
  const [openChatModal, setOpenChatModal] = useState<boolean>(false);
  const [openAsignarModal, setOpenAsignarModal] = useState<boolean>(false);
  const [selectChat, setSelectChat] = useState<IChatsDB | undefined>();
  const [users, setUsers] = useState<IUsuarioDB[]>([]);
  const [userId, setUserId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const { get, update } = useHttp();
  const { socket } = useContext(GlobalContext);

  useEffect(() => {
    handleGetContactos([moment().subtract(1, "month"), moment()]);
    handleGetUsers();

    socket.on("chat:create", (data: IChatsDB) => {
      setChats((chats) => {
        const index = chats.findIndex((chat) => chat.id === data.id);

        if (index !== -1) return chats;

        return [...chats, data];
      });
    });

    socket.on("chat:update", (data) => {
      let faltten: IChatsDB;

      if (data.data) {
        faltten = strapiFlatten(data.data);
      } else {
        faltten = strapiFlatten(data);
      }

      setChats((chats) => {
        const index = chats.findIndex((chat) => chat.id === faltten.id);

        if (index === -1) return chats;

        chats[index] = faltten;

        return [...chats];
      });
    });

    return () => {
      socket.off("chat:create");
      socket.off("chat:update");
    };

    // eslint-disable-next-line
  }, []);

  const handleGetContactos = async (values: RangeValue<moment.Moment>) => {
    if (!values) return;

    const chatsDB = await get(
      `chats?filters[$and][0][createdAt][$gte]=${values[0]?.toISOString()}&filters[$and][1][createdAt][$lte]=${values[1]?.toISOString()}&sort=createdAt:DESC&populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`
    );

    console.log(chatsDB);

    setChats(chatsDB.data);
  };

  const handleGetUsers = async () => {
    const usersDB = await get("users");

    console.log(usersDB);

    setUsers(usersDB);
  };

  const handleAsignarVendedor = async () => {
    try {
      if (!selectChat) return;

      setIsLoading(true);

      const data = {
        vendedor: userId,
      };

      const chatUpdate = await update(
        `chats/${selectChat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
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
      setIsLoading(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salio mal!",
      });

      setOpenAsignarModal(false);
      setSelectChat(undefined);
      setUserId(0);
      setIsLoading(false);
    }
  };

  const handleAsignarVendedorFor = async () => {
    try {
      setIsLoading(true);
      const data = {
        vendedor: userId,
      };

      for (const id of selectedRowKeys) {
        await update(
          `chats/${id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
          {
            data: data,
          }
        );
      }

      Swal.fire({
        icon: "success",
        title: "Asignados",
        text: "Al vendedor seleccionado se le asignaron los chats seleccionados!",
      });

      setOpenAsignarModal(false);
      setSelectChat(undefined);
      setUserId(0);
      setIsLoading(false);
      setSelectedRowKeys([]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salio mal!",
      });

      setOpenAsignarModal(false);
      setSelectChat(undefined);
      setUserId(0);
      setIsLoading(false);
      setSelectedRowKeys([]);
    }
  };

  const columuns: ColumnsType<IChatsDB> = [
    {
      title: "ID",
      dataIndex: ["id"],
      key: "id",
      render: (value) => <Tag color="blue">{value}C</Tag>,
    },
    {
      title: "Nombre",
      dataIndex: ["cliente", "nombre"],
      key: "nombre",
    },
    {
      title: "Telefono",
      dataIndex: ["cliente", "telefono"],
      key: "telefono",
      render: (value: string) => value.substring(3).split("@")[0],
    },
    {
      title: "Ultimo mensaje",
      dataIndex: ["ultimo"],
      key: "ultimo",
    },
    {
      title: "Registro",
      dataIndex: ["createdAt"],
      key: "createdAt",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "Ultimo contacto",
      dataIndex: ["updatedAt"],
      key: "updatedAt",
      render: (value) => new Date(value).toLocaleString(),
    },
    {
      title: "Campaña",
      dataIndex: ["campana", "nombre"],
      key: "campana",
    },
    {
      title: "Etapa",
      dataIndex: ["etapa", "nombre"],
      key: "etapa",
    },
    {
      title: "Vendedor",
      dataIndex: ["vendedor", "username"],
      key: "vendedor",
      filters: users.map((user) => ({
        text: user.username,
        value: user.username,
      })),
      onFilter: (value, record) =>
        record.vendedor.username.indexOf(value as string) === 0,

      render: (value) => (value === null ? "Sin asignar" : value),
    },
    {
      title: "Acciones",
      dataIndex: ["vendedor", "username"],
      key: "acciones",
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
              loading={isLoading}
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
          {selectChat && (
            <ChatComponent chat={selectChat as unknown as IChatsDB} />
          )}
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

          {selectedRowKeys.length > 0 && (
            <div className="col-md-12">
              <div
                className="row mt-5"
                style={{
                  maxHeight: "10vh",
                }}
              >
                <div className="col-md-10">
                  <Select
                    value={userId}
                    placeholder="Selecciona un vendedor"
                    style={{ width: "100%" }}
                    onChange={(value) => {
                      setUserId(value);
                    }}
                  >
                    {users.map((user) => (
                      <Select.Option
                        key={`${user.id}-vendedor`}
                        value={user.id}
                      >
                        {user.username}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
                <div className="col-md-2">
                  <Button
                    loading={isLoading}
                    block
                    onClick={handleAsignarVendedorFor}
                    type="primary"
                    style={{
                      backgroundColor: colorsCosbiome.primary,
                      borderColor: colorsCosbiome.primary,
                    }}
                  >
                    Asignar: {selectedRowKeys.length}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div
            className="col-md-12 "
            style={{
              maxHeight: "70vh",
            }}
          >
            {}
            <Divider />
            <Table
              rowSelection={{
                selectedRowKeys,
                onChange: (selectedRowK, selectedRows) => {
                  setSelectedRowKeys(selectedRowK as number[]);
                },
              }}
              rowKey={(record) => record.id}
              columns={columuns}
              dataSource={chats}
              pagination={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactosPage;
