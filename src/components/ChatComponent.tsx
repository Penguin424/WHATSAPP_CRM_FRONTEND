import { EditFilled, SmileOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Button } from "antd";
import EmojiPicker from "emoji-picker-react";
import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";

import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { Datum as Chat } from "../interfaces/Chats";
import { IMessagesDB, IMessageSocket } from "../interfaces/Messages";
import { GlobalContext } from "../providers/GlobalProvider";

interface IPropsChatComponent {
  chat: Chat;
}

const ChatComponent = ({ chat }: IPropsChatComponent) => {
  const [messages, setMessages] = useState<IMessagesDB | undefined>();
  const [redaction, setRedaction] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);

  const chatRef = React.useRef<HTMLDivElement>(null);

  const { socket } = useContext(GlobalContext);
  const { get, post, update } = useHttp();
  const [form] = Form.useForm();

  useEffect(() => {
    handleGetMessages();

    socket.on("mensaje:create", (data: IMessageSocket) => {
      if (data.de === chat.attributes.cliente.data.attributes.telefono) {
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
  }, [socket, chat]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "auto",
      });
    }
  }, [messages]);

  const handleGetMessages = async () => {
    const messages = await get(
      `mensajes?filters[chat][id][$eq]=${chat.id}&populate[chat][id]&sort=createdAt:DESC`
    );
    console.log(messages);

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
      });

      setMessages((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          data: [
            {
              id: message.id,
              attributes: message as any,
            },
            ...prev.data,
          ],
        };
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
            height: "10%",
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
              }}
              className="text-center"
            >
              {chat.attributes.cliente.data.attributes.nombre}
            </p>
          </div>
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "70PX",
              height: "70PX",
              borderRadius: "50%",
              backgroundColor: colorsCosbiome.primary,
            }}
            onClick={() => {
              setOpen(true);
              form.setFieldsValue({
                nombre: chat.attributes.cliente.data.attributes.nombre,
              });
            }}
          >
            <EditFilled
              style={{
                fontSize: "1.5rem",
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
            maxHeight: "80%",
            scrollBehavior: "smooth",
          }}
        >
          {messages?.data
            .map((message) => (
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
                    backgroundColor: message.attributes.dataWS.fromMe
                      ? colorsCosbiome.tertiary
                      : colorsCosbiome.primary,
                    color: "white",
                    padding: "10px",
                    borderRadius: "10px",
                    margin: "10px",
                  }}
                >
                  <p>{message.attributes.body}</p>
                  <small>
                    {" "}
                    {new Date(
                      message.attributes.createdAt
                    ).toLocaleString()}{" "}
                  </small>
                </div>
              </div>
            ))
            .reverse()}
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
          <div className="col-md-2">
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
            >
              <SmileOutlined />
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
