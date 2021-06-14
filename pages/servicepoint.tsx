import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { StatusLabel, IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../components/common/Layout";
import { store } from "../state/store";
import i18nLoader from "../utils/i18n";
import ServicepointLandingSummary from "../components/ServicepointLandingSummary";
import styles from "./servicepoint.module.scss";
import ServicepointLandingSummaryCtrlButtons from "../components/ServicepointLandingSummaryCtrlButtons";
import QuestionInfo from "../components/QuestionInfo";
import ServicepointMainInfoContent from "../components/ServicepointMainInfoContent";

const Servicepoint = ({servicepointData}: any): ReactElement => {
  const i18n = useI18n();

  // TODO: Modify the format of the values displayed on the website.
  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      <main id="content">
        <div className={styles.maincontainer}>
          <div className={styles.infocontainer}>
            <QuestionInfo
              openText={i18n.t("common.generalMainInfoIsClose")}
              closeText={i18n.t("common.generalMainInfoIsOpen")}
              openIcon={<IconQuestionCircle />}
              closeIcon={<IconCrossCircle />}
              textOnBottom
            >
              <ServicepointMainInfoContent />
            </QuestionInfo>
          </div>
          <div className={styles.headingcontainer}>
            <h1>{servicepointData.servicepoint_name}</h1>
            <h2>Pääsisäänkäynti: {servicepointData.address_street_name} {servicepointData.address_no}, 00100 {servicepointData.address_city}</h2>
            <span className={styles.statuslabel}>
              {/* TODO: change statuslabel with data respectively */}
              <StatusLabel type="success"> PH: Valmis </StatusLabel>
              {/* TODO: modify to format:  31.01.1780 */}
              <p>päivitetty {servicepointData.modified}</p>
            </span>
          </div>
          <div>
            {/* TODO: get proper data from SSR */}
            <ServicepointLandingSummary header={i18n.t("servicepoint.contactInfoHeader")} />
            <ServicepointLandingSummary header={i18n.t("servicepoint.contactFormSummaryHeader")} data />
          </div>
          <ServicepointLandingSummaryCtrlButtons hasData />
        </div>
      </main>
    </Layout>
  );
};

// Server-side rendering
// Todo: edit, get servicepoint data
export const getServerSideProps: GetServerSideProps = async ({ req, locales }) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();


  const res = await fetch('http://localhost:8000/api/ArServicepoints/69/?format=json')
  const servicepointData = await res.json();
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
      lngDict,
      servicepointData
    },
  };
};

export default Servicepoint;
