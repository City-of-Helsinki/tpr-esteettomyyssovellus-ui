import React, { ReactElement } from "react";
import Layout from "../components/common/Layout";
import { store } from "../state/store";
import { useI18n } from "next-localization";
import Head from "next/head";
import i18nLoader from "../utils/i18n";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

const Target = (): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();
  // IS THE LANGUAGECODE A NUMBER OR A STRING???
  //console.log(languageCode);
  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      <main id="content">
        <h1>Target {router.locale}</h1>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({
  req,
  locales,
  params,
  query
}) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();
  //console.log(params!.params);
  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }

  //   GET app/{language code}/target/?
  // systemId={systemId}         => system
  // &targetId ={targetId}       => ext_servicepoint_id
  // &locationId ={locationId}   => location_id
  // &user={user}                => user
  // &validUntil={validUntil}    => ???
  // &name={name}                => name
  // &formId={formId}            => 2
  // &checksum={checksum}        => ???

  // let languageCode = "";
  // if (params != undefined && params.) {
  //   const languageCode = params.params!.languageCode;
  // }
  if (
    // CHECK URL PARAMS
    query?.systemId != undefined ||
    query?.targetId != undefined ||
    query?.locationId != undefined ||
    query?.user != undefined ||
    query?.validUntil != undefined ||
    query?.name != undefined ||
    query?.formId != undefined ||
    query?.checksum != undefined
  ) {
    // CHECK PARAMS AND REDIRECT
    return {
      props: {
        initialReduxState,
        lngDict
        //languageCode
      }
    };
  } else {
    // TAKE TO ERROR PAGE
    return {
      props: {
        initialReduxState,
        lngDict
        //languageCode
      }
    };
  }
};

export default Target;
