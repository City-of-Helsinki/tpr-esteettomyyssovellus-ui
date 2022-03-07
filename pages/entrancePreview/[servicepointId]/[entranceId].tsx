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
}: PreviewProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const treeItems = [servicepointData.servicepoint_name];

  const [isSendingComplete, setSendingComplete] = useState(false);

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

  // Filter by language
  const filteredAccessibilityData = {
    [entranceKey]: filterByLanguage(accessibilityData[entranceKey], i18n.locale()),
  };

  const hasAccessibilityData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;

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
              <div className={styles.entranceHeader}>
                <h2>{i18n.t("servicepoint.contactFormSummaryHeader")}</h2>
              </div>
            </div>

            {!isSendingComplete && (
              <div>
                <PreviewControlButtons setSendingComplete={setSendingComplete} />

                {entranceKey === "main" && (
                  <ServicepointLandingSummaryContact
                    servicepointData={servicepointDetail}
                    entranceData={entranceData[entranceKey]}
                    hasData={hasAccessibilityData}
                  />
                )}

                <ServicepointLandingSummaryAccessibility
                  entranceKey={entranceKey}
                  entranceData={entranceData[entranceKey]}
                  servicepointData={servicepointData}
                  servicepointDetail={servicepointDetail}
                  accessibilityData={filteredAccessibilityData}
                  hasData={hasAccessibilityData}
                />

                <PreviewControlButtons setSendingComplete={setSendingComplete} />
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
  const hasExistingFormData = false;
  const isFinished = false;

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

      const servicepointEntranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}${params.entranceId}?format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const servicepointEntranceData = await (servicepointEntranceResp.json() as Promise<Entrance>);
      const entranceKey = servicepointEntranceData?.is_main_entrance === "N" ? "side" : "main";

      // Use the draft entrance
      const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${params.entranceId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
      const entrance = entranceDetail.find((e) => e.form_submitted === "D");
      if (entrance) {
        entranceData = {
          [entranceKey]: entrance,
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
        isFinished = logData.some((e) => e.form_submitted === "Y");
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
      hasExistingFormData,
      isFinished,
    },
  };
};

export default Preview;
