import React from "react";
import { colorsCosbiome } from "../constants/colorSchemas";
import { IChatsDB } from "../interfaces/Chats";
import nofoto from "../assets/images/nofoto.jpeg";

interface IPropsCardChatList {
  chat: IChatsDB;
  chatSelect: IChatsDB | undefined;
  setChatSelect: React.Dispatch<React.SetStateAction<IChatsDB | undefined>>;
}

const CardChatListComponent = ({
  chat,
  chatSelect,
  setChatSelect,
}: IPropsCardChatList) => {
  return (
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
        {chat.noleidos! > 0 && (
          <span
            className="badge badge-pill badge-danger"
            style={{
              position: "absolute",
              bottom: 5,
              right: 5,
              zIndex: 1,
            }}
          >
            {chat.noleidos!}
          </span>
        )}

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={chat.foto ? chat.foto : nofoto}
              alt="foto"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: "10px",
              }}
            />

            <h5
              style={{
                color: "white",
              }}
            >
              {chat.cliente.nombre}
              {new Date(chat.createdAt).toLocaleDateString() ===
              new Date().toLocaleDateString()
                ? " - NUEVO"
                : ""}
            </h5>
          </div>
          {/* <br />
          <p>{chat.cliente.telefono?.split("@")[0].substring(3)}</p> */}
          <br />
          <small>
            {chat.ultimo} <br /> {new Date(chat.updatedAt).toLocaleString()}
          </small>
        </div>
      </div>
    </li>
  );
};

export default CardChatListComponent;
