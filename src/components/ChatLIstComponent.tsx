import React, { useContext, useEffect, useState } from "react";
import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { IChatsDB } from "../interfaces/Chats";
import { GlobalContext } from "../providers/GlobalProvider";
import { strapiFlatten } from "../utils/flatten";

interface IPropsChatList {
  chatSelect: IChatsDB | undefined;
  setChatSelect: React.Dispatch<React.SetStateAction<IChatsDB | undefined>>;
}

const ChatLIstComponent = ({ chatSelect, setChatSelect }: IPropsChatList) => {
  const [chats, setChats] = useState<IChatsDB[]>([]);
  const { socket } = useContext(GlobalContext);
  const { get } = useHttp();

  useEffect(() => {
    handleGetChats();

    socket.on("chat:update", (data: IChatsDB) => {
      const flatten = strapiFlatten(data);

      if (flatten.vendedor.id === 1) {
        setChats((prevState) => {
          return [
            ...prevState.filter((chat) => chat.id !== flatten.id),
            flatten,
          ];
        });
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
    };

    // eslint-disable-next-line
  }, []);

  const handleGetChats = async () => {
    const chatDB: { data: IChatsDB[] } = await get(
      `chats?populate[cliente][populate]&sort=updatedAt:DESC&filters[vendedor][id][$eq]=${1}`
    );

    console.log(chatDB);

    setChats(chatDB.data);
  };
  return (
    <ul className="list-group">
      {chats
        .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
        .filter((chat) => chat.cliente !== null)
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
                  {chat.cliente.nombre}
                </h5>
                <p>{chat.cliente.telefono}</p>
                <small>
                  {chat.ultimo} <br />{" "}
                  {new Date(chat.updatedAt).toLocaleString()}
                </small>
              </div>
            </div>
          </li>
        ))}
    </ul>
  );
};

export default ChatLIstComponent;
