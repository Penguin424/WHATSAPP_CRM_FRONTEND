import {
  Avatar,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
} from "antd";
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
import _ from "lodash";
import { ICampanasDB } from "../interfaces/Camapanas";
import nofoto from "../assets/images/nofoto.jpeg";

interface IFormDataAddUser {
  nombre: string;
  telefono: string;
  campana: number;
}

const ContactosPage = () => {
  const [chats, setChats] = useState<IChatsDB[]>([]);
  const [openChatModal, setOpenChatModal] = useState<boolean>(false);
  const [openAsignarModal, setOpenAsignarModal] = useState<boolean>(false);
  const [selectChat, setSelectChat] = useState<IChatsDB | undefined>();
  const [users, setUsers] = useState<IUsuarioDB[]>([]);
  const [userId, setUserId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [openAddUser, setOpenAddUser] = useState<boolean>(false);
  const [campanas, setCampanas] = useState<ICampanasDB[]>([]);

  const { get, update, post } = useHttp();
  const { socket } = useContext(GlobalContext);
  const [form] = Form.useForm();

  useEffect(() => {
    handleGetContactos([moment().subtract(1, "month"), moment()]);
    handleGetUsers();
    handleGetCampanas();

    socket.on("chat:create", (dat: any) => {
      let data: IChatsDB;

      if (dat.data) {
        data = strapiFlatten(dat.data);
      } else {
        data = strapiFlatten(dat);
      }

      setChats((chats) => {
        const index = chats.findIndex((chat) => chat.id === data.id);

        if (index !== -1) return chats;

        return [data, ...chats];
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

      setSelectChat((selectChat) => {
        if (!selectChat) return selectChat;

        if (selectChat.id === faltten.id) {
          return faltten;
        }

        return selectChat;
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
      `chats?filters[$and][0][createdAt][$gte]=${values[0]
        ?.startOf("D")
        .toISOString()}&filters[$and][1][createdAt][$lte]=${values[1]
        ?.endOf("D")
        .toISOString()}&sort=createdAt:DESC&populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas&pagination[limit]=100000&filters[$and][2][cliente][nombre][$notNull]=true`
    );

    setChats(chatsDB.data);
  };

  const handleGetCampanas = async () => {
    const campanasDB: { data: ICampanasDB[] } = await get(
      "campanas?pagination[limit]=100000&populate[0]=etapas"
    );

    setCampanas(campanasDB.data);
  };

  const handleGetUsers = async () => {
    const usersDB = await get("users?pagination[limit]=100000");

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

  const handleFinish = async (data: IFormDataAddUser) => {
    try {
      setIsLoading(true);

      const cliente = await get(
        `clientes?filters[telefono][$contains]=${data.telefono}`
      );

      if (cliente.data.length > 0) {
        setIsLoading(false);
        form.resetFields();

        return Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El cliente ya existe!",
        });
      }

      const clienteDB: { data: { id: number } } = await post("clientes", {
        data: {
          nombre: data.nombre,
          telefono: `${data.telefono}@c.us`,
        },
      });

      await post(
        "chats?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas",
        {
          data: {
            cliente: clienteDB.data.id,
            campana: data.campana,
            etapa: campanas.filter((campana) => campana.id === data.campana)[0]
              .etapas[0].id,
            ultimo: "Nuevo cliente",
          },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Creado",
        text: "El chat se creo correctamente!",
      });

      setIsLoading(false);
      form.resetFields();
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salio mal!",
      });
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
      title: "Foto",
      dataIndex: ["foto"],
      key: "foto",
      render: (value: string) => {
        console.log(value);

        return (
          <Avatar
            size={50}
            src={value ? value : nofoto}
            style={{ backgroundColor: "#87d068" }}
          />
        );
      },
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
      filters: _.uniqBy(
        chats.map((chat) => chat.campana).filter((campana) => campana !== null),
        "nombre"
      ).map((campana) => ({
        text: campana.nombre,
        value: campana.nombre,
      })),
      onFilter: (value, record) => {
        if (record.campana === null) return false;
        return record.campana.nombre.indexOf(value as string) === 0;
      },
    },
    {
      title: "Etapa",
      dataIndex: ["etapa", "nombre"],
      key: "etapa",
      filters: _.uniqBy(
        chats.map((chat) => chat.etapa).filter((etapa) => etapa !== null),
        "nombre"
      ).map((etapa) => ({
        text: etapa.nombre,
        value: etapa.nombre,
      })),
      onFilter: (value, record) => {
        if (record.etapa === null) return false;
        return record.etapa.nombre.indexOf(value as string) === 0;
      },
    },
    {
      title: "Vendedor",
      dataIndex: ["vendedor", "username"],
      key: "vendedor",
      filters: [
        {
          text: "Sin asignar",
          value: "Sin asignar",
        },
        ...users.map((user) => ({
          text: user.username,
          value: user.username,
        })),
      ],
      onFilter: (value, record) => {
        if (value !== "Sin asignar" && record.vendedor === null) return false;

        if (value === "Sin asignar" && !record.vendedor) return true;
        return record.vendedor.username.indexOf(value as string) === 0;
      },

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

      <Modal
        width="80%"
        title="Información del chat"
        open={openAddUser}
        onCancel={() => setOpenAddUser(false)}
        footer={null}
      >
        <div className="row">
          <div className="col-md-12">
            <Form onFinish={handleFinish} layout="vertical" form={form}>
              <Form.Item
                label="Nombre"
                name="nombre"
                rules={[
                  {
                    required: true,
                    message: "El nombre es requerido",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Telefono"
                name="telefono"
                rules={[
                  {
                    required: true,
                    message: "El telefono es requerido",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="camapaña"
                name="campana"
                rules={[
                  {
                    required: true,
                    message: "La camapaña es requerida",
                  },
                ]}
              >
                <Select>
                  {campanas.length > 0 &&
                    campanas.map((campana) => (
                      <Select.Option key={campana.id} value={campana.id}>
                        {campana.nombre}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
              <Button
                loading={isLoading}
                className="mt-2"
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: colorsCosbiome.primary,

                  borderColor: colorsCosbiome.primary,
                }}
                block
              >
                Agregar
              </Button>
            </Form>
          </div>
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
        <h1 className="text-center">Contactos: {chats.length}</h1>

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

          <div className="col-md-12 mt-5 mb-5">
            <Button
              onClick={() => {
                setOpenAddUser(true);
              }}
              type="primary"
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
              }}
            >
              Agregar contacto
            </Button>
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
              scroll={{ y: "50vh" }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactosPage;
