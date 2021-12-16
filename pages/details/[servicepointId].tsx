import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { StatusLabel, IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../components/common/Layout";
import i18nLoader from "../../utils/i18n";
import ServicepointLandingSummary from "../../components/ServicepointLandingSummary";
import styles from "./details.module.scss";
import ServicepointLandingSummaryCtrlButtons from "../../components/ServicepointLandingSummaryCtrlButtons";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../components/PathTreeComponent";
import { useAppDispatch, useAppSelector, useLoading } from "../../state/hooks";
import {
  setServicepointId,
  setEntranceId,
  setPhoneNumber,
  setEmail,
  clearFormState,
  setFormFinished,
  setContinue,
  setFormSubmitted,
} from "../../state/reducers/formSlice";
import { getFinnishDate, filterByLanguage, convertCoordinates } from "../../utils/utilFunctions";
import { clearGeneralState, setServicepointLocation, setServicepointLocationWGS84 } from "../../state/reducers/generalSlice";
import { API_FETCH_ANSWER_LOGS, API_FETCH_ENTRANCES, API_FETCH_SENTENCE_LANGS, API_FETCH_SERVICEPOINTS } from "../../types/constants";
import LoadSpinner from "../../components/common/LoadSpinner";
import { clearAddinfoState } from "../../state/reducers/additionalInfoSlice";
import { AnswerLog, EntranceResults, Servicepoint, StoredSentence } from "../../types/backendModels";
import { AccessibilityData, DetailsProps } from "../../types/general";

// usage: the details / landing page of servicepoint
const Details = ({ servicepointData, accessibilityData, entranceData, hasExistingFormData, isFinished }: DetailsProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const treeItems = [servicepointData.servicepoint_name];
  const finnishDate = getFinnishDate(servicepointData.modified);
  const formInited = useAppSelector((state) => state.formReducer.formInited);

  // clear states, if more reducers added consider creating one clearing logic
  // this done so for not many reducers and user needs to stay in state
  dispatch(clearGeneralState());
  dispatch(clearAddinfoState());
  dispatch(clearFormState());

  const hasData = Object.keys(entranceData).length !== 0 || Object.keys(servicepointData).length !== 0;

  // set coordinates from data to state gerenalSlice for e.g. leafletmaps
  if (servicepointData && servicepointData.loc_northing && servicepointData.loc_easting) {
    const northing: number = servicepointData.loc_northing;
    const easthing: number = servicepointData.loc_easting;
    const coordinates: [number, number] = [easthing, northing];
    // @ts-ignore : ignore types because .reverse() returns number[]
    const coordinatesWGS84: [number, number] =
      coordinates && coordinates !== undefined ? convertCoordinates("EPSG:3067", "WGS84", coordinates).reverse() : coordinates;

    dispatch(
      setServicepointLocation({
        coordinates,
      })
    );

    dispatch(
      setServicepointLocationWGS84({
        coordinatesWGS84,
      })
    );
  }

  // Filter by language
  const filteredAccessibilityData: AccessibilityData = Object.keys(accessibilityData).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filterByLanguage(accessibilityData[key], i18n.locale()),
    };
  }, {});

  // Update entranceId and servicepointId to redux state
  if (servicepointData && entranceData.results && accessibilityData.main.length !== 0) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    // TODO: Logic for when editing additional entrance vs main entrance
    dispatch(setEntranceId(accessibilityData.main[0].entrance_id));
    if (accessibilityData.main[0].form_submitted === "Y") {
      dispatch(setFormFinished());
      dispatch(setContinue());
      dispatch(setFormSubmitted());
    }
  } else if (servicepointData && entranceData.results) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    // TODO: Logic for when editing additional entrance vs main entrance
    dispatch(setEntranceId(entranceData.results[0].entrance_id));
  }

  if (hasData && !formInited) {
    if (servicepointData.accessibility_phone !== undefined) {
      // TODO: POSSIBLY VALIDATE THESE STRAIGHT AWAY
      dispatch(setPhoneNumber(servicepointData.accessibility_phone));
    }
    if (servicepointData.accessibility_email !== undefined) {
      // TODO: POSSIBLY VALIDATE THESE STRAIGHT AWAY
      dispatch(setEmail(servicepointData.accessibility_email));
    }
  }

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      {isLoading ? (
        <LoadSpinner />
      ) : (
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
                {servicepointData.address_street_name} {servicepointData.address_no}, {servicepointData.address_city}
              </h2>
              <span className={styles.statuslabel}>
                {isFinished ? (
                  <StatusLabel type="success"> {i18n.t("common.statusReady")} </StatusLabel>
                ) : (
                  <StatusLabel type="neutral"> {i18n.t("common.statusNotReady")} </StatusLabel>
                )}

                <p>
                  {i18n.t("common.updated")} {finnishDate}
                </p>
              </span>
            </div>
            <div>
              <ServicepointLandingSummary header={i18n.t("servicepoint.contactInfoHeader")} data={servicepointData} />
              <ServicepointLandingSummary header={i18n.t("servicepoint.contactFormSummaryHeader")} data={filteredAccessibilityData} />
            </div>
            <ServicepointLandingSummaryCtrlButtons hasData={hasExistingFormData} />
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, locales }) => {
  const lngDict = await i18nLoader(locales);

  // todo: if user not checked here remove these
  // also reduxStore and reduxStore.getState() need to be changed to redux-toolkit
  // const reduxStore = store;
  // const initialReduxState = reduxStore.getState();

  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }

  let accessibilityData = {};
  let entranceData;
  let servicepointData;
  let hasExistingFormData = false;
  let isFinished = false;
  if (params !== undefined) {
    try {
      const ServicepointResp = await fetch(`${API_FETCH_SERVICEPOINTS}${params.servicepointId}/?format=json`);
      servicepointData = await (ServicepointResp.json() as Promise<Servicepoint>);

      const EntranceResp = await fetch(`${API_FETCH_ENTRANCES}?servicepoint=${servicepointData.servicepoint_id}&format=json`);
      entranceData = await (EntranceResp.json() as Promise<EntranceResults>);

      // Since await should not be used in a loop, the following code has been changed to use Promise.all instead
      /*
      let i = 0;
      let j = 1;
      let mainEntranceId = 0;
      // Use while, because map function does not work with await
      while (i < entranceData.results.length) {
        const SentenceResp = await fetch(`${API_FETCH_SENTENCE_LANGS}?entrance_id=${entranceData.results[i].entrance_id}&format=json`);
        const sentenceData = await SentenceResp.json();
        if (entranceData.results[i].is_main_entrance === "Y") {
          accessibilityData.main = sentenceData;
          mainEntranceId = entranceData.results[i].entrance_id;
        } else {
          accessibilityData[`side${j}`] = sentenceData;
          j++;
        }
        i++;
      }
      */

      const entranceResultSentences = await Promise.all(
        entranceData.results.map(async (entranceResult) => {
          const SentenceResp = await fetch(`${API_FETCH_SENTENCE_LANGS}?entrance_id=${entranceResult.entrance_id}&format=json`);
          const sentenceData = await (SentenceResp.json() as Promise<StoredSentence[]>);
          return { entranceResult, sentenceData };
        })
      );

      const mainResultSentences = entranceResultSentences.find((resultSentence) => resultSentence.entranceResult.is_main_entrance === "Y");

      const sideEntrances = entranceResultSentences
        .filter((resultSentence) => resultSentence.entranceResult.is_main_entrance !== "Y")
        .reduce((acc, resultSentence, j) => {
          return {
            ...acc,
            [`side${j + 1}`]: resultSentence.sentenceData,
          };
        }, {});

      accessibilityData = {
        main: mainResultSentences?.sentenceData,
        ...sideEntrances,
      };

      if (entranceData.results.length !== 0 && mainResultSentences?.entranceResult) {
        const LogResp = await fetch(`${API_FETCH_ANSWER_LOGS}?entrance=${mainResultSentences?.entranceResult.entrance_id}&format=json`);
        const logData = await (LogResp.json() as Promise<AnswerLog[]>);

        // TODO: Should this be true even if the form has not been submitted
        hasExistingFormData = logData.length !== 0;
        isFinished = logData.some((e) => e.form_submitted === "Y");
      }
    } catch (err) {
      servicepointData = {};
      accessibilityData = {};
      entranceData = {};
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      accessibilityData,
      entranceData,
      hasExistingFormData,
      isFinished,
    },
  };
};

export default Details;
