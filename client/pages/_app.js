import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/build-client";
import Header from "../components/header";
import Footer from "../components/footer";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header currentUser={currentUser} />
      <div className="container flex-grow-1">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
      <Footer className="mt-auto" />
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get("/api/users/currentuser");

  let pageProps = {};

  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }
  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
