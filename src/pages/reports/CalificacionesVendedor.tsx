import React, { useState } from "react";
import { Calendar } from "react-calendar";
import useHttp from "../../hooks/useHttp";
import { IChatsDB } from "../../interfaces/Chats";
import _ from "lodash";
import { Avatar, Button, List, Modal, Tag } from "antd";
import { colorsCosbiome } from "../../constants/colorSchemas";
import ChatComponent from "../../components/ChatComponent";

const CalificacionesVendedor = () => {
  const [chats, setChats] = useState<IChatsDB[]>([]);
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [etapas, setEtapas] = useState<string[]>([]);
  const [campanas, setCampanas] = useState<string[]>([]);
  const [chatsFiltrados, setChatsFiltrados] = useState<IChatsDB[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [chatSelected, setChatSelected] = useState<IChatsDB>();
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const { get } = useHttp();

  const handleGetChats = async (dates: Date[]) => {
    const chatsDB: { data: IChatsDB[] } = await get(
      `chats?filters[$and][0][createdAt][$gte]=${dates[0].toISOString()}&filters[$and][1][createdAt][$lte]=${dates[1].toISOString()}&sort=createdAt:DESC&populate[0]=vendedor&populate[1]=cliente&populate[2]=campana&populate[3]=etapa&populate[4]=campana.etapas&pagination[limit]=100000&filters[$and][2][cliente][nombre][$notNull]=true`
    );

    const vendedoresUniq = _.uniqBy(
      chatsDB.data.map((a) => a.vendedor),
      "username"
    )
      .filter((vendedor) => vendedor)
      .map((vendedor) => vendedor.username);

    const etapaUniq = _.uniqBy(
      chatsDB.data.map((a) => a.etapa),
      "nombre"
    )
      .filter((etapa) => etapa)
      .map((etapa) => etapa.nombre);

    const campanaUniq = _.uniqBy(
      chatsDB.data.map((a) => a.campana),
      "nombre"
    )

      .filter((campana) => campana)
      .map((campana) => campana.nombre);

    console.log(campanaUniq);
    console.log(vendedoresUniq);
    console.log(etapaUniq);

    //NUMERO Y PORCENTAJE EN TOTAL

    setChats(
      chatsDB.data.filter((chat) => chat.vendedor && chat.etapa && chat.campana)
    );
    setVendedores(vendedoresUniq);
    setEtapas(etapaUniq);
    setCampanas(campanaUniq);
  };

  return (
    <>
      <Modal
        title="chat"
        open={isChatOpen}
        onCancel={() => {
          setIsChatOpen(false);
          setChatSelected(undefined);
        }}
        width="80%"
      >
        {chatSelected && (
          <ChatComponent setChatSelect={setChatSelected} chat={chatSelected} />
        )}
      </Modal>

      <Modal
        title="contactos"
        open={isOpen}
        onCancel={() => {
          setIsOpen(false);
          setChatsFiltrados([]);
        }}
        width="80%"
      >
        <List
          itemLayout="horizontal"
          dataSource={chatsFiltrados}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={item.foto} />}
                title={item.cliente.nombre}
                description={<Tag>{item.etapa.nombre}</Tag>}
              />
              <Button
                type="primary"
                style={{
                  backgroundColor: colorsCosbiome.primary,
                  borderColor: colorsCosbiome.primary,
                }}
                onClick={() => {
                  setChatSelected(item);
                  setIsChatOpen(true);
                }}
              >
                Chat
              </Button>
            </List.Item>
          )}
        />
      </Modal>

      <div className="container-fluid">
        <h1 className="text-center">Calificaciones Vendedor</h1>

        <div className="row mt-5">
          <div className="col-md-12">
            <Calendar
              selectRange={true}
              onChange={(e: Date[]) => {
                handleGetChats(e);
              }}
            />
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-md-12">
            <h1>CAMPAÑAS</h1>
            {chats.length > 0 && (
              <table className="table table-striped text-center">
                <thead>
                  <tr>
                    <th scope="col">Vendedor</th>
                    {campanas.map((campana, index) => (
                      <th key={index} scope="col">
                        {campana}
                      </th>
                    ))}
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendedores.map((vendedor, index) => (
                    <tr key={index}>
                      <th scope="row">{vendedor}</th>
                      {campanas.map((campana, index) => (
                        <td
                          className="clickable-td"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setIsOpen(true);
                            setChatsFiltrados(
                              chats.filter(
                                (chat) =>
                                  chat.vendedor.username === vendedor &&
                                  chat.campana.nombre === campana
                              )
                            );
                          }}
                          key={index}
                        >
                          {
                            chats.filter(
                              (chat) =>
                                chat.vendedor.username === vendedor &&
                                chat.campana.nombre === campana
                            ).length
                          }
                        </td>
                      ))}
                      <td
                        className="clickable-td"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setIsOpen(true);
                          setChatsFiltrados(
                            chats.filter(
                              (chat) => chat.vendedor.username === vendedor
                            )
                          );
                        }}
                      >
                        {
                          chats.filter(
                            (chat) => chat.vendedor.username === vendedor
                          ).length
                        }
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Total</th>
                    {campanas.map((campana, index) => (
                      <td
                        className="clickable-td"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setIsOpen(true);
                          setChatsFiltrados(
                            chats.filter(
                              (chat) => chat.campana.nombre === campana
                            )
                          );
                        }}
                        key={index}
                      >
                        {
                          chats.filter(
                            (chat) => chat.campana.nombre === campana
                          ).length
                        }
                      </td>
                    ))}
                    <td>{chats.length}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          <div className="col-md-12 mt-5">
            <h1>ETAPAS</h1>
            {chats.length > 0 && (
              <table className="table table-striped text-center">
                <thead>
                  <tr>
                    <th scope="col">Vendedor</th>
                    {etapas.map((etapa, index) => (
                      <th key={index} scope="col">
                        {etapa}
                      </th>
                    ))}
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {vendedores.map((vendedor, index) => (
                    <tr key={index}>
                      <th scope="row">{vendedor}</th>
                      {etapas.map((etapa, index) => (
                        <td
                          className="clickable-td"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setIsOpen(true);
                            setChatsFiltrados(
                              chats.filter(
                                (chat) =>
                                  chat.vendedor.username === vendedor &&
                                  chat.etapa.nombre === etapa
                              )
                            );
                          }}
                          key={index}
                        >
                          {
                            chats.filter(
                              (chat) =>
                                chat.vendedor.username === vendedor &&
                                chat.etapa.nombre === etapa
                            ).length
                          }
                        </td>
                      ))}
                      <td
                        className="clickable-td"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setIsOpen(true);
                          setChatsFiltrados(
                            chats.filter(
                              (chat) => chat.vendedor.username === vendedor
                            )
                          );
                        }}
                      >
                        {
                          chats.filter(
                            (chat) => chat.vendedor.username === vendedor
                          ).length
                        }
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Total</th>
                    {etapas.map((etapa, index) => (
                      <td
                        className="clickable-td"
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setIsOpen(true);
                          setChatsFiltrados(
                            chats.filter((chat) => chat.etapa.nombre === etapa)
                          );
                        }}
                        key={index}
                      >
                        {
                          chats.filter((chat) => chat.etapa.nombre === etapa)
                            .length
                        }
                      </td>
                    ))}
                    <td>{chats.length}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalificacionesVendedor;
