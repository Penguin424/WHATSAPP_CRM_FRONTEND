import { Card } from "antd";
import React from "react";
import { IChatsDB as Chat } from "../interfaces/Chats";
import { categorias } from "../pages/LoadMediaPage";
import MediaCardsComponent from "./MediaCardsComponent";

interface IPropsMediaCardsComponent {
  chat: Chat;
}

const MediaTableComponent = ({ chat }: IPropsMediaCardsComponent) => {
  const [keyTab, setKeyTab] = React.useState<categorias>("FACIAL");

  const tabListNoTitle = [
    {
      key: "FACIAL",
      tab: "FACIAL",
    },
    {
      key: "CORPORAL",
      tab: "CORPORAL",
    },
    {
      key: "DEPILACION",
      tab: "DEPILACION",
    },
  ];

  const contentListNoTitle: Record<string, React.ReactNode> = {
    FACIAL: <MediaCardsComponent chat={chat} categoria="FACIAL" />,
    CORPORAL: <MediaCardsComponent chat={chat} categoria="CORPORAL" />,
    DEPILACION: <MediaCardsComponent chat={chat} categoria="DEPILACION" />,
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        tabList={tabListNoTitle}
        onTabChange={(value) => {
          setKeyTab(value as categorias);
        }}
      >
        {contentListNoTitle[keyTab]}
      </Card>
    </div>
  );
};

export default MediaTableComponent;
