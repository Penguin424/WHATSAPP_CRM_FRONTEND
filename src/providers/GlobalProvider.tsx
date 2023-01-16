import { createContext } from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "../hooks/useSocket";

interface IGlobalContext {
  socket: Socket;
}

export const GlobalContext = createContext({
  socket: {} as Socket,
} as IGlobalContext);

const GlobalProvider = ({ children }: any) => {
  const { socketIo, online } = useSocket("192.168.1.147:1337");

  return (
    <GlobalContext.Provider
      value={{
        socket: socketIo,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
