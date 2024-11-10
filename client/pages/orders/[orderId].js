import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import { PUBLISHABLE_STRIPE_KEY } from "../../api/publishable-stripe-key";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState("");

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, [order]);

  if (timeLeft < 0) {
    return (
      <div>
        <h1>Order Expired</h1>
        <h4>Order has expired. Please try again.</h4>
      </div>
    );
  }

  return (
    <div>
      <h1>Order Show</h1>

      <h4>Time left to pay: {timeLeft} seconds</h4>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey={PUBLISHABLE_STRIPE_KEY}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
