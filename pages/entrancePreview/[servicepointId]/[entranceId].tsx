import React, { ReactElement, useEffect, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconQuestionCircle, Notification } from "hds-react";
import Layout from "../../../components/common/Layout";
import i18nLoader from "../../../utils/i18n";
import ServicepointLandingSummaryAccessibility from "../../../components/ServicepointLandingSummaryAccessibility";
import ServicepointLandingSummaryContact from "../../../components/ServicepointLandingSummaryContact";
import styles from "./preview.module.scss";
import QuestionInfo from "../../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../../components/PathTreeComponent";
import PreviewControlButtons from "../../../components/PreviewControlButtons";
import AddNewEntranceNotice from "../../../components/common/AddNewEntranceNotice";
import LoadSpinner from "../../../components/common/LoadSpinner";
import { useAppDispatch, useAppSelector, useLoading } from "../../../state/hooks";
import { setServicepointId, setEntranceId, setStartDate, setAnsweredChoice, setAnswer, setExtraAnswer } from "../../../state/reducers/formSlice";
import { filterByLanguage, getCurrentDate, getTokenHash } from "../../../utils/utilFunctions";
import {
  // API_FETCH_ANSWER_LOGS,
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_ANSWERS,
  API_FETCH_BACKEND_ENTRANCE_FIELD,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_SENTENCE_LANGS,
  API_FETCH_SERVICEPOINTS,
  API_URL_BASE,
} from "../../../types/constants";
import { persistor } from "../../../state/store";
import {
  // AnswerLog,
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceField,
  BackendServicepoint,
  Entrance,
  EntranceResults,
  Servicepoint,
  StoredSentence,
} from "../../../types/backendModels";
import { AccessibilityData, EntranceData, PreviewProps } from "../../../types/general";

