import axios from "axios";

const useHttp = () => {
  const endpointserver = "http://192.168.1.63:1337/api/";

  const get = async (url: string): Promise<any> => {
    try {
      let req = await axios.get(`${endpointserver}${url}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const getAfterLogin = async (url: string, auth: string): Promise<any> => {
    try {
      let req = await axios.get(`${endpointserver}${url}`, {
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const post = async (url: string, body: object): Promise<any> => {
    try {
      let req = await axios.post(`${endpointserver}${url}`, body, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const update = async (url: string, body: object): Promise<any> => {
    try {
      let req = await axios.put(`${endpointserver}${url}`, body, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const deleted = async (url: string): Promise<any> => {
    try {
      let req = await axios.delete(`${endpointserver}${url}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const login = async (url: string, body: object): Promise<any> => {
    try {
      let req = await axios.post(
        `${endpointserver}${url}`,
        JSON.stringify(body),
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );

      return req.data;
    } catch (error) {
      throw Error(error as any);
    }
  };

  const uploadfile = async (body: FormData) => {
    const url = "https://cosbiome.s3.us-east-2.amazonaws.com/";

    await axios.post(url, body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return url + body.get("key");
  };

  return {
    get,
    getAfterLogin,
    post,
    update,
    deleted,
    login,
    uploadfile,
  };
};

export default useHttp;
