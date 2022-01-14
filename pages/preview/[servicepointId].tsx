import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../components/common/Layout";
import i18nLoader from "../../utils/i18n";
import styles from "./preview.module.scss";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../components/PathTreeComponent";
import { useAppDispatch, useLoading } from "../../state/hooks";
import { setServicepointId, setEntranceId } from "../../state/reducers/formSlice";
import { filterByLanguage } from "../../utils/utilFunctions";
import { API_FETCH_ANSWER_LOGS, API_FETCH_ENTRANCES, API_FETCH_SENTENCE_LANGS, API_FETCH_SERVICEPOINTS } from "../../types/constants";
import PreviewPageLandingSummary from "../../components/PreviewPageLandingSummary";
import PreviewControlButtons from "../../components/PreviewControlButtons";
import LoadSpinner from "../../components/common/LoadSpinner";
import ServicepointLandingSummaryContent from "../../components/ServicepointLandingSummaryContent";
import MainEntranceLocationPicturesPreview from "../../components/MainEntranceLocationPicturesPreview";
import { AnswerLog, EntranceResults, Servicepoint, StoredSentence } from "../../types/backendModels";
import { AccessibilityData, PreviewProps } from "../../types/general";

// usage: preview page of servicepoint, displayed before saving completed form
const Preview = ({ servicepointData, accessibilityData, entranceData }: PreviewProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const treeItems = [servicepointData.servicepoint_name, i18n.t("common.header.title")];

  // Filter by language
  const filteredAccessibilityData: AccessibilityData = Object.keys(accessibilityData).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filterByLanguage(accessibilityData[key], i18n.locale()).filter((elem) => {
        return elem.form_submitted === "Y" || elem.form_submitted === "D";
      }),
    };
  }, {});

  // Update entranceId and servicepointId to redux state
  if (servicepointData && entranceData.results && accessibilityData.main.length !== 0) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    // TODO: Logic for when editing additional entrance vs main entrance
    dispatch(setEntranceId(accessibilityData.main[0].entrance_id));
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
            </div>
            <div>
              <PreviewControlButtons hasHeader />
            </div>
            <div>
              <ServicepointLandingSummaryContent contentHeader={i18n.t("PreviewPage.mainEntranceLocationHeader")}>
                <MainEntranceLocationPicturesPreview />
              </ServicepointLandingSummaryContent>
              <PreviewPageLandingSummary data={filteredAccessibilityData} />
            </div>
            <div>
              <PreviewControlButtons hasHeader={false} />
            </div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, locales }) => {
  const lngDict = await i18nLoader(locales);

  // Try except to stop software crashes when developing without backend running
  // TODO: Make this more reliable and change URLs and add to constants before production
  let accessibilityData = {};
  let entranceData;
  let servicepointData;
  let hasExistingFormData = false;
  let isFinished = false;
  if (params !== undefined) {
    try {
      const servicepointResp = await fetch(`${API_FETCH_SERVICEPOINTS}${params.servicepointId}/?format=json`);
      servicepointData = await (servicepointResp.json() as Promise<Servicepoint>);

      const entranceResp = await fetch(`${API_FETCH_ENTRANCES}?servicepoint=${servicepointData.servicepoint_id}&format=json`);
      entranceData = await (entranceResp.json() as Promise<EntranceResults>);

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
          const sentenceResp = await fetch(`${API_FETCH_SENTENCE_LANGS}?entrance_id=${entranceResult.entrance_id}&format=json`);
          const sentenceData = await (sentenceResp.json() as Promise<StoredSentence[]>);
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
        const logResp = await fetch(`${API_FETCH_ANSWER_LOGS}?entrance=${mainResultSentences?.entranceResult.entrance_id}&format=json`);
        const logData = await (logResp.json() as Promise<AnswerLog[]>);

        // TODO: Should this be true even if the form has not been submitted
        hasExistingFormData = logData.some((e) => e.form_submitted === "Y" || e.form_submitted === "D");
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

export default Preview;
