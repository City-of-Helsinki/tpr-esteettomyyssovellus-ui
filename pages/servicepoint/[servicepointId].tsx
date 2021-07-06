import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { StatusLabel, IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../components/common/Layout";
import { store } from "../../state/store";
import i18nLoader from "../../utils/i18n";
import ServicepointLandingSummary from "../../components/ServicepointLandingSummary";
import styles from "./servicepoint.module.scss";
import ServicepointLandingSummaryCtrlButtons from "../../components/ServicepointLandingSummaryCtrlButtons";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import router from "next/router";
import { Dictionary } from "@reduxjs/toolkit";
import PathTreeComponent from "../../components/PathTreeComponent";
import { useAppDispatch } from "../../state/hooks";
import { setServicepointId, setEntranceId } from "../../state/reducers/formSlice";

export const getFinnishDate = (jsonTimeStamp: Date) => {
  const date = new Date(jsonTimeStamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const finnish_date = day + "." + month + "." + year;
  return finnish_date;
};

export const filterByLanguage = (dict: Dictionary<any>) => {
  const i18n = useI18n();
  return dict.filter((entry: any) => {
    return entry.language_code == i18n.locale();
  });
};

const Servicepoint = ({ servicepointData, accessibilityData, entranceData }: any): ReactElement => {
  const i18n = useI18n();
  // TODO: Modify the format of the values displayed on the website.
  const finnishDate = getFinnishDate(servicepointData.modified);
  const dispatch = useAppDispatch();
  Object.keys(accessibilityData).map(function (key, index) {
    accessibilityData[key] = filterByLanguage(accessibilityData[key]);
  });
  console.log(entranceData.results.entrance_id);
  if (servicepointData && entranceData.results) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    dispatch(setEntranceId(entranceData.results[0].entrance_id));
  }
  const treeItems = [servicepointData.servicepoint_name];
  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      <main id="content">
        <div className={styles.maincontainer}>
          <div className={styles.treecontainer}>
            <PathTreeComponent treeItems={treeItems} />
          </div>
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
            <h2>
              PH: Pääsisäänkäynti: {servicepointData.address_street_name} {servicepointData.address_no}, {servicepointData.address_city}
            </h2>
            <span className={styles.statuslabel}>
              {/* TODO: change statuslabel with data respectively */}
              <StatusLabel type="success"> PH: Valmis </StatusLabel>
              {/* TODO: modify to format:  31.01.1780 */}
              <p>PH: päivitetty {finnishDate}</p>
            </span>
          </div>
          <div>
            {/* TODO: get proper data from SSR */}
            <ServicepointLandingSummary header={i18n.t("servicepoint.contactInfoHeader")} data={servicepointData} />
            <ServicepointLandingSummary header={i18n.t("servicepoint.contactFormSummaryHeader")} data={accessibilityData} />
          </div>
          <ServicepointLandingSummaryCtrlButtons hasData />
        </div>
      </main>
    </Layout>
  );
};

// Server-side rendering
// Todo: edit, get servicepoint data
export const getServerSideProps: GetServerSideProps = async ({ params, req, locales }) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  // Try except to stop software crashes when developing without backend running
  // TODO: Make this more reliable
  try {
    // @ts-ignore: params gives an error
    const res1 = await fetch(`http://0.0.0.0:8000/api/ArServicepoints/${params.servicepointId}/?format=json`);
    var servicepointData = await res1.json();
    //console.log(servicepointData.servicepoint_id)
    // @ts-ignore: params gives an error
    const res = await fetch(`http://0.0.0.0:8000/api/ArEntrances/?servicepoint=${servicepointData.servicepoint_id}&format=json`);
    var entranceData = await res.json();
    //console.log(entranceData.results[0].entrance_id)
    var i = 0;
    var j = 1;
    var accessibilityData: any = {};

    // Use while, because map function does not work with await
    while (i < entranceData.results.length) {
      const res2 = await fetch(`http://0.0.0.0:8000/api/ArXStoredSentenceLangs/?entrance_id=${entranceData.results[i].entrance_id}&format=json`);
      const data2 = await res2.json();
      if (entranceData.results[i].is_main_entrance == "Y") {
        accessibilityData["main"] = data2;
      } else {
        accessibilityData["side" + j] = data2;
        j++;
      }
      i++;
    }
  } catch (err) {
    servicepointData = {};
    accessibilityData = {};
    entranceData = {};
  }
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
      servicepointData,
      accessibilityData,
      entranceData
    }
  };
};

export default Servicepoint;
