import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Layout from "../components/common/Layout";
import { store } from "../state/store";
import i18nLoader from "../utils/i18n";
import { useRouter } from "next/router";
import { FRONT_URL_BASE } from "../types/constants";

const Servicepoints = (): ReactElement => {
  const i18n = useI18n();

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      <main id="content">
        <h1>Sovelluksessa tapahtui virhe</h1>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  locales,
  query
}) => {
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

  let SystemData;
  if (query != undefined) {
    if (
      query?.systemId == undefined // ||
      // params?.servicePointId == undefined ||
      // params?.user == undefined ||
      // params?.validUntil == undefined ||
      // params?.name == undefined ||
      // params?.streetAddress == undefined
    ) {
      return {
        props: {
          initialReduxState,
          lngDict
        }
      };
    } else {
      try {
        const SystemResp = await fetch(
          `http://0.0.0.0:8000/api/ArSystems/?system_id=${query.systemId}&format=json`
        );
        SystemData = await SystemResp.json();
        console.log(SystemData);
        const systemName = SystemData[0]["name"];
        const checksumSecret = SystemData[0]["checksum_secret"];

        // LOMAKE 0 ja 1: systemName = "TPR" || "PTV"
        // LOMAKE 2: systemName = "HKI KOKOUSTILAT"
        console.log(systemName);
        if (!(systemName == "TPR" || systemName == "PTV")) {
          throw new Error(
            "A servicepoint with this systemId cannot use form 0 or 1"
          );
        }

        console.log(systemName, checksumSecret);
        return {
          redirect: {
            permanent: false,
            destination: FRONT_URL_BASE + "details/" + query.servicePointId
          },
          props: {}
        };

        //router.push(FRONT_URL_BASE + "details/" + params.servicePointId);
      } catch (err) {
        console.log(err);
      }

      // systemId=e186251e-1fb6-4f21-901c-cb6820aee164
      // &servicePointId=3266
      // &user=uusiesteettomyys%40hel.fi
      // &validUntil=2021-07-08T11%3a34%3a16
      // &name=Kallion+kirjasto
      // &streetAddress=Kuudes+linja+11
      // &postOffice=Helsinki
      // &northing=6673631
      // &easting=386500
      // &checksum=90CE983598EB80B3A7332B700C0CA5E8C4FF3E6689CA4FB5C2000BCB578843C6
    }
  }
  return {
    props: {
      initialReduxState,
      lngDict
    }
  };
};

export default Servicepoints;
