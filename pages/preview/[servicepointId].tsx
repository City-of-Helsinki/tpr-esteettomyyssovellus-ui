import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { StatusLabel, IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../components/common/Layout";
import { store } from "../../state/store";
import i18nLoader from "../../utils/i18n";
import ServicepointLandingSummary from "../../components/ServicepointLandingSummary";
import styles from "./preview.module.scss";
import ServicepointLandingSummaryCtrlButtons from "../../components/ServicepointLandingSummaryCtrlButtons";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../components/PathTreeComponent";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
  setServicepointId,
  setEntranceId,
  setPhoneNumber,
  setEmail
} from "../../state/reducers/formSlice";
import { getFinnishDate, filterByLanguage } from "../../utils/utilFunctions";
import { setServicepointLocation } from "../../state/reducers/generalSlice";
import {
  API_FETCH_ANSWER_LOGS,
  API_FETCH_ENTRANCES,
  API_FETCH_SENTENCE_LANGS,
  API_FETCH_SERVICEPOINTS
} from "../../types/constants";
import PreviewPageLandingSummary from "../../components/PreviewPageLandingSummary";
import PreviewControlButtons from "../../components/PreviewControlButtons";

const preview = ({
  servicepointData,
  accessibilityData,
  entranceData
}: any): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const treeItems = [
    servicepointData["servicepoint_name"],
    "PH: Esteettömyystiedot"
  ];

  // Filter by language
  const filteredAccessibilityData: any = {};
  Object.keys(accessibilityData).map(function (key, index) {
    filteredAccessibilityData[key] = filterByLanguage(accessibilityData[key]);
  });

  // Update entranceId and servicepointId to redux state
  if (
    servicepointData &&
    entranceData.results &&
    accessibilityData["main"].length != 0
  ) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    // TODO: Logic for when editing additional entrance vs main entrance
    dispatch(setEntranceId(accessibilityData["main"][0].entrance_id));
  } else if (servicepointData && entranceData.results) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    // TODO: Logic for when editing additional entrance vs main entrance
    dispatch(setEntranceId(entranceData.results[0].entrance_id));
  }

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
              {i18n.t("common.mainEntrance")}
              {": "}
              {servicepointData.address_street_name}{" "}
              {servicepointData.address_no}, {servicepointData.address_city}
            </h2>
          </div>
          <div>
            <PreviewControlButtons />
          </div>
          <div>
            <PreviewPageLandingSummary
              header={i18n.t("servicepoint.contactFormSummaryHeader")}
              data={filteredAccessibilityData}
            />
          </div>
        </div>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  locales
}) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

  // Try except to stop software crashes when developing without backend running
  // TODO: Make this more reliable and change URLs and add to constants before production
  let accessibilityData: any = {};
  let entranceData;
  let servicepointData;
  let hasExistingFormData = false;
  let isFinished = false;
  if (params != undefined) {
    try {
      const ServicepointResp = await fetch(
        `${API_FETCH_SERVICEPOINTS}${params.servicepointId}/?format=json`
      );
      servicepointData = await ServicepointResp.json();

      const EntranceResp = await fetch(
        `${API_FETCH_ENTRANCES}?servicepoint=${servicepointData.servicepoint_id}&format=json`
      );
      entranceData = await EntranceResp.json();
      let i = 0;
      let j = 1;
      let mainEntranceId = 0;
      // Use while, because map function does not work with await
      while (i < entranceData.results.length) {
        const SentenceResp = await fetch(
          `${API_FETCH_SENTENCE_LANGS}?entrance_id=${entranceData.results[i].entrance_id}&format=json`
        );
        const sentenceData = await SentenceResp.json();
        if (entranceData.results[i].is_main_entrance == "Y") {
          accessibilityData["main"] = sentenceData;
          mainEntranceId = entranceData.results[i].entrance_id;
        } else {
          accessibilityData["side" + j] = sentenceData;
          j++;
        }
        i++;
      }

      if (entranceData.results.length != 0) {
        const LogResp = await fetch(
          `${API_FETCH_ANSWER_LOGS}?entrance=${mainEntranceId}`
        );
        const logData = await LogResp.json();

        // TODO: Should the this be true even if the form has not been submitted
        hasExistingFormData = logData.length != 0;
        isFinished = logData.some((e: any) => e["form_submitted"] == "Y");
      }
    } catch (err) {
      servicepointData = {};
      accessibilityData = {};
      entranceData = {};
    }
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
      entranceData,
      hasExistingFormData,
      isFinished
    }
  };
};

export default preview;