// usage: the preview page of an entrance, displayed before saving the completed form
const Preview = ({
  servicepointData,
  servicepointDetail,
  accessibilityData,
  entranceData,
  questionAnswerData,
  questionExtraAnswerData,
  isMainEntrancePublished,
}: PreviewProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const treeItems = [servicepointData.servicepoint_name];

  const [isSendingComplete, setSendingComplete] = useState(false);

  // TODO - improve this by checking user on server-side
  const user = useAppSelector((state) => state.generalSlice.user);
  const isUserValid = !!user && user.length > 0;

  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);

  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);

  const entranceKey = Object.keys(accessibilityData)[0];

  useEffect(() => {
    // Update servicepointId and entranceId in redux state
    if (Object.keys(servicepointData).length > 0) {
      dispatch(setServicepointId(servicepointData.servicepoint_id));
      if (startedAnswering === "") {
        dispatch(setStartDate(getCurrentDate()));
      }
    }
    if (Object.keys(entranceData).length > 0) {
      dispatch(setEntranceId(entranceData[entranceKey].entrance_id));
    }

    // Put existing answers into redux state
    if (questionAnswerData.length > 0) {
      questionAnswerData.forEach((a: BackendEntranceAnswer) => {
        const questionId = a.question_id;
        const answer = a.question_choice_id;
        if (questionId !== undefined && answer !== undefined) {
          dispatch(setAnsweredChoice(answer));
          dispatch(setAnswer({ questionId, answer }));
        }
      });
    }

    // Put existing extra field answers into redux state
    if (questionExtraAnswerData.length > 0) {
      questionExtraAnswerData.forEach((ea: BackendEntranceField) => {
        const questionBlockFieldId = ea.question_block_field_id;
        const answer = ea.entry;
        if (questionBlockFieldId !== undefined && answer !== undefined) {
          dispatch(setExtraAnswer({ questionBlockFieldId, answer }));
        }
      });
    }
  }, [servicepointData, entranceData, questionAnswerData, questionExtraAnswerData, entranceKey, startedAnswering, dispatch]);

  const hasData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;

  // Filter by language
  const filteredAccessibilityData = hasData
    ? {
        [entranceKey]: filterByLanguage(accessibilityData[entranceKey], i18n.locale()),
      }
    : {};

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
      {!isUserValid && <h1>{i18n.t("common.notAuthorized")}</h1>}

      {isUserValid && isLoading && <LoadSpinner />}

      {isUserValid && !isLoading && !hasData && <h1>{i18n.t("common.noData")}</h1>}

      {isUserValid && !isLoading && hasData && (
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
              <div className={styles.entranceHeader}>
                <h2>{i18n.t("servicepoint.contactFormSummaryHeader")}</h2>
              </div>
            </div>

            {!isSendingComplete && (
              <div>
                <PreviewControlButtons hasSaveDraftButton={!isMainEntrancePublished} setSendingComplete={setSendingComplete} />

                {entranceKey === "main" && (
                  <ServicepointLandingSummaryContact
                    servicepointData={servicepointDetail}
                    entranceData={entranceData[entranceKey]}
                    hasData={hasData}
                  />
                )}

                <ServicepointLandingSummaryAccessibility
                  entranceKey={entranceKey}
                  entranceData={entranceData[entranceKey]}
                  servicepointData={servicepointData}
                  accessibilityData={filteredAccessibilityData}
                  hasData={hasData}
                />

                <div className={styles.footercontainer}>
                  <PreviewControlButtons hasSaveDraftButton={!isMainEntrancePublished} setSendingComplete={setSendingComplete} />
                </div>
              </div>
            )}

            {isSendingComplete && (
              <div className={styles.previewButtonHeader}>
                <Notification label={i18n.t("common.formSaved")} type="success">
                  {i18n.t("common.formSentAndSaved")}
                </Notification>

                <AddNewEntranceNotice />
              </div>
            )}
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, locales }) => {
  const lngDict = await i18nLoader(locales);

  let accessibilityData: AccessibilityData = {};
  let entranceData: EntranceData = {};
  let servicepointData: Servicepoint = {} as Servicepoint;
  let servicepointDetail: BackendServicepoint = {} as BackendServicepoint;
  let questionAnswerData: BackendEntranceAnswer[] = [];
  let questionExtraAnswerData: BackendEntranceField[] = [];
  // const hasExistingFormData = false;
  let isMainEntrancePublished = false;

  if (params !== undefined) {
    try {
      const servicepointResp = await fetch(`${API_URL_BASE}${API_FETCH_SERVICEPOINTS}${params.servicepointId}/?format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      servicepointData = await (servicepointResp.json() as Promise<Servicepoint>);

      const servicepointBackendDetailResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_SERVICEPOINT}?servicepoint_id=${params.servicepointId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const servicepointBackendDetail = await (servicepointBackendDetailResp.json() as Promise<BackendServicepoint[]>);

      if (servicepointBackendDetail?.length > 0) {
        servicepointDetail = servicepointBackendDetail[0];
      }

      // Get all the existing entrances for the service point
      const servicepointEntranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${params.servicepointId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const servicepointEntranceResults = await (servicepointEntranceResp.json() as Promise<EntranceResults>);

      const mainEntrance = servicepointEntranceResults?.results?.find((result) => result.is_main_entrance === "Y");
      if (!!mainEntrance) {
        // The main entrance exists, but check if it's published
        const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${mainEntrance.entrance_id}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
        isMainEntrancePublished = entranceDetail.some((e) => e.form_submitted === "Y");
      } else {
        isMainEntrancePublished = false;
      }

      // Check this specific entrance
      const entranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}${params.entranceId}?format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const entrance = await (entranceResp.json() as Promise<Entrance>);
      const entranceKey = entrance?.is_main_entrance === "N" ? "side" : "main";

      // Use the draft entrance
      const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${params.entranceId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
      const draftEntrance = entranceDetail.find((e) => e.form_submitted === "D");
      if (draftEntrance) {
        entranceData = {
          [entranceKey]: draftEntrance,
        };
      }

      // Get the draft entrance answer data needed for saving purposes
      const allQuestionAnswersResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_ANSWERS}?entrance_id=${params.entranceId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const allQuestionAnswerData = await (allQuestionAnswersResp.json() as Promise<BackendEntranceAnswer[]>);

      if (allQuestionAnswerData?.length > 0) {
        questionAnswerData = allQuestionAnswerData.filter((a) => a.form_submitted === "D");
      }

      const allQuestionExtraAnswersResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_FIELD}?entrance_id=${params.entranceId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const allQuestionExtraAnswerData = await (allQuestionExtraAnswersResp.json() as Promise<BackendEntranceField[]>);

      if (allQuestionExtraAnswerData?.length > 0) {
        questionExtraAnswerData = allQuestionExtraAnswerData.filter((a) => a.form_submitted === "D");
      }

      // Get the draft sentences for this entrance
      const sentenceResp = await fetch(`${API_URL_BASE}${API_FETCH_SENTENCE_LANGS}?entrance_id=${params.entranceId}&form_submitted=D&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const sentenceData = await (sentenceResp.json() as Promise<StoredSentence[]>);
      accessibilityData = {
        [entranceKey]: sentenceData,
      };

      /*
      if (servicepointEntranceData.results.length !== 0 && mainEntranceSentences?.entranceResult) {
        const logResp = await fetch(`${API_URL_BASE}${API_FETCH_ANSWER_LOGS}?entrance=${mainEntranceSentences?.entranceResult.entrance_id}&format=json`);
        const logData = await (logResp.json() as Promise<AnswerLog[]>);

        // TODO: Should this be true even if the form has not been submitted
        hasExistingFormData = logData.length !== 0;
      }
      */
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as Servicepoint;
      servicepointDetail = {} as BackendServicepoint;
      accessibilityData = {};
      entranceData = {};
      questionAnswerData = [];
      questionExtraAnswerData = [];
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      servicepointDetail,
      accessibilityData,
      entranceData,
      questionAnswerData,
      questionExtraAnswerData,
      // hasExistingFormData,
      isMainEntrancePublished,
    },
  };
};

export default Preview;
