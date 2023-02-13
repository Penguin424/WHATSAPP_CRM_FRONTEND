import { useState } from "react";
import ChatComponent from "../components/ChatComponent";
import ChatLIstComponent from "../components/ChatLIstComponent";
import { colorsCosbiome } from "../constants/colorSchemas";
import { IChatsDB } from "../interfaces/Chats";
import moment from "moment";

const ContactoDiaClienetes = () => {
  const [chatSelect, setChatSelect] = useState<IChatsDB | undefined>();

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
          <ChatLIstComponent
            chatSelect={chatSelect}
            setChatSelect={setChatSelect}
            filters={`filters[$and][0][createdAt][$gte]=${moment()
              .add(-1, "d")
              .startOf("D")
              .toISOString()}&filters[$and][1][createdAt][$lte]=${moment()
              .endOf("D")
              .toISOString()}&pagination[limit]=100000&&filters[$and][2][cliente][nombre][$notNull]=true`}
            isDailyChat={true}
            dataSelect={new Date()}
          />
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

export default ContactoDiaClienetes;
