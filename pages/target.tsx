import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import i18nLoader from "../utils/i18n";
import Layout from "../components/common/Layout";

const Target = (): ReactElement => {
  const i18n = useI18n();
  const router = useRouter();
  // IS THE LANGUAGECODE A NUMBER OR A STRING???
  // console.log(languageCode);
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
export const getServerSideProps: GetServerSideProps = async ({ locales, query }) => {
  const lngDict = await i18nLoader(locales);

  // console.log(params!.params);

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
  // if (params !== undefined && params.) {
  //   const languageCode = params.params!.languageCode;
  // }
  if (
    // CHECK URL PARAMS
    query?.systemId !== undefined ||
    query?.targetId !== undefined ||
    query?.locationId !== undefined ||
    query?.user !== undefined ||
    query?.validUntil !== undefined ||
    query?.name !== undefined ||
    query?.formId !== undefined ||
    query?.checksum !== undefined
  ) {
    // CHECK PARAMS AND REDIRECT
    return {
      props: {
        lngDict,
      },
    };
  }
  // TAKE TO ERROR PAGE
  return {
    props: {
      lngDict,
    },
  };
};

export default Target;
