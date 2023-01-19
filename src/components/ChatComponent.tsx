import {
  EditFilled,
  Loading3QuartersOutlined,
  SmileOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Modal, Form, Input, Button } from "antd";
import EmojiPicker from "emoji-picker-react";
import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { Datum as Chat } from "../interfaces/Chats";
import { IMessagesDB, IMessageSocket, Type } from "../interfaces/Messages";
import { GlobalContext } from "../providers/GlobalProvider";
import AudioComponent from "./AudioComponent";
import MediaTableComponent from "./MediaTableComponent";
import VideoComponent from "./VideoComponent";

interface IPropsChatComponent {
  chat: Chat;
}

const ChatComponent = ({ chat }: IPropsChatComponent) => {
  const [messages, setMessages] = useState<IMessagesDB | undefined>();
  const [redaction, setRedaction] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);
  const [openFiles, setOpenFiles] = useState<boolean>(false);

  const chatRef = React.useRef<HTMLDivElement>(null);

  const { socket } = useContext(GlobalContext);
  const { get, post, update } = useHttp();
  const [form] = Form.useForm();

  useEffect(() => {
    handleGetMessages();

    socket.on("mensaje:create", (data: IMessageSocket) => {
      console.log("data", data);

      if (
        data.de === chat.attributes.cliente.data.attributes.telefono ||
        data.a === chat.attributes.cliente.data.attributes.telefono
      ) {
        setMessages((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            data: [
              {
                id: data.id,
                attributes: data as any,
              },
              ...prev.data,
            ],
          };
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

  const handleGetMessages = async () => {
    const messages = await get(
      `mensajes?filters[chat][id][$eq]=${chat.id}&populate[chat][id]&sort=createdAt:DESC`
    );

    setMessages(messages);
  };

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      const message: any = await post("mensajes", {
        mensaje: redaction,
        a: chat.attributes.cliente.data.attributes.telefono,
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
      await update(`clientes/${chat.attributes.cliente.data.id}`, {
        data: {
          nombre: values.nombre,
        },
      });

      chat.attributes.cliente.data.attributes.nombre = values.nombre;

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
        title={`MODIFICAR CONTADO DE ${chat.attributes.cliente.data.attributes.nombre.toUpperCase()}`}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1000}
      >
        <Form
          onFinish={handleUpdateClient}
          form={form}
          layout="vertical"
          initialValues={{
            nombre: chat.attributes.cliente.data.attributes.nombre,
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
            height: "7%",
            width: "100%",
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            border: `1px solid ${colorsCosbiome.primary}`,
            //sombra en la parde de abajo
            boxShadow: `0px 0px 10px 0px ${colorsCosbiome.primary}`,
          }}
        >
          <div></div>
          <div>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
              }}
              className="text-center"
            >
              {chat.attributes.cliente.data.attributes.nombre}
            </p>
          </div>

          <EditFilled
            onClick={() => {
              setOpen(true);
              form.setFieldsValue({
                nombre: chat.attributes.cliente.data.attributes.nombre,
              });
            }}
            style={{
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "white",
            }}
          />
        </div>

        <div
          ref={chatRef}
          style={{
            height: "83%",
            width: "100%",
            //   backgroundColor: "green",
            overflowY: "scroll",
            maxHeight: "83%",
            scrollBehavior: "smooth",
          }}
        >
          {messages?.data.length === 0 ? (
            <Loading3QuartersOutlined />
          ) : (
            messages?.data
              .map((message) => {
                const isStikerOrImageOrVideo =
                  message.attributes.dataWS.type === Type.Image ||
                  message.attributes.dataWS.type === Type.Sticker;

                return (
                  <div
                    key={message.id}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: message.attributes.dataWS.fromMe
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "50%",
                        backgroundColor:
                          isStikerOrImageOrVideo ||
                          message.attributes.dataWS.type === Type.Audio ||
                          message.attributes.dataWS.type === Type.Video
                            ? colorsCosbiome.secondary
                            : message.attributes.dataWS.fromMe
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
                      {message.attributes.dataWS.type === Type.Image ? (
                        <img
                          src={`data:image/jpeg;base64,${message.attributes.body}`}
                          alt={message.attributes.body}
                          style={{ width: "50%", borderRadius: "10px" }}
                        />
                      ) : message.attributes.dataWS.type === Type.Video ? (
                        <VideoComponent videoBase64={message.attributes.body} />
                      ) : message.attributes.dataWS.type === Type.Audio ? (
                        <AudioComponent audioBase64={message.attributes.body} />
                      ) : message.attributes.dataWS.type === Type.Sticker ? (
                        <img
                          src={`data:image/webp;base64,${message.attributes.body}`}
                          alt={message.attributes.body}
                          style={{ width: "50%", borderRadius: "10px" }}
                        />
                      ) : (
                        <p>{message.attributes.body}</p>
                      )}
                      <small>
                        {" "}
                        {new Date(
                          message.attributes.createdAt
                        ).toLocaleString()}{" "}
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
