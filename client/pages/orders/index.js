const OrderIndex = ({ orders }) => {
  const showOrders = orders.map((order) => {
    return (
      <tr key={order.id}>
        <td>{order.id}</td>
        <td>{order.ticket.title}</td>
        <td>{order.ticket.price}</td>
        <td>{order.status}</td>
      </tr>
    );
  });

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Ticket</th>
          <th>Price</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>{showOrders}</tbody>
    </table>
  );
};

OrderIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/orders");
  return { orders: data };
};

export default OrderIndex;
