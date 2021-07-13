import React, { ReactElement } from "react";
import Layout from "../components/common/Layout";
import { store } from "../state/store";
import { useI18n } from "next-localization";
import Head from "next/head";
import i18nLoader from "../utils/i18n";
import { GetServerSideProps } from "next";

const About = (): ReactElement => {
  const i18n = useI18n();

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content">
        <h1>About</h1>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ req, locales }) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }

  return {
    props: {
      initialReduxState,
      lngDict
    }
  };
};

export default About;
