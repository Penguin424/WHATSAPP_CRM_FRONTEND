import { createContext } from "react";
import { Socket } from "socket.io-client";

import { useSocket } from "../hooks/useSocket";

interface IGlobalContext {
  socket: Socket;
  online: boolean | undefined;
}

export const GlobalContext = createContext({
  socket: {} as Socket,
  online: false,
} as IGlobalContext);

const GlobalProvider = ({ children }: any) => {
  const { socketIo, online } = useSocket("192.168.1.147:1337");

  return (
    <GlobalContext.Provider
      value={{
        socket: socketIo,
        online: online,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
