import React, { useContext, useEffect, useState } from "react";
import useHttp from "../hooks/useHttp";
import { IChatsDB } from "../interfaces/Chats";
import { User } from "../interfaces/Login";
import { GlobalContext } from "../providers/GlobalProvider";
import { strapiFlatten } from "../utils/flatten";
import CardChatListComponent from "./CardChatListComponent";

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
  const { socket } = useContext(GlobalContext);
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
      <ul className="list-group">
        {chats
          .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
          .filter((chat) => chat.cliente !== null)
          .map((chat) => (
            <CardChatListComponent
              key={chat.id}
              chat={chat}
              chatSelect={chatSelect}
              setChatSelect={setChatSelect}
            />
          ))}
      </ul>
    </>
  );
};

export default ChatLIstComponent;
