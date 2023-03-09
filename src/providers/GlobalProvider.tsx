import { createContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";

import { useSocket } from "../hooks/useSocket";

interface IGlobalContext {
  socket: Socket;
  online: boolean | undefined;
  idUser: number;
  roleUser: string;
  setIdUser?: React.Dispatch<React.SetStateAction<number>>;
  setRoleUser?: React.Dispatch<React.SetStateAction<string>>;
}

export const GlobalContext = createContext({
  socket: {} as Socket,
  online: false,
  idUser: 0,
  roleUser: "",
} as IGlobalContext);

const GlobalProvider = ({ children }: any) => {
  const { socketIo, online } = useSocket("http://192.168.1.63:1337/");
  const [idUser, setIdUser] = useState(0);
  const [roleUser, setRoleUser] = useState("");

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const role = sessionStorage.getItem("role");

    if (user.id && role) {
      setIdUser(user.id);
      setRoleUser(role);
    }
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        socket: socketIo,
        online: online,
        idUser: idUser,
        roleUser: roleUser,
        setIdUser: setIdUser,
        setRoleUser: setRoleUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
