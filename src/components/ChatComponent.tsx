import { EditFilled, SmileOutlined, UploadOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Button, Select, Avatar, Image } from "antd";

import EmojiPicker from "emoji-picker-react";
import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Swal from "sweetalert2";
import nofoto from "../assets/images/nofoto.jpeg";
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
  setChatSelect: React.Dispatch<React.SetStateAction<IChatsDB | undefined>>;
}

const ChatComponent = ({ chat, setChatSelect }: IPropsChatComponent) => {
  const [messages, setMessages] = useState<IMessagesDB[]>([]);
  const [redaction, setRedaction] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [isEmoji, setIsEmoji] = useState<boolean>(false);
  const [openFiles, setOpenFiles] = useState<boolean>(false);
  const [campanas, setCampanas] = useState<ICampanasDB[]>([]);
  const [oldChat, setOldChat] = useState<IChatsDB>(chat);
  const [, setUpdate] = useState({});
  const [file, setFile] = useState<FormData>();
  const [image64, setImage64] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const chatRef = React.useRef<HTMLDivElement>(null);
  const inputFileRef = React.useRef<HTMLInputElement | null>();

  const { socket } = useContext(GlobalContext);
  const { get, post, update, uploadfile } = useHttp();
  const [form] = Form.useForm();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const fileLocal = new FormData();

    fileLocal.append(
      "key",
      `chatscrm/${chat.cliente.telefono}/${acceptedFiles[0].name}`
    );
    fileLocal.append("file", acceptedFiles[0]);

    const img64 = await toBase64(fileLocal.get("file"));

    setImage64(img64 as string);
    setFile(fileLocal);

    // eslint-disable-next-line
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    handleGetMessages();
    handleGetCampanas();

    socket.on("chat:update", (data) => {
      let faltten: IChatsDB;

      if (data.data) {
        faltten = strapiFlatten(data.data);
      } else {
        faltten = strapiFlatten(data);
      }

      if (faltten.id === chat.id) {
        setChatSelect(faltten);
      }
    });

    socket.on("mensaje:create", (data: IMessagesDB) => {
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
      socket.off("chat:update");
    };

    // eslint-disable-next-line
  }, [socket, chat]);

  useEffect(() => {
    form.setFieldsValue({
      nombre: chat.cliente.nombre,
      telefono: chat.cliente.telefono,
      nota: chat.nota,
      fechamarcar: moment(chat.fechamarcar).format("YYYY-MM-DD HH:mm:ss"),
    });

    if (chat.id !== oldChat.id && chat.noleidos! > 0) {
      update(
        `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
        {
          data: {
            noleidos: 0,
          },
        }
      );
    }

    setOldChat(chat);

    // eslint-disable-next-line
  }, [chat]);

  useEffect(() => {
    if (chat.noleidos! > 0) {
      update(
        `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
        {
          data: {
            noleidos: 0,
          },
        }
      );
    }

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (chat.id !== oldChat.id && chat.noleidos! > 0) {
      update(
        `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
        {
          data: {
            noleidos: 0,
          },
        }
      );
    }

    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "auto",
      });
    }
    // eslint-disable-next-line
  }, [messages]);

  const toBase64 = (fileFun: any) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fileFun);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleGetCampanas = async () => {
    const campanasDB: { data: ICampanasDB[] } = await get(
      "campanas?populate[0]=etapas&populate[1]=chats&populate[2]=chats.etapa&pagination[limit]=100000"
    );

    setCampanas(campanasDB.data);
  };

  const handleGetMessages = async () => {
    const messages = await get(
      `mensajes?filters[chat][id][$eq]=${chat.id}&populate[chat][id]&sort=createdAt:DESC&pagination[limit]=100`
    );

    setMessages(messages.data);
  };

  const handleSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      await update(
        `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
        {
          data: {
            noleidos: 0,
          },
        }
      );

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

  const handleUpdateClient = async (values: {
    nombre: string;
    fechamarcar: string;
    nota: string;
  }) => {
    try {
      await update(`clientes/${chat.cliente.id}`, {
        data: {
          nombre: values.nombre,
        },
      });

      await update(
        `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
        {
          data: {
            updateAt: new Date().toISOString(),
            nota: values.nota,
            fechamarcar: new Date(values.fechamarcar).toISOString(),
            notahistorial: `${values.nota} - ${new Date().toLocaleString()}\n${
              chat.notahistorial
            }`,
          },
        }
      );

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

  const handleSendImage = async () => {
    try {
      if (file) {
        setIsLoading(true);

        const url = await uploadfile(file);

        await update(
          `chats/${chat.id}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`,
          {
            data: {
              noleidos: 0,
            },
          }
        );

        await post("mensajes", {
          mensaje: url,
          a: chat.cliente.telefono,
          de: "5213319747514@c.us",
          vendedor: 1,
          chat: chat.id,
          isMedia: true,
        });

        setIsLoading(false);
        setFile(undefined);
        setImage64("");
      } else {
        setIsLoading(false);
        setFile(undefined);
        setImage64("");
        await Swal.fire({
          icon: "error",
          title: "Error al enviar imagen",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      setIsLoading(false);
      setFile(undefined);
      setImage64("");
      Swal.fire({
        icon: "error",
        title: "Error al enviar imagen",
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
            zIndex: 100,
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
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={1000}
      >
        <Form
          onFinish={handleUpdateClient}
          form={form}
          layout="vertical"
          initialValues={{
            nombre: chat.cliente.nombre,
            nota: chat.nota,
            fechamarcar: moment(chat.fechamarcar).format("YYYY-MM-DDTHH:mm"),
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

          <Form.Item
            label="nota"
            rules={[
              {
                required: true,
                message: "Este campo es requerido",
              },
            ]}
            name="nota"
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="fecha y hora a llamar"
            rules={[
              {
                required: true,
                message: "Este campo es requerido",
              },
            ]}
            name="fechamarcar"
          >
            <Input type="datetime-local" />
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            zIndex: 100,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            // height: "10%",
            width: "100%",
            padding: "10px",
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
              width: "10%",
            }}
          >
            <Avatar
              size={50}
              src={chat.foto ? chat.foto : nofoto}
              style={{ backgroundColor: "#87d068" }}
            />
          </div>
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
                    const idUpdateCampana = chat.campana
                      ? chat.campana.id
                      : value;

                    let chatUpdate = await update(
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

                    await update(
                      `campanas/${idUpdateCampana}?populate[0]=etapas&populate[1]=chats&populate[2]=chats.etapa`,
                      {
                        data: {
                          updateAt: new Date().toISOString(),
                        },
                      }
                    );

                    Swal.fire({
                      icon: "success",
                      title: "Campaña actualizada",
                      showConfirmButton: false,
                      timer: 1500,
                    });

                    console.log(chatUpdate);

                    setUpdate({});
                  } catch (error) {
                    console.log(error);

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

                      await update(
                        `etapas/${chat.etapa.id}?populate[0]=etapas&populate[1]=chats&populate[2]=chats.etapa`,
                        {
                          data: {
                            updateAt: new Date().toISOString(),
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
              className="ml-5"
            >
              <EditFilled
                onClick={() => {
                  setOpen(true);
                  form.setFieldsValue({
                    nombre: chat.cliente.nombre,
                    telefono: chat.cliente.telefono,
                    nota: chat.nota,
                  });
                }}
                style={{
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "white",
                  zIndex: 9999,
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "56%",
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
              {/* <Avatar
                  size={50}
                  src={chat.foto ? chat.foto : nofoto}
                  style={{ backgroundColor: "#87d068" }}
                /> */}

              {chat.cliente.nombre}

              <br />
              {chat.cliente.telefono?.split("@")[0]}
            </p>
          </div>
        </div>

        <div
          style={{
            height: "70%",
            width: "100%",
            //   backgroundColor: "green",
            overflowY: "scroll",
            maxHeight: "70%",
            scrollBehavior: "smooth",
          }}
          {...getRootProps({
            onClick: (event) => event.stopPropagation(),
            ref: chatRef,
          })}
        >
          <input {...getInputProps()} disabled />
          {isDragActive || file !== undefined ? (
            <div
              style={{
                height: "100%",
                width: "100%",
                scrollBehavior: "smooth",
                border: "2px dashed white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {file !== undefined ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  className="row"
                >
                  <div
                    style={{
                      width: "100%",
                      height: "80%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    className="col-md-12"
                  >
                    <img
                      src={image64}
                      alt="imagebn"
                      width="50%"
                      height="100%"
                    />
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "20%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    className="col-md-12"
                  >
                    <Button
                      onClick={() => {
                        setFile(undefined);
                        setImage64("");
                      }}
                      style={{
                        width: "40%",
                        backgroundColor: "red",
                        borderColor: "red",
                        color: "white",
                        marginRight: "5px",
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSendImage}
                      loading={isLoading}
                      style={{
                        width: "40%",
                        backgroundColor: colorsCosbiome.primary,
                        borderColor: colorsCosbiome.primary,
                        color: "white",
                      }}
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              ) : (
                <p>ARRASTA TU IMAGEN AQUI</p>
              )}
            </div>
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
                        <Image
                          src={`data:image/jpeg;base64,${message.body}`}
                          alt={message.body}
                          style={{
                            // width: "50%",
                            borderRadius: "10px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
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
                      ) : message.dataWS._data.ctwaContext ? (
                        <p
                          style={{
                            wordBreak: "break-word",
                          }}
                        >
                          <img
                            // src={`data:image/jpeg;base64,${message.dataWS._data.ctwaContext.thumbnail}`}
                            src={message.dataWS._data.ctwaContext.thumbnailUrl}
                            alt={message.dataWS._data.ctwaContext.thumbnail}
                          />
                          <br />
                          {message.dataWS._data.ctwaContext.title}
                          <br />
                          {message.dataWS._data.ctwaContext.description}
                          <br />
                          <br />
                          {message.body}
                        </p>
                      ) : message.dataWS.type === "document" ? (
                        <p>
                          <a
                            href={`data:application/pdf;base64,${message.body}`}
                            download="file.pdf"
                          >
                            {message.dataWS.body}
                          </a>
                        </p>
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
          hidden={file !== undefined}
          onSubmit={handleSubmitMessage}
          style={{
            height: "5%",
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
            <Input.TextArea
              rows={1}
              placeholder="Escribe un mensaje"
              required
              value={redaction}
              onChange={(e) => {
                setRedaction(e.target.value);
              }}
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
              className="mr-2"
            >
              <UploadOutlined />
            </Button>

            <Button
              block
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
                color: "white",
              }}
              onClick={() => {
                if (inputFileRef.current) {
                  inputFileRef.current.click();
                }
              }}
              className="mr-2"
            >
              Carpetas
              <input
                style={{
                  display: "none",
                }}
                type="file"
                onChange={async (e) => {
                  if (e.target.files) {
                    const fileLocal = new FormData();
                    let acceptedFiles = e.target.files;

                    fileLocal.append(
                      "key",
                      `chatscrm/${chat.cliente.telefono}/${acceptedFiles[0].name}`
                    );
                    fileLocal.append("file", acceptedFiles[0]);

                    const img64 = await toBase64(fileLocal.get("file"));

                    setImage64(img64 as string);
                    setFile(fileLocal);
                  }
                }}
                ref={(e) => (inputFileRef.current = e)}
              />
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
