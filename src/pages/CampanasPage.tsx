import { DeleteFilled, EditOutlined, FileAddOutlined } from "@ant-design/icons";
import { Card, Form } from "antd";
import Meta from "antd/lib/card/Meta";
import React, { useContext, useEffect, useState } from "react";
import { Calendar } from "react-calendar";
import Swal from "sweetalert2";
import ModalFormCampana from "../components/ModalFormCampana";
import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { ICampanasDB } from "../interfaces/Camapanas";
import { GlobalContext } from "../providers/GlobalProvider";
import { strapiFlatten } from "../utils/flatten";

export interface IValuesFormCampanas {
  nombre: string;
  claves: string;
  etapas: string[];
}

const CampanasPage = () => {
  const [campanas, setCampanas] = useState<ICampanasDB[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [campanaEdit, setCampanaEdit] = useState<ICampanasDB | undefined>();
  const [dateRange, setDateRange] = useState<Date[]>([]);

  const [form] = Form.useForm();
  const { post, get, update, deleted } = useHttp();
  const { socket } = useContext(GlobalContext);

  useEffect(() => {
    handleGetCampanas();

    socket.on("campana:create", (data) => {
      let campanaCreate: ICampanasDB;

      if (data.data) {
        campanaCreate = strapiFlatten(data.data);
      } else {
        campanaCreate = strapiFlatten(data);
      }

      setCampanas((campanas) => [...campanas, campanaCreate]);
    });
    socket.on("campana:update", (data) => {
      let campanaUpdate: ICampanasDB;

      if (data.data) {
        campanaUpdate = strapiFlatten(data.data);
      } else {
        campanaUpdate = strapiFlatten(data);
      }

      setCampanas((campanas) =>
        campanas.map((campana) =>
          campana.id === campanaUpdate.id ? campanaUpdate : campana
        )
      );
    });

    return () => {
      socket.off("campana:create");
      socket.off("campana:update");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetCampanas = async () => {
    const campanasDB: { data: ICampanasDB[] } = await get(
      "campanas?populate[0]=etapas&populate[1]=chats&populate[2]=chats.etapa&pagination[limit]=100000"
    );

    setCampanas(campanasDB.data);
  };

  const handleOnSubmit = async (values: IValuesFormCampanas) => {
    try {
      setIsLoading(true);
      const etapasCreateDB: { data: { id: number } }[] = await Promise.all(
        values.etapas.map((etapa) =>
          post("etapas", {
            data: {
              nombre: etapa,
            },
          })
        )
      );

      await post(
        "campanas?populate[0]=etapas&populate[1]=chats&populate[2]=chats.etapa",
        {
          data: {
            nombre: values.nombre,
            claves: values.claves,
            etapas: etapasCreateDB.map((etapa) => etapa.data.id),
          },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Campaña creada",
        text: "La campaña se ha creado correctamente",
      });

      setIsLoading(false);
      setOpen(false);
      form.resetFields();
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal, por favor intente de nuevo",
      });
    }
  };

  const handleUpdateCampana = async (values: IValuesFormCampanas) => {
    try {
      setIsLoading(true);
      let idsNuevasEtapas: number[] = [];

      const extraLength =
        values.etapas.length > campanaEdit!.etapas.length
          ? values.etapas.length - campanaEdit!.etapas.length
          : 0;

      for (
        let index = 0;
        index < campanaEdit!.etapas.length + extraLength;
        index++
      ) {
        const etapa = campanaEdit?.etapas[index];
        const etapaForm = values.etapas[index];

        const isChanged =
          values.etapas.length > campanaEdit!.etapas.length
            ? values?.etapas.find((etapaDB) => etapaDB === etapa?.nombre)
            : campanaEdit?.etapas.find(
                (etapaDB) => etapaDB.nombre === etapaForm
              );

        if (!isChanged) {
          if (values.etapas.length === campanaEdit?.etapas.length) {
            await update(`etapas/${etapa!.id}`, {
              data: {
                nombre: etapaForm,
              },
            });
          } else if (values.etapas.length > campanaEdit!.etapas.length) {
            const etapaDBCreate: { data: { id: number } } = await post(
              "etapas",
              {
                data: {
                  nombre: etapaForm,
                },
              }
            );

            idsNuevasEtapas.push(etapaDBCreate.data.id);
          } else if (values.etapas.length < campanaEdit!.etapas.length) {
            await deleted(`etapas/${etapa!.id}`);
          }
        }
      }

      await update(
        `campanas/${campanaEdit?.id}?populate[0]=etapas&populate[1]=chats&populate[2]=chats.etapa`,
        {
          data:
            values.etapas.length > campanaEdit!.etapas.length
              ? {
                  nombre: values.nombre,
                  claves: values.claves,
                  etapas: [
                    ...campanaEdit!.etapas.map((etapa) => etapa.id),
                    ...idsNuevasEtapas,
                  ],
                }
              : {
                  nombre: values.nombre,
                  claves: values.claves,
                },
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Campaña actualizada",
        text: "La campaña se ha actualizado correctamente",
      });

      setIsLoading(false);
      setOpen(false);
      form.resetFields();
    } catch (error) {
      setIsLoading(false);

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal, por favor intente de nuevo",
      });
    }
  };

  return (
    <>
      <ModalFormCampana
        isLoading={isLoading}
        open={open}
        onSubmit={handleOnSubmit}
        setOpen={setOpen}
        campana={campanaEdit}
        setCampana={setCampanaEdit}
        handleUpdateCampana={handleUpdateCampana}
      />
      <div
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 70,
          height: 70,
          borderRadius: 50,
          backgroundColor: colorsCosbiome.primary,
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <FileAddOutlined
          style={{
            fontSize: 30,
          }}
        />
      </div>
      <div className="container">
        <h1 className="text-center">CAMPAÑAS</h1>

        <div className="row">
          <div className="col-12 col-md-12 col-lg-12 mt-3">
            <Calendar
              selectRange
              onChange={async (e: Date[]) => {
                setDateRange(e);
              }}
            />
          </div>
        </div>
        <div className="row">
          {campanas.map((campana) => {
            const procentajeVenta =
              (campana.chats
                .filter(
                  (chat) =>
                    new Date(chat.createdAt) >= dateRange[0] &&
                    new Date(chat.createdAt) <= dateRange[1]
                )
                .filter((a) => a.etapa.nombre === "VENTA CONCLUIDA").length /
                campana.chats.filter(
                  (chat) =>
                    new Date(chat.createdAt) >= dateRange[0] &&
                    new Date(chat.createdAt) <= dateRange[1]
                ).length) *
              100;

            return (
              <div className="col-12 col-md-6 col-lg-4 mt-3" key={campana.id}>
                <Card
                  style={{ width: 300, marginTop: 16 }}
                  actions={[
                    <DeleteFilled key="setting" />,
                    <EditOutlined
                      key="edit"
                      onClick={() => {
                        setCampanaEdit(campana);
                        setOpen(true);
                      }}
                    />,
                    // <EllipsisOutlined key="ellipsis" />,
                  ]}
                >
                  <Meta
                    title={campana.nombre}
                    description={
                      <>
                        <p>
                          Chats:{" "}
                          {
                            campana.chats.filter(
                              (chat) =>
                                new Date(chat.createdAt) >= dateRange[0] &&
                                new Date(chat.createdAt) <= dateRange[1]
                            ).length
                          }
                        </p>
                        <p>Palabras Clave: {campana.claves}</p>
                        <div>
                          <small>ETAPAS </small>

                          {campana.etapas.map((etapa) => {
                            return (
                              <p key={etapa.id}>
                                {etapa.nombre}:{" "}
                                {
                                  campana.chats.filter(
                                    (chat) =>
                                      chat.etapa.id === etapa.id &&
                                      new Date(chat.createdAt) >=
                                        dateRange[0] &&
                                      new Date(chat.createdAt) <= dateRange[1]
                                  ).length
                                }
                              </p>
                            );
                          })}
                        </div>
                        <p>
                          {procentajeVenta === Infinity
                            ? "0%"
                            : procentajeVenta.toFixed(2) + "%"}
                        </p>
                      </>
                    }
                  />
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CampanasPage;
