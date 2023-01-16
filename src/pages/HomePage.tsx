import React, { useContext, useEffect, useState } from "react";
import ChatComponent from "../components/ChatComponent";
import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { Datum, IChatsDB } from "../interfaces/Chats";
import { GlobalContext } from "../providers/GlobalProvider";

const HomePage = () => {
  const [chats, setChats] = useState<IChatsDB>();
  const [chatSelect, setChatSelect] = useState<Datum | undefined>();

  const { socket } = useContext(GlobalContext);
  const { get } = useHttp();

  useEffect(() => {
    socket.on("chat:update", (data) => {
      setChats((prev) => {
        if (!prev) return prev;

        let chat = prev.data.find((chat) => chat.id === data.id);

        if (chat) {
          chat.attributes.ultimo = data.ultimo;
          chat.attributes.updatedAt = data.updatedAt;
        }

        return {
          ...prev,
          data: [...prev.data],
        };
      });
    });

    handleGetChats();

    return () => {
      socket.off("chat:update");
    };
  }, []);

  const handleGetChats = async () => {
    const chatDB: IChatsDB = await get(
      "chats?populate[cliente][populate]&sort=updatedAt:DESC"
    );
    setChats(chatDB);
  };

  return (
    <div
      style={{
        backgroundColor: colorsCosbiome.secondary,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
      className="container-fluid"
    >
      {/* <h1 className="text-center">CHATS</h1> */}

      <div className="row">
        <div
          style={{
            // border: "1px solid black",
            width: "100vw",
            height: "100vh",
            padding: "5px",
            backgroundColor: colorsCosbiome.secondary,
            overflowY: "scroll",
            maxHeight: "90vh",
          }}
          className="col-md-3"
        >
          <ul className="list-group">
            {chats?.data
              .sort((a, b) =>
                a.attributes.updatedAt > b.attributes.updatedAt ? -1 : 1
              )
              .filter((chat) => chat.attributes.cliente !== null)
              .map((chat) => (
                <li
                  className="list-group-item mb-2"
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      chat.id === chatSelect?.id
                        ? colorsCosbiome.tertiary
                        : colorsCosbiome.primary,
                    borderRadius: "10px",
                    // color: "black",
                  }}
                  key={chat.id}
                  onClick={() => {
                    setChatSelect(chat);
                  }}
                >
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5
                        style={{
                          color: "white",
                        }}
                      >
                        {chat.attributes.cliente.data.attributes.nombre}
                      </h5>
                      <p>{chat.attributes.cliente.data.attributes.telefono}</p>
                      <small>
                        {chat.attributes.ultimo} <br />{" "}
                        {new Date(chat.attributes.updatedAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        <div
          style={{
            // border: "1px solid red",
            height: "90vh",
          }}
          className="col-md-9"
        >
          {chatSelect && <ChatComponent chat={chatSelect} />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
