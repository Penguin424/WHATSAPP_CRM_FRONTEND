import React, { useContext, useEffect, useState } from "react";
import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { IChatsDB, Datum } from "../interfaces/Chats";
import { GlobalContext } from "../providers/GlobalProvider";

interface IPropsChatList {
  chatSelect: Datum | undefined;
  setChatSelect: React.Dispatch<React.SetStateAction<Datum | undefined>>;
}

const ChatLIstComponent = ({ chatSelect, setChatSelect }: IPropsChatList) => {
  const [chats, setChats] = useState<IChatsDB>();
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

    // eslint-disable-next-line
  }, []);

  const handleGetChats = async () => {
    const chatDB: IChatsDB = await get(
      "chats?populate[cliente][populate]&sort=updatedAt:DESC"
    );
    setChats(chatDB);
  };
  return (
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
  );
};

export default ChatLIstComponent;
