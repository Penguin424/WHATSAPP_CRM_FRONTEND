import { useMemo, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
export interface IContectados {
  nombre: string;
  id: string;
  entrada: string;
}
export interface IDataReturnSocket {
  socketIo: Socket;
  online?: boolean;
  conectados?: IContectados[];
}

export const useSocket = (serverPath: string): IDataReturnSocket => {
  const socketIo: Socket = useMemo(() => io(serverPath), [serverPath]);
  const [online, setOnline] = useState<boolean>(false);

  useEffect(() => {
    setOnline(socketIo.connected);
  }, [socketIo]);

  useEffect(() => {
    socketIo.on("connect", () => {
      setOnline(true);
    });
  }, [socketIo]);

  useEffect(() => {
    socketIo.on("disconnect", () => {
      setOnline(false);
    });
  }, [socketIo]);

  return {
    socketIo,
    online,
  };
};
