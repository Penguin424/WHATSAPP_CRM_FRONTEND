import React, { useContext, useEffect, useState } from "react";
import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { IChatsDB } from "../interfaces/Chats";
import { User } from "../interfaces/Login";
import { GlobalContext } from "../providers/GlobalProvider";
import { strapiFlatten } from "../utils/flatten";
import CardChatListComponent from "./CardChatListComponent";
import _ from "lodash";
import { toast } from "react-toastify";
import { Input, Select } from "antd";

interface IPropsChatList {
  chatSelect: IChatsDB | undefined;
  setChatSelect: React.Dispatch<React.SetStateAction<IChatsDB | undefined>>;
  filters: string;
  isDailyChat?: boolean;
  dataSelect?: Date;
}

const ChatLIstComponent = ({
  chatSelect,
  setChatSelect,
  filters,
  isDailyChat,
  dataSelect,
}: IPropsChatList) => {
  const [chats, setChats] = useState<IChatsDB[]>([]);
  const [filterSelect, setFilterSelect] = useState<string | undefined>("Todos");

  const { socket, idUser, roleUser } = useContext(GlobalContext);
  const { get } = useHttp();

  useEffect(() => {
    handleGetChats();
    // eslint-disable-next-line
  }, [filters]);

  useEffect(() => {
    if (isDailyChat) {
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
    }

    socket.on("chat:update", (data: any) => {
      const user: User | { id: 0 } = JSON.parse(
        sessionStorage.getItem("user") || "{}"
      );
      let flatten: IChatsDB;

      if (data.data) {
        flatten = strapiFlatten(data.data);
      } else {
        flatten = strapiFlatten(data);
      }

      if (!isDailyChat) {
        if (flatten.vendedor === null) return;
      } else {
        flatten.vendedor = { id: user.id } as any;
      }

      if (flatten.vendedor.id === user.id && flatten.noleidos! > 0) {
        console.log(flatten);

        toast(
          <p>
            <b>{flatten.cliente.nombre}</b>
            <br />
            Mesaje: <b>{flatten.ultimo}</b>
          </p>,
          {
            icon: "📩",
            autoClose: false,
            onClick: () => {
              setChatSelect(flatten);
            },
          }
        );
      }

      if (
        (flatten.vendedor.id === user.id || isDailyChat) &&
        new Date(flatten.fechamarcar).toLocaleDateString() ===
          new Date(dataSelect!).toLocaleDateString()
      ) {
        setChats((prevState) => {
          return [
            ...prevState.filter((chat) => chat.id !== flatten.id),
            flatten,
          ];
        });

        if (chatSelect?.id === flatten.id) {
          setChatSelect(flatten);
        }
      } else {
        setChats((prevState) => {
          let isChatInList = prevState.find((chat) => chat.id === flatten.id);

          if (isChatInList) {
            return [...prevState.filter((chat) => chat.id !== flatten.id)];
          } else {
            return prevState;
          }
        });
      }
    });

    return () => {
      socket.off("chat:update");

      if (isDailyChat) socket.off("chat:create");
    };

    // eslint-disable-next-line
  }, [chatSelect]);

  const handleGetChats = async () => {
    const chatDB: { data: IChatsDB[] } = await get(
      `chats?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas&sort=updatedAt:DESC&${filters}`
    );

    setChats(chatDB.data);
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12 mb-5">
          <Input.Search
            placeholder="Buscar"
            onSearch={async (value) => {
              if (value === "") return setChatSelect(undefined);

              const ClienteDBFind: { data: { chat: { id: number } }[] } =
                await get(`clientes?populate=chat&_q=${value}`);

              console.log(ClienteDBFind.data[0].chat.id);

              if (ClienteDBFind.data.length === 0) {
                return toast.error("No se encontraron resultados", {
                  autoClose: 2000,
                });
              }

              const chatDBFind: { data: IChatsDB } = await get(
                `chats/${ClienteDBFind.data[0].chat.id}}?populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas`
              );

              if (
                chatDBFind.data.vendedor.id !== idUser &&
                roleUser !== "ADMIN"
              ) {
                return toast.error(
                  "Este cliente no te pertenece no puedes visualizarlo",
                  {
                    autoClose: 2000,
                  }
                );
              }

              toast.success("Chat econtrado", {
                autoClose: 2000,
              });

              setChatSelect(chatDBFind.data);
            }}
            allowClear
            style={{
              width: "100%",
            }}
          />
        </div>
        {chats.length > 0 && (
          <div className="col-md-12 mb-5">
            <Select
              value={filterSelect}
              onChange={(value) => {
                setFilterSelect(value);
              }}
              style={{
                width: "100%",
              }}
            >
              <Select.Option value="Todos">Todos</Select.Option>
              {_.uniq(
                chats
                  .filter((chat) => {
                    return chat.etapa;
                  })

                  .map((chat) => {
                    return chat.etapa.nombre;
                  })
              ).map((etapa) => {
                return (
                  <Select.Option value={etapa} key={etapa}>
                    {etapa}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        )}
        {_.uniq(
          chats
            .filter((chat) => {
              if (filterSelect === "Todos") return true;

              return chat.etapa.nombre === filterSelect;
            })
            .map((chat) => {
              return chat.fechamarcar.split("T")[1].split(".")[0].split(":")[0];
            })
        )
          .sort((a, b) => (a > b ? 1 : -1))

          .map((hour) => {
            return (
              <div className="col-md-12 mb-5">
                <h3
                  style={{
                    color: "white",
                    backgroundColor: colorsCosbiome.tertiary,
                    padding: "10px",
                    borderRadius: "5px",
                  }}
                  className="text-center"
                >
                  {hour}:00
                </h3>
                <ul className="list-group">
                  {chats
                    .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
                    .filter(
                      (chat) =>
                        chat.cliente !== null &&
                        chat.fechamarcar
                          .split("T")[1]
                          .split(".")[0]
                          .split(":")[0] === hour
                    )
                    .map((chat) => (
                      <CardChatListComponent
                        key={chat.id}
                        chat={chat}
                        chatSelect={chatSelect}
                        setChatSelect={setChatSelect}
                      />
                    ))}
                </ul>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ChatLIstComponent;
