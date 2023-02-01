import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import COSBIOME from "../assets/logos/cosbiome.png";
import { colorsCosbiome } from "../constants/colorSchemas";
import useHttp from "../hooks/useHttp";
import { IResponseLogin } from "../interfaces/Login";

interface IFormData {
  identifier: string;
  password: string;
}

const LoginPage = () => {
  const navigation = useNavigate();
  const { login } = useHttp();

  const onFinish = async (values: IFormData) => {
    try {
      const responseLogin: IResponseLogin = await login("auth/local", {
        identifier: values.identifier,
        password: values.password,
      });

      sessionStorage.setItem("token", responseLogin.jwt);
      sessionStorage.setItem("user", JSON.stringify(responseLogin.user));

      navigation("/crm");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Algo salió mal!",
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: colorsCosbiome.tertiary,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: colorsCosbiome.secondary,
          width: "90%",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <img
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            width: "20%",
          }}
          src={COSBIOME}
          alt="COSBIOME"
        />

        <Form
          className="mt-5"
          layout="vertical"
          style={{
            width: "100%",
          }}
          onFinish={onFinish}
        >
          <Form.Item
            label="NOMBRE DE USUARIO"
            name="identifier"
            rules={[
              {
                required: true,
                message: "Por favor ingrese su nombre de usuario",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="CONTRASEÑA"
            name="password"
            rules={[
              {
                required: true,

                message: "Por favor ingrese su contraseña",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            style={{
              width: "100%",
              backgroundColor: colorsCosbiome.primary,
              borderColor: colorsCosbiome.primary,
            }}
          >
            INGRESAR
          </Button>
        </Form>
        <div></div>
      </div>
    </div>
  );
};

export default LoginPage;
