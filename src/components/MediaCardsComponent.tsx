import { Button, Card, Input } from "antd";
import React, { useEffect, useState } from "react";
import { IMaquinaWeb } from "../interfaces/Maquinas";
import { IChatsDB as Chat } from "../interfaces/Chats";
import { categorias } from "../pages/LoadMediaPage";
import Swal from "sweetalert2";
import { colorsCosbiome } from "../constants/colorSchemas";
import { DeleteFilled } from "@ant-design/icons";
import useHttp from "../hooks/useHttp";

const { Search } = Input;

interface IPropsMediaCardsComponent {
  categoria: categorias;
  chat: Chat;
}

const MediaCardsComponent = ({
  categoria,
  chat,
}: IPropsMediaCardsComponent) => {
  const [maquinas, setMaquinas] = useState<IMaquinaWeb[]>([]);
  const [idSubFamily, setIdSubFamily] = useState<number>(0);
  const [urls, setUrls] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { post } = useHttp();

  useEffect(() => {
    handleGetMaquians();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSearch("");

    switch (categoria) {
      case "FACIAL":
        setIdSubFamily(1);
        break;
      case "CORPORAL":
        setIdSubFamily(2);
        break;
      case "DEPILACION":
        setIdSubFamily(3);
        break;
      default:
        setIdSubFamily(1);
        break;
    }
  }, [categoria]);

  const handleGetMaquians = async () => {
    const maquinasDB = await fetch("https://api.cosbiome.com/api/productos");
    const maquinasDBJson: { mensaje: IMaquinaWeb[] } = await maquinasDB.json();

    setMaquinas(maquinasDBJson.mensaje);
  };

  const handleSubmitUrls = async () => {
    if (urls.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No hay archivos",
        text: "No hay archivos para enviar!",
      });
      return;
    }

    try {
      setIsLoading(true);

      for await (const url of urls) {
        await post("mensajes", {
          mensaje: url,
          a: chat.cliente.telefono,
          de: "5213319747514@c.us",
          vendedor: 1,
          chat: chat.id,
          isMedia: true,
        });
      }

      await Swal.fire({
        icon: "success",
        title: "Archivos enviados",
        text: "Los archivos se enviaron correctamente!",
      });

      setIsLoading(false);
      setUrls([]);
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrio un error al enviar los archivos!",
      });
    }
  };

  return (
    <div>
      <h1>{categoria}</h1>
      <div className="row">
        <div className="col-md-12 mb-5">
          <Search
            placeholder="Buscar"
            onSearch={(value) => {
              setSearch(value);
            }}
            style={{ width: "100%" }}
          />
        </div>
        {urls.length > 0 && (
          <>
            <div className="col-md-10">
              <ul>
                {urls.map((url) => (
                  <li
                    key={url}
                    style={{
                      display: "flex",
                    }}
                  >
                    <p className="mr-2">
                      {
                        maquinas.filter((a) => {
                          return (
                            a.image === url.split("https://cosbiome.com/")[1]
                          );
                        })[0].product
                      }
                    </p>
                    <DeleteFilled
                      onClick={() => {
                        setUrls(urls.filter((a) => a !== url));
                      }}
                      style={{
                        color: "red",
                        fontSize: "16px",
                        cursor: "pointer",
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-md-2">
              <Button
                type="primary"
                style={{
                  backgroundColor: colorsCosbiome.primary,
                  borderColor: colorsCosbiome.primary,
                }}
                block
                onClick={handleSubmitUrls}
                loading={isLoading}
              >
                Enviar
              </Button>
            </div>{" "}
          </>
        )}
      </div>

      <div
        className="row"
        style={{
          width: "75vw",
          height: "60vh",
          maxHeight: "60vh",
          overflowY: "scroll",
        }}
      >
        {maquinas
          .filter((maquina) =>
            maquina.product.toLowerCase().includes(search.toLowerCase())
          )
          .filter((maquina) => maquina.id_family === 1)
          .filter((maquina) => maquina.id_subfamily === idSubFamily)
          .map((maquina) => {
            const isAdded = urls.includes(
              `https://cosbiome.com/${maquina.image}`
            );

            return (
              <div className="col-md-3 col-xs-6" key={maquina.id}>
                <Card
                  onClick={() => {
                    if (!isAdded) {
                      setUrls([
                        ...urls,
                        `https://cosbiome.com/${maquina.image}`,
                      ]);
                    } else {
                      Swal.fire({
                        icon: "info",
                        title: "Archivo ya agregado",
                        text: "Ya agregaste esta maquina!",
                      });
                    }
                  }}
                  className="m-1"
                  hoverable
                  style={{ width: 240 }}
                  cover={
                    <img
                      alt="example"
                      src={`https://cosbiome.com/${maquina.image}`}
                    />
                  }
                >
                  <Card.Meta title={maquina.product} />
                </Card>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MediaCardsComponent;
