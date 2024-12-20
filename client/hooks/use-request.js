import axios from "axios";
import { useState } from "react";

const useRequest = ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios[method](url, {
        ...body,
        ...props,
      });
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      console.log(err);
      setErrors(
        <div className="alert alert-danger">
          <h4>Something went wrong!</h4>
          {err.response.data.errors.map((err) => (
            <li key={err.message}>{err.message}</li>
          ))}
        </div>
      );
    }
  };

  return { doRequest, errors };
};

export default useRequest;
