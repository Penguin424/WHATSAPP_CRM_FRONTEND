import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React, { useEffect } from "react";
import { colorsCosbiome } from "../constants/colorSchemas";
import { ICampanasDB } from "../interfaces/Camapanas";
import { IValuesFormCampanas } from "../pages/CampanasPage";

interface IPropsMOdalFormCampana {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (values: IValuesFormCampanas) => void;
  isLoading: boolean;
  campana?: ICampanasDB;
  setCampana: (campana: ICampanasDB | undefined) => void;
  handleUpdateCampana: (campana: IValuesFormCampanas) => void;
}

const ModalFormCampana = ({
  open,
  setOpen,
  onSubmit,
  isLoading,
  campana,
  setCampana,
  handleUpdateCampana,
}: IPropsMOdalFormCampana) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (campana) {
      form.setFieldsValue({
        nombre: campana.nombre,
        claves: campana.claves,
        etapas: campana.etapas.map((etapa) => etapa.nombre),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campana]);

  return (
    <Modal
      title="Nueva Campaña"
      open={open}
      onOk={() => {
        setOpen(false);
        setCampana(undefined);
        form.resetFields();
      }}
      onCancel={() => {
        setOpen(false);
        setCampana(undefined);
        form.resetFields();
      }}
      footer={null}
      width="80%"
    >
      <div className="row">
        <div className="col-12">
          <Form
            onFinish={campana ? handleUpdateCampana : onSubmit}
            form={form}
            layout="vertical"
            name="form_in_modal"
          >
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese el nombre de la campaña",
                },
              ]}
            >
              <Input type="text" />
            </Form.Item>
            <Form.Item
              name="claves"
              label="Palabras Clave"
              rules={[
                {
                  required: true,
                  message: "Por favor ingrese las palabras clave",
                },
              ]}
            >
              <TextArea rows={10} placeholder="Ejemplo:cosbiome,cosbiome2021" />
            </Form.Item>
            <Form.List
              name="etapas"
              rules={[
                {
                  validator: async (_, names) => {
                    if (!names || names.length < 2) {
                      return Promise.reject(
                        new Error("Necesitas al menos 2 etapas")
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      label={index === 0 ? "Etapas" : ""}
                      required={false}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={["onChange", "onBlur"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message:
                              "Por favor ingrese el nombre de la etapa o elimine este campo.",
                          },
                        ]}
                        noStyle
                      >
                        <Input
                          placeholder="etapa nombre"
                          style={{ width: "98%" }}
                        />
                      </Form.Item>
                      <MinusCircleOutlined
                        className="dynamic-delete-button ml-1"
                        onClick={() => remove(field.name)}
                      />
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      style={{ width: "100%" }}
                      icon={<PlusOutlined />}
                    >
                      Agregar etapa
                    </Button>

                    <Form.ErrorList errors={errors} />
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Button
              loading={isLoading}
              type="primary"
              htmlType="submit"
              block
              style={{
                backgroundColor: colorsCosbiome.primary,
                borderColor: colorsCosbiome.primary,
              }}
            >
              Crear
            </Button>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default ModalFormCampana;
