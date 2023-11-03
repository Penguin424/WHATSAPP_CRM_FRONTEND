import FullCalendar from "@fullcalendar/react";
import React, { useContext, useEffect, useState } from "react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import { IChatsDB } from "../interfaces/Chats";
import useHttp from "../hooks/useHttp";
import { GlobalContext } from "../providers/GlobalProvider";
import { strapiFlatten } from "../utils/flatten";
import _ from "lodash";
import { colorsCosbiome } from "../constants/colorSchemas";
import { Button, Modal } from "antd";
import "../css/calendar.css";
import ChatComponent from "../components/ChatComponent";

const CalendarioVendedores = () => {
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);
  const [chats, setChats] = useState<IChatsDB[]>([]);
  const [selectChat, setSelectChat] = useState<IChatsDB | undefined>();
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [chatForDay, setChatForDay] = useState<IChatsDB[]>([]);
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [openChat, setOpenChat] = useState(false);

  const { get } = useHttp();
  const { socket, roleUser, idUser } = useContext(GlobalContext);

  useEffect(() => {
    handleGetContactos(month);

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
  }, [month]);

  const handleGetContactos = async (month: number) => {
    const primerDiaDelmes = new Date(new Date().getFullYear(), month - 1, 1);
    const ultimoDiaDelmes = new Date(new Date().getFullYear(), month, 0);

    let chatsDB;
    if (roleUser === "ADMIN") {
      chatsDB = await get(
        `chats?filters[$and][0][createdAt][$gte]=${primerDiaDelmes.toISOString()}&filters[$and][1][createdAt][$lte]=${ultimoDiaDelmes.toISOString()}&sort=createdAt:DESC&populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas&pagination[limit]=100000&filters[$and][2][cliente][nombre][$notNull]=true&filters[$and][2][vendedor][username][$notNull]=true`
      );
    } else {
      chatsDB = await get(
        `chats?filters[$and][0][createdAt][$gte]=${primerDiaDelmes.toISOString()}&filters[$and][1][createdAt][$lte]=${ultimoDiaDelmes.toISOString()}&sort=createdAt:DESC&populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas&pagination[limit]=100000&filters[$and][2][cliente][nombre][$notNull]=true&filters[$and][2][vendedor][username][$notNull]=true&filters[$and][2][vendedor][id]=${idUser}`
      );
    }

    const chatsInter: IChatsDB[] = chatsDB.data;

    const uniqDateString = _.uniq(
      chatsInter.map((chat) => {
        const date = new Date(chat.fechamarcar);
        return date.toISOString().split("T")[0];
      })
    );

    setEvents(
      uniqDateString.map((date) => {
        const chats = chatsInter.filter((chat) => {
          const dateChat = new Date(chat.fechamarcar);
          return dateChat.toISOString().split("T")[0] === date;
        });

        return {
          title: "CHATS DEL DIA: " + chats.length,
          start: new Date(date),
          color: colorsCosbiome.secondary,
          id: date,
        };
      })
    );

    setChats(chatsDB.data);
  };

  return (
    <>
      <Modal
        open={openChat}
        onCancel={() => setOpenChat(false)}
        onOk={() => setOpenChat(false)}
        title="Chats del dia"
        footer={null}
        width="90%"
      >
        {selectChat && (
          <ChatComponent setChatSelect={setSelectChat} chat={selectChat} />
        )}
      </Modal>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => setOpen(false)}
        title="Chats del dia"
        footer={null}
        width="90%"
      >
        <div className="container-fluid">
          <h1 className="text-center">
            {chatForDay.length} chats para el dia:{" "}
            {new Date(chatForDay[0]?.fechamarcar).toLocaleDateString()}
          </h1>
          <div className="row">
            {vendedores.map((vendedor) => {
              const chatsVendedor = chatForDay.filter((chat) => {
                return chat.vendedor.username === vendedor;
              });

              return (
                <div className="col-12 col-md-12 col-lg-12 mt-5 mb-5 well">
                  <h3 className="text-center">{vendedor}</h3>
                  <table
                    // style={{
                    //   width: "100%",
                    //   display: "block",
                    //   height: "30vh",
                    //   overflowY: "auto",
                    // }}
                    className="table table-scroll table-striped"
                  >
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Telefono</th>
                        <th>Campana</th>
                        <th>Etapa</th>
                        <th>Fecha y Hora a marcar</th>
                        <th>Comentario</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chatsVendedor.map((chat) => {
                        return (
                          <tr>
                            <td>{chat.cliente ? chat.cliente.nombre : ""}</td>
                            <td>{chat.cliente ? chat.cliente.telefono : ""}</td>
                            <td>{chat.campana ? chat.campana.nombre : ""}</td>
                            <td>{chat.etapa ? chat.etapa.nombre : ""}</td>
                            <td>
                              {new Date(chat.fechamarcar).toLocaleString()}
                            </td>
                            <td>{chat.nota}</td>
                            <td>
                              <Button
                                onClick={() => {
                                  setSelectChat(chat);
                                  setOpenChat(true);
                                }}
                                type="primary"
                                style={{
                                  backgroundColor: colorsCosbiome.primary,
                                  borderColor: colorsCosbiome.primary,
                                }}
                              >
                                Ver
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      <div className="container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={(e) => {
            setOpen(true);

            setChatForDay(
              chats.filter((chat) => {
                const date = new Date(chat.fechamarcar);
                return date.toISOString().split("T")[0] === e.event.id;
              })
            );

            setVendedores(
              _.uniq(
                chats
                  .filter((chat) => {
                    const date = new Date(chat.fechamarcar);
                    return date.toISOString().split("T")[0] === e.event.id;
                  })
                  .map((chat) => {
                    if (chat.vendedor) {
                      return chat.vendedor.username;
                    }

                    return "Sin vendedor";
                  })
              )
            );

            console.log(
              _.uniq(
                chats
                  .filter((chat) => {
                    const date = new Date(chat.fechamarcar);
                    return date.toLocaleDateString() === e.event.id;
                  })
                  .map((chat) => {
                    return chat.vendedor.username;
                  })
              )
            );
          }}
          datesSet={(e) => {
            const date = new Date(e.view.currentStart);
            setMonth(date.getMonth() + 1);
          }}
        />
      </div>
    </>
  );
};

export default CalendarioVendedores;
