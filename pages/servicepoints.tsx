import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Layout from "../components/common/Layout";
import { initStore } from "../state/store";
import { CLEAR_STATE } from "../types/constants";

import i18nLoader from "../utils/i18n";
import { checkUser } from "../utils/serverside";

const Servicepoints = (): ReactElement => {
  const i18n = useI18n();

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      <main id="content">
        <h1>Servicepoints</h1>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ req, locales }) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = initStore();
  reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  const user = await checkUser(req);
  if (!user) {
    // Invalid user but login is not required
  }
  if (user && user.authenticated) {
    initialReduxState.general.user = user;
  }

  return {
    props: {
      initialReduxState,
      lngDict,
    },
  };
};

export default Servicepoints;
