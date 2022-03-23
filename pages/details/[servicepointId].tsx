import React, { ReactElement, useEffect } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconQuestionCircle, StatusLabel } from "hds-react";
import Layout from "../../components/common/Layout";
import i18nLoader from "../../utils/i18n";
import SummarySideNavigation from "../../components/SummarySideNavigation";
import ServicepointLandingSummaryContact from "../../components/ServicepointLandingSummaryContact";
import ServicepointLandingSummaryNewButton from "../../components/ServicepointLandingSummaryNewButton";
import ServicepointLandingSummaryModifyButton from "../../components/ServicepointLandingSummaryModifyButton";
import styles from "./details.module.scss";
import QuestionInfo from "../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../components/PathTreeComponent";
import { useAppDispatch, useAppSelector, useLoading } from "../../state/hooks";
import { setServicepointId } from "../../state/reducers/formSlice";
import { convertCoordinates, filterByLanguage, formatAddress, getFinnishDate, getTokenHash } from "../../utils/utilFunctions";
import { setServicepointLocation, setServicepointLocationWGS84 } from "../../state/reducers/generalSlice";
import {
  // API_FETCH_ANSWER_LOGS,
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_ANSWERS,
  API_FETCH_BACKEND_SENTENCES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_QUESTIONBLOCK_URL,
  API_FETCH_QUESTIONCHOICES,
  API_FETCH_QUESTION_URL,
  API_FETCH_SERVICEPOINTS,
  API_URL_BASE,
} from "../../types/constants";
import LoadSpinner from "../../components/common/LoadSpinner";
import { persistor } from "../../state/store";
import {
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceSentence,
  BackendQuestion,
  BackendQuestionBlock,
  BackendQuestionChoice,
  BackendServicepoint,
  EntranceResults,
  Servicepoint,
} from "../../types/backendModels";
import {
  AccessibilityData,
  DetailsProps,
  EntranceAnswerData,
  EntranceData,
  QuestionBlockData,
  QuestionChoiceData,
  QuestionData,
} from "../../types/general";

