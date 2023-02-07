import moment from "moment";
import { useState } from "react";
import { Calendar } from "react-calendar";
import ChatComponent from "../components/ChatComponent";
import ChatLIstComponent from "../components/ChatLIstComponent";
import { colorsCosbiome } from "../constants/colorSchemas";
import { IChatsDB } from "../interfaces/Chats";

const ChatUserPage = () => {
  const [chatSelect, setChatSelect] = useState<IChatsDB | undefined>();
  const [date, setDate] = useState<Date>(new Date());

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
      <div className="row">
        <div
          style={{
            // border: "1px solid black",
            width: "100vw",
            height: "100vh",
            padding: "5px",
            backgroundColor: colorsCosbiome.secondary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="col-md-3"
        >
          <div
            style={{
              // border: "1px solid red",
              height: "30%",
              color: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <div className="mt-2">
              <Calendar
                onChange={(date: Date) => {
                  setDate(date);

                  setChatSelect(undefined);
                }}
                value={date}
              />
            </div>
          </div>

          <div
            className="mt-5"
            style={{
              // border: "1px solid red",

              height: "55%",
              overflowY: "scroll",
              maxHeight: "55%",
              width: "100%",
              padding: "20px",
            }}
          >
            <ChatLIstComponent
              dataSelect={date}
              chatSelect={chatSelect}
              setChatSelect={setChatSelect}
              filters={`filters[vendedor][id][$eq]=${1}&filters[$and][1][fechamarcar][$gte]=${moment(
                date
              )
                .startOf("D")
                .toISOString()}&filters[$and][2][fechamarcar][$lte]=${moment(
                date
              )
                .endOf("D")
                .toISOString()}&pagination[limit]=100000&&filters[$and][3][cliente][nombre][$notNull]=true`}
            />
          </div>
        </div>
        <div
          style={{
            // border: "1px solid red",
            height: "100vh",
          }}
          className="col-md-9"
        >
          {chatSelect && <ChatComponent chat={chatSelect} />}
        </div>
      </div>
    </div>
  );
};

export default ChatUserPage;
