import { Button, Form, Input, Select } from "antd";
import React, { useState } from "react";
import Swal from "sweetalert2";
import MediaTableComponent from "../components/MediaTableComponent";
import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { Datum } from "../interfaces/Chats";

export type categorias = "FACIAL" | "CORPORAL" | "DEPILACION";

export interface IFormValues {
  name: string;
  file: string;
  categoria: categorias;
  descripcion: string;
}

const LoadMediaPage = () => {
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [isLoading, setIsLoading] = useState(false);

  const [form] = Form.useForm();
  const { uploadfile, post } = useHttp();

  const onFinish = async (values: IFormValues) => {
    try {
      setIsLoading(true);
      const imageS3 = await uploadfile(formData);

      const data = {
        urls: `${imageS3},`,
        nombre: values.name,
        descripcion: values.descripcion,
        categoria: values.categoria,
      };

      await post("maquinas", { data: data });

      form.resetFields();

      Swal.fire({
        title: "Exito",
        text: "Se ha cargado el archivo correctamente",
        icon: "success",
        confirmButtonText: "Aceptar",
      });

      setIsLoading(false);
      setFormData(new FormData());
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Ha ocurrido un error al cargar el archivo",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
      setIsLoading(false);
      setFormData(new FormData());
    }
  };

  return (
    <div className="container">
      <div className="row mt-5">
        <div className="col-md-12">
          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Nombre"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese el nombre del archivo",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Archivo"
              name="file"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese el archivo",
                },
              ]}
            >
              <Input
                onChange={(e) => {
                  if (e.target.files) {
                    const fil = e.target.files[0];
                    const local = new FormData();
                    local.append("key", `crm/maquinas/${fil.name}`);
                    local.append("file", fil);

                    setFormData(local);
                  }
                }}
                type="file"
                accept="image/*"
              />
            </Form.Item>

            <Form.Item
              label="Categoria"
              name="categoria"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese la categoria",
                },
              ]}
            >
              <Select>
                <Select.Option value="FACIAL">FACIAL</Select.Option>
                <Select.Option value="COPORAL">COPORAL</Select.Option>
                <Select.Option value="DEPILACION">DEPILACION</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Descripcion" name="descripcion">
              <Input.TextArea />
            </Form.Item>

            <Button
              block
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
                color: "white",
              }}
              loading={isLoading}
            >
              Guardar
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoadMediaPage;