// usage: the details / landing page of servicepoint
const Details = ({
  servicepointData,
  servicepointDetail,
  accessibilityData,
  entranceData,
  // hasExistingFormData,
  isMainEntrancePublished,
  questionsData,
  questionChoicesData,
  questionBlocksData,
  questionAnswerData,
}: DetailsProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const treeItems = [servicepointData.servicepoint_name ?? ""];
  const finnishDate = getFinnishDate(servicepointData.modified);

  // TODO - improve this by checking user on server-side
  const user = useAppSelector((state) => state.generalSlice.user);
  const isUserValid = !!user && user.length > 0;

  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);

  // const hasData = Object.keys(servicepointData).length > 0 && Object.keys(entranceData).length > 0;
  const hasData = Object.keys(servicepointData).length > 0;
  const hasMainAccessibilityData = accessibilityData && accessibilityData.main && accessibilityData.main.length > 0;

  useEffect(() => {
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

    // Update servicepointId in redux state
    if (servicepointData) {
      dispatch(setServicepointId(servicepointData.servicepoint_id));
    }

    /*
    if (hasData && accessibilityData.main.length !== 0 && accessibilityData.main[0].form_submitted === "Y") {
      dispatch(setFormFinished());
      dispatch(setContinue());
      dispatch(setFormSubmitted());
    }
    */
  }, [servicepointData, entranceData, accessibilityData, hasData, dispatch]);

  // Filter by language
  // Make sure that the main entrance is listed before the side entrances.
  const filteredAccessibilityData: AccessibilityData = Object.keys(accessibilityData).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filterByLanguage(accessibilityData[key], i18n.locale()),
    };
  }, {});
  const entranceKeys = Object.keys(filteredAccessibilityData);
  const subHeader = `${i18n.t("common.mainEntrance")}: ${formatAddress(
    servicepointData.address_street_name,
    servicepointData.address_no,
    servicepointData.address_city
  )}`;

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
              <div className={styles.subHeader}>{subHeader}</div>

              <span className={styles.statuslabel}>
                {isMainEntrancePublished ? (
                  <StatusLabel type="success"> {i18n.t("common.statusReady")} </StatusLabel>
                ) : (
                  <StatusLabel type="neutral"> {i18n.t("common.statusNotReady")} </StatusLabel>
                )}

                <p>
                  {i18n.t("common.updated")} {finnishDate}
                </p>
              </span>

              {/*
              <div className={styles.entranceHeader}>
                <h2>{`${i18n.t("servicepoint.contactFormSummaryHeader")} (${entranceKeys.length} ${
                  entranceKeys.length === 1 ? i18n.t("servicepoint.numberOfEntrances1") : i18n.t("servicepoint.numberOfEntrances2+")
                })`}</h2>

                {servicepointDetail.new_entrance_possible === "Y" && <ServicepointLandingSummaryNewButton />}
              </div>
              */}

              <h2>{i18n.t("common.mainEntrance")}</h2>
            </div>

            <ServicepointLandingSummaryContact
              servicepointData={servicepointDetail}
              entranceData={entranceData.main}
              hasData={hasMainAccessibilityData}
              hasModifyButton
            />

            {entranceKeys.map((key, index) => {
              const hasAccessibilityData = accessibilityData && accessibilityData[key] && accessibilityData[key].length > 0;

              return (
                <div key={`summary_${key}`} className={styles.summarycontainer}>
                  {index === 1 && <h2>{i18n.t("common.additionalEntrances")}</h2>}

                  <div className={styles.headercontainer}>
                    <h3>{key === "main" ? i18n.t("common.mainEntrance") : `${i18n.t("common.additionalEntrance")} ${index}`}</h3>
                    {key !== "main" && <ServicepointLandingSummaryModifyButton entranceData={entranceData[key]} hasData={hasAccessibilityData} />}
                  </div>

                  <SummarySideNavigation
                    key={`sidenav_${key}`}
                    entranceKey={key}
                    entranceData={entranceData[key]}
                    servicepointData={servicepointData}
                    accessibilityData={filteredAccessibilityData}
                    questionsData={questionsData}
                    questionChoicesData={questionChoicesData}
                    questionBlocksData={questionBlocksData}
                    questionAnswerData={questionAnswerData}
                  />
                </div>
              );
            })}

            <div>{servicepointDetail.new_entrance_possible === "Y" && <ServicepointLandingSummaryNewButton />}</div>
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
  // let hasExistingFormData = false;
  let isMainEntrancePublished = false;
  let questionsData: QuestionData = {};
  let questionChoicesData: QuestionChoiceData = {};
  let questionBlocksData: QuestionBlockData = {};
  let questionAnswerData: EntranceAnswerData = {};

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
      const servicepointEntranceResp = await fetch(
        `${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${servicepointData.servicepoint_id}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const servicepointEntranceData = await (servicepointEntranceResp.json() as Promise<EntranceResults>);

      // Use the published entrance
      const entranceResultDetails = await Promise.all(
        servicepointEntranceData.results.map(async (entranceResult) => {
          const entranceDetailResp = await fetch(
            `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${entranceResult.entrance_id}&format=json`,
            {
              headers: new Headers({ Authorization: getTokenHash() }),
            }
          );
          const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
          const entrance = entranceDetail.find((e) => e.form_submitted === "Y");
          return { entranceResult, entrance };
        })
      );

      const mainEntranceDetails = entranceResultDetails.find((resultDetails) => resultDetails.entranceResult.is_main_entrance === "Y");

      const sideEntranceDetails = entranceResultDetails
        .filter((resultDetails) => resultDetails.entranceResult.is_main_entrance !== "Y")
        .reduce((acc, resultDetails, j) => {
          return {
            ...acc,
            ...(resultDetails.entrance && { [`side${j + 1}`]: resultDetails.entrance }),
          };
        }, {});

      entranceData = {
        ...(mainEntranceDetails?.entrance && { main: mainEntranceDetails?.entrance }),
        ...sideEntranceDetails,
      };

      // Check if the main entrance exists and is published
      // No need to check if form_submitted === "Y", since this was already done above
      isMainEntrancePublished = !!mainEntranceDetails?.entrance;

      const entranceResultSentences = await Promise.all(
        servicepointEntranceData.results.map(async (entranceResult) => {
          const sentenceResp = await fetch(
            `${API_URL_BASE}${API_FETCH_BACKEND_SENTENCES}?entrance_id=${entranceResult.entrance_id}&form_submitted=Y&format=json`,
            {
              headers: new Headers({ Authorization: getTokenHash() }),
            }
          );
          const sentenceData = await (sentenceResp.json() as Promise<BackendEntranceSentence[]>);
          return { entranceResult, sentenceData };
        })
      );

      const mainEntranceSentences = entranceResultSentences.find((resultSentence) => resultSentence.entranceResult.is_main_entrance === "Y");

      const sideEntranceSentences = entranceResultSentences
        .filter((resultSentence) => resultSentence.entranceResult.is_main_entrance !== "Y")
        .reduce((acc, resultSentence, j) => {
          return {
            ...acc,
            [`side${j + 1}`]: resultSentence.sentenceData,
          };
        }, {});

      accessibilityData = {
        main: mainEntranceSentences?.sentenceData || [],
        ...sideEntranceSentences,
      };

      /*
      if (servicepointEntranceData.results.length !== 0 && mainEntranceSentences?.entranceResult) {
        const logResp = await fetch(
          `${API_URL_BASE}${API_FETCH_ANSWER_LOGS}?entrance=${mainEntranceSentences?.entranceResult.entrance_id}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const logData = await (logResp.json() as Promise<AnswerLog[]>);

        // TODO: Should this be true even if the form has not been submitted
        hasExistingFormData = logData.length !== 0;
      }
      */

      // Get the questions and answers for all the entrances for use in the accessibility summaries
      const mainQuestionsResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_URL}0`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const sideQuestionsResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_URL}1`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const mainQuestionChoicesResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONCHOICES}0`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const sideQuestionChoicesResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONCHOICES}1`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const mainQuestionBlocksResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONBLOCK_URL}0`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const sideQuestionBlocksResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONBLOCK_URL}1`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });

      const mainQuestionsData = await (mainQuestionsResp.json() as Promise<BackendQuestion[]>);
      const sideQuestionsData = await (sideQuestionsResp.json() as Promise<BackendQuestion[]>);
      const mainQuestionChoicesData = await (mainQuestionChoicesResp.json() as Promise<BackendQuestionChoice[]>);
      const sideQuestionChoicesData = await (sideQuestionChoicesResp.json() as Promise<BackendQuestionChoice[]>);
      const mainQuestionBlocksData = await (mainQuestionBlocksResp.json() as Promise<BackendQuestionBlock[]>);
      const sideQuestionBlocksData = await (sideQuestionBlocksResp.json() as Promise<BackendQuestionBlock[]>);

      questionsData = Object.keys(accessibilityData).reduce((acc, entranceKey) => {
        return entranceKey === "main" ? { ...acc, main: mainQuestionsData } : { ...acc, [entranceKey]: sideQuestionsData };
      }, {});
      questionChoicesData = Object.keys(accessibilityData).reduce((acc, entranceKey) => {
        return entranceKey === "main" ? { ...acc, main: mainQuestionChoicesData } : { ...acc, [entranceKey]: sideQuestionChoicesData };
      }, {});
      questionBlocksData = Object.keys(accessibilityData).reduce((acc, entranceKey) => {
        return entranceKey === "main" ? { ...acc, main: mainQuestionBlocksData } : { ...acc, [entranceKey]: sideQuestionBlocksData };
      }, {});

      const entranceQuestionAnswerData = await Promise.all(
        Object.keys(entranceData).map(async (entranceKey) => {
          const entrance = entranceData[entranceKey];

          const allQuestionAnswersResp = await fetch(
            `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_ANSWERS}?entrance_id=${entrance.entrance_id}&format=json`,
            {
              headers: new Headers({ Authorization: getTokenHash() }),
            }
          );
          const allQuestionAnswerData = await (allQuestionAnswersResp.json() as Promise<BackendEntranceAnswer[]>);

          return { entranceKey, allQuestionAnswerData };
        })
      );

      questionAnswerData = entranceQuestionAnswerData.reduce((acc, answerData) => {
        const entrance = entranceData[answerData.entranceKey];
        return { ...acc, [answerData.entranceKey]: answerData.allQuestionAnswerData.filter((a) => a.log_id === entrance.log_id) };
      }, {});
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as Servicepoint;
      servicepointDetail = {} as BackendServicepoint;
      accessibilityData = {};
      entranceData = {};
      questionsData = {};
      questionChoicesData = {};
      questionBlocksData = {};
      questionAnswerData = {};
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      servicepointDetail,
      accessibilityData,
      entranceData,
      // hasExistingFormData,
      isMainEntrancePublished,
      questionsData,
      questionChoicesData,
      questionBlocksData,
      questionAnswerData,
    },
  };
};

export default Details;
