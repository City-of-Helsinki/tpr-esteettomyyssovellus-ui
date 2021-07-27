import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { StatusLabel, IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../components/common/Layout";
import { store } from "../../state/store";
import i18nLoader from "../../utils/i18n";
import ServicepointLandingSummary from "../../components/ServicepointLandingSummary";
import styles from "./details.module.scss";
import ServicepointLandingSummaryCtrlButtons from "../../components/ServicepointLandingSummaryCtrlButtons";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import router from "next/router";
import { Dictionary } from "@reduxjs/toolkit";
import PathTreeComponent from "../../components/PathTreeComponent";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import {
  setServicepointId,
  setEntranceId,
  setPhoneNumber,
  setEmail,
} from "../../state/reducers/formSlice";
import { getFinnishDate, filterByLanguage } from "../../utils/utilFunctions";

import { setServicepointLocation } from "../../state/reducers/generalSlice";

const details = ({
  servicepointData,
  accessibilityData,
  entranceData,
}: any): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const treeItems = [servicepointData.servicepoint_name];
  const finnishDate = getFinnishDate(servicepointData.modified);
  const formInited = useAppSelector((state) => state.formReducer.formInited);

  // set coordinates from data to state gerenalSlice for e.g. leafletmaps
  if (
    servicepointData &&
    servicepointData.loc_northing &&
    servicepointData.loc_easting
  ) {
    const northing: number = servicepointData.loc_northing;
    const easthing: number = servicepointData.loc_easting;
    const coordinates: [number, number] = [easthing, northing];
    dispatch(
      setServicepointLocation({
        coordinates,
      })
    );
  }

  // Filter by language
  const filteredAccessibilityData: any = {};
  Object.keys(accessibilityData).map(function (key, index) {
    filteredAccessibilityData[key] = filterByLanguage(accessibilityData[key]);
  });

  // Update entranceId and servicepointId to redux state
  if (servicepointData && entranceData.results) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    // TODO: Logic for when editing additional entrance vs main entrance
    dispatch(setEntranceId(accessibilityData["main"][0].entrance_id));
  }

  const hasData =
    Object.keys(entranceData).length !== 0 ||
    Object.keys(servicepointData).length !== 0;

  if (hasData && !formInited) {
    if (servicepointData["accessibility_phone"] != undefined) {
      // TODO: POSSIBLY VALIDATE THESE STRAIGHT AWAY
      dispatch(setPhoneNumber(servicepointData["accessibility_phone"]));
    }
    if (servicepointData["accessibility_email"] != undefined) {
      // TODO: POSSIBLY VALIDATE THESE STRAIGHT AWAY
      dispatch(setEmail(servicepointData["accessibility_email"]));
    }
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
            <span className={styles.statuslabel}>
              {/* TODO: change statuslabel with data respectively */}
              <StatusLabel type="success"> PH: Valmis </StatusLabel>
              <p>
                {i18n.t("common.updated")} {finnishDate}
              </p>
            </span>
          </div>
          <div>
            <ServicepointLandingSummary
              header={i18n.t("servicepoint.contactInfoHeader")}
              data={servicepointData}
            />
            <ServicepointLandingSummary
              header={i18n.t("servicepoint.contactFormSummaryHeader")}
              data={filteredAccessibilityData}
            />
          </div>
          <ServicepointLandingSummaryCtrlButtons hasData={hasData} />
        </div>
      </main>
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  locales,
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
  if (params != undefined) {
    try {
      const ServicepointResp = await fetch(
        `http://0.0.0.0:8000/api/ArServicepoints/${params.servicepointId}/?format=json`
      );
      servicepointData = await ServicepointResp.json();

      const EntranceResp = await fetch(
        `http://0.0.0.0:8000/api/ArEntrances/?servicepoint=${servicepointData.servicepoint_id}&format=json`
      );
      entranceData = await EntranceResp.json();
      let i = 0;
      let j = 1;

      // Use while, because map function does not work with await
      while (i < entranceData.results.length) {
        const SentenceResp = await fetch(
          `http://0.0.0.0:8000/api/ArXStoredSentenceLangs/?entrance_id=${entranceData.results[i].entrance_id}&format=json`
        );
        const sentenceData = await SentenceResp.json();
        if (entranceData.results[i].is_main_entrance == "Y") {
          accessibilityData["main"] = sentenceData;
        } else {
          accessibilityData["side" + j] = sentenceData;
          j++;
        }
        i++;
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
    },
  };
};

export default details;
