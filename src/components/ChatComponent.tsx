import {
  EditFilled,
  Loading3QuartersOutlined,
  SmileOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Modal, Form, Input, Button, Select } from "antd";
import EmojiPicker from "emoji-picker-react";
import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { ICampanasDB } from "../interfaces/Camapanas";
import { IChatsDB } from "../interfaces/Chats";
import { IMessagesDB } from "../interfaces/Messages";
import { GlobalContext } from "../providers/GlobalProvider";
import { strapiFlatten } from "../utils/flatten";
import AudioComponent from "./AudioComponent";
import MediaTableComponent from "./MediaTableComponent";
import VideoComponent from "./VideoComponent";

interface IPropsChatComponent {
  chat: IChatsDB;
}

const ChatComponent = ({ chat }: IPropsChatComponent) => {
  const [messages, setMessages] = useState<IMessagesDB[]>([]);
  const [redaction, setRedaction] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);
  const [openFiles, setOpenFiles] = useState<boolean>(false);
  const [campanas, setCampanas] = useState<ICampanasDB[]>([]);
  const [, setUpdate] = useState({});

  const chatRef = React.useRef<HTMLDivElement>(null);

  const { socket } = useContext(GlobalContext);
  const { get, post, update } = useHttp();
  const [form] = Form.useForm();

  useEffect(() => {
    handleGetMessages();
    handleGetCampanas();

    socket.on("mensaje:create", (data: IMessagesDB) => {
      console.log("data", data);

      const flatten: IMessagesDB = strapiFlatten(data);

      if (
        flatten.de === chat.cliente.telefono ||
        flatten.a === chat.cliente.telefono
      ) {
        setMessages((prev) => {
          if (!prev) return prev;

          return [flatten, ...prev];
        });
      }
    });

    return () => {
      socket.off("mensaje:create");
    };

    // eslint-disable-next-line
  }, [socket, chat]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "auto",
      });
    }
    // eslint-disable-next-line
  }, [messages]);

  const handleGetCampanas = async () => {
    const campanasDB: { data: ICampanasDB[] } = await get(
      "campanas?populate[0]=etapas&populate[1]=chats&populate[2]=chats.etapa"
    );

    setCampanas(campanasDB.data);
  };

  const handleGetMessages = async () => {
    const messages = await get(
      `mensajes?filters[chat][id][$eq]=${chat.id}&populate[chat][id]&sort=createdAt:DESC`
    );

    console.log("messages", messages);

    setMessages(messages.data);
  };

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      await post("mensajes", {
        mensaje: redaction,
        a: chat.cliente.telefono,
        de: "5213319747514@c.us",
        vendedor: 1,
        chat: chat.id,
        isMedia: false,
      });

      setRedaction("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al enviar mensaje",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleUpdateClient = async (values: { nombre: string }) => {
    try {
      await update(`clientes/${chat.cliente.id}`, {
        data: {
          nombre: values.nombre,
        },
      });

      chat.cliente.nombre = values.nombre;

      await Swal.fire({
        icon: "success",
        title: "Cliente actualizado",
        showConfirmButton: false,
        timer: 1500,
      });

      setOpen(false);
      form.resetFields();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  return (
    <>
      <Modal
        title="Archivos"
        open={openFiles}
        onCancel={() => setOpenFiles(false)}
        footer={null}
        width="80%"
      >
        <MediaTableComponent chat={chat} />
      </Modal>
      {isEmoji && (
        <div
          style={{
            position: "absolute",
            right: "15%",
            bottom: "10%",
          }}
        >
          <EmojiPicker
            onEmojiClick={(value) => {
              setRedaction(redaction + value.emoji);
            }}
          />
        </div>
      )}
      <Modal
        open={open}
        title={`MODIFICAR CONTADO DE ${chat.cliente.nombre.toUpperCase()}`}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1000}
      >
        <Form
          onFinish={handleUpdateClient}
          form={form}
          layout="vertical"
          initialValues={{
            nombre: chat.cliente.nombre,
          }}
        >
          <Form.Item
            label="nombre"
            rules={[
              {
                required: true,
                message: "Este campo es requerido",
              },
            ]}
            name="nombre"
          >
            <Input />
          </Form.Item>
          <Button block type="primary" htmlType="submit">
            Actuilizar
          </Button>
        </Form>
      </Modal>

      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: colorsCosbiome.secondary,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "10%",
            width: "100%",
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            border: `1px solid ${colorsCosbiome.primary}`,
            //sombra en la parde de abajo
            boxShadow: `0px 0px 10px 0px ${colorsCosbiome.primary}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "33%",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "80%",
              }}
              className="mr-1 ml-1"
            >
              <label
                style={{
                  color: "white",
                }}
                htmlFor="campana"
              >
                Campaña
              </label>
              <Select
                value={chat.campana && chat.campana.id}
                onChange={async (value) => {
                  try {
                    await update(
                      `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
                      {
                        data: {
                          campana: value,
                          etapa: campanas.find(
                            (campana) => campana.id === value
                          )!.etapas[0].id,
                        },
                      }
                    );

                    Swal.fire({
                      icon: "success",
                      title: "Campaña actualizada",
                      showConfirmButton: false,
                      timer: 1500,
                    });

                    setUpdate({});
                  } catch (error) {
                    Swal.fire({
                      icon: "error",
                      title: "Error al actualizar",
                      showConfirmButton: false,
                      timer: 1500,
                    });
                  }
                }}
              >
                {campanas.map((campana) => {
                  return (
                    <Select.Option value={campana.id} key={campana.id}>
                      {campana.nombre}
                    </Select.Option>
                  );
                })}
              </Select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "80%",
              }}
            >
              <label
                style={{
                  color: "white",
                }}
                htmlFor="etapa"
              >
                Etapa
              </label>
              {chat.campana && (
                <Select
                  value={chat.etapa.id}
                  onChange={async (value) => {
                    try {
                      await update(
                        `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
                        {
                          data: {
                            etapa: value,
                          },
                        }
                      );
                      await Swal.fire({
                        icon: "success",
                        title: "Etapa actualizada",
                        showConfirmButton: false,
                        timer: 1500,
                      });

                      setUpdate({});
                    } catch (error) {
                      Swal.fire({
                        icon: "error",

                        title: "Error al actualizar",
                        showConfirmButton: false,
                        timer: 1500,
                      });
                    }
                  }}
                >
                  {chat.campana.etapas.map((etapa) => {
                    return (
                      <Select.Option value={etapa.id} key={etapa.id}>
                        {etapa.nombre}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "33%",
            }}
          >
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
              }}
              className="text-center"
            >
              {chat.cliente.nombre}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "33%",
            }}
          >
            <EditFilled
              onClick={() => {
                setOpen(true);
                form.setFieldsValue({
                  nombre: chat.cliente.nombre,
                });
              }}
              style={{
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "white",
              }}
            />
          </div>
        </div>

        <div
          ref={chatRef}
          style={{
            height: "80%",
            width: "100%",
            //   backgroundColor: "green",
            overflowY: "scroll",
            maxHeight: "83%",
            scrollBehavior: "smooth",
          }}
        >
          {messages.length === 0 ? (
            <Loading3QuartersOutlined />
          ) : (
            messages
              .map((message) => {
                const isStikerOrImageOrVideo =
                  message.dataWS.type === "image" ||
                  message.dataWS.type === "sticker";

                return (
                  <div
                    key={message.id}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: message.dataWS.fromMe
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "50%",
                        backgroundColor:
                          isStikerOrImageOrVideo ||
                          message.dataWS.type === "ptt" ||
                          message.dataWS.type === "video"
                            ? colorsCosbiome.secondary
                            : message.dataWS.fromMe
                            ? colorsCosbiome.tertiary
                            : colorsCosbiome.primary,
                        color: "white",
                        padding: "10px",
                        borderRadius: "10px",
                        margin: "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isStikerOrImageOrVideo
                          ? "center"
                          : "flex-start",
                        justifyContent: isStikerOrImageOrVideo
                          ? "center"
                          : "flex-start",
                      }}
                    >
                      {message.dataWS.type === "image" ? (
                        <img
                          src={`data:image/jpeg;base64,${message.body}`}
                          alt={message.body}
                          style={{ width: "50%", borderRadius: "10px" }}
                        />
                      ) : message.dataWS.type === "video" ? (
                        <VideoComponent videoBase64={message.body} />
                      ) : message.dataWS.type === "ptt" ? (
                        <AudioComponent audioBase64={message.body} />
                      ) : message.dataWS.type === "sticker" ? (
                        <img
                          src={`data:image/webp;base64,${message.body}`}
                          alt={message.body}
                          style={{ width: "50%", borderRadius: "10px" }}
                        />
                      ) : (
                        <p
                          style={{
                            wordBreak: "break-word",
                          }}
                        >
                          {message.body}
                        </p>
                      )}
                      <small>
                        {" "}
                        {new Date(message.createdAt).toLocaleString()}{" "}
                      </small>
                    </div>
                  </div>
                );
              })
              .reverse()
          )}
        </div>
        {/* <div
        
      > */}
        <form
          onSubmit={handleSubmitMessage}
          style={{
            height: "10%",
            width: "100%",
            //   backgroundColor: "blue",

            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
          }}
          className="row"
        >
          <div className="col-md-8">
            <Input
              width="100%"
              placeholder="Escribe un mensaje"
              required
              value={redaction}
              onChange={(e) => {
                setRedaction(e.target.value);
              }}
              type="text"
            />
          </div>
          <div
            className="col-md-2"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              block
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
                color: "white",
              }}
              onClick={() => {
                setIsEmoji(!isEmoji);
              }}
              className="mr-2"
            >
              <SmileOutlined />
            </Button>
            <Button
              block
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
                color: "white",
              }}
              onClick={() => {
                setOpenFiles(!openFiles);
              }}
            >
              <UploadOutlined />
            </Button>
          </div>

          <div className="col-md-2">
            <Button
              block
              htmlType="submit"
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
                color: "white",
              }}
            >
              Enviar
            </Button>
          </div>
        </form>
        {/* </div> */}
      </div>
    </>
  );
};

export default ChatComponent;
