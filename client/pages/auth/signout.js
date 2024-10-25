import { useEffect } from "react";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const SignOut = () => {
  const { doRequest, errors } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => Router.push("/"),
  });

  useEffect(() => {
    doRequest();
  }, []);

  return (
    <div>
      <h3>Signing you out...</h3>
      {errors}
    </div>
  );
};

export default SignOut;
