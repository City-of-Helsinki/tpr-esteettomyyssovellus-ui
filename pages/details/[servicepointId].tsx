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
import { setServicepointLocationEuref, setServicepointLocationWGS84 } from "../../state/reducers/generalSlice";
import {
  // API_FETCH_ANSWER_LOGS,
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_CHOICES,
  API_FETCH_BACKEND_ENTRANCE_PLACES,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_SENTENCES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_URL_BASE,
  LanguageLocales,
} from "../../types/constants";
import LoadSpinner from "../../components/common/LoadSpinner";
import { persistor } from "../../state/store";
import {
  BackendEntrance,
  BackendEntranceChoice,
  BackendEntrancePlace,
  BackendEntranceSentence,
  BackendPlace,
  BackendServicepoint,
  EntranceResults,
} from "../../types/backendModels";
import { AccessibilityData, DetailsProps, EntranceChoiceData, EntranceData, EntrancePlaceData } from "../../types/general";

// usage: the details / landing page of servicepoint
const Details = ({
  servicepointData,
  accessibilityData,
  accessibilityPlaceData,
  entranceData,
  entrancePlaceData,
  questionAnswerData,
  // hasExistingFormData,
  isMainEntrancePublished,
}: DetailsProps): ReactElement => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const treeItems = [servicepointData.servicepoint_name ?? ""];
  const finnishDate = servicepointData.modified ? getFinnishDate(servicepointData.modified) : "";

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

  const initReduxData = () => {
    // Update the servicepoint coordinates in redux state, for use as the default location on maps
    const { loc_easting, loc_northing } = servicepointData;
    const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
    const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];
    dispatch(setServicepointLocationEuref({ coordinatesEuref }));
    dispatch(setServicepointLocationWGS84({ coordinatesWGS84 }));

    // Update servicepointId in redux state
    dispatch(setServicepointId(servicepointData.servicepoint_id));

    /*
    if (hasData && accessibilityData.main.length !== 0 && accessibilityData.main[0].form_submitted === "Y") {
      dispatch(setFormFinished());
      dispatch(setContinue());
      dispatch(setFormSubmitted());
    }
    */
  };

  // Initialise the redux data on first render only, using a workaround utilising useEffect with empty dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useMountEffect = (fun: () => void) => useEffect(fun, []);
  useMountEffect(initReduxData);

  // Filter by language
  // Make sure that the main entrance is listed before the side entrances.
  const filteredAccessibilityData: AccessibilityData = Object.keys(accessibilityData).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filterByLanguage(accessibilityData[key], i18n.locale()),
    };
  }, {});
  const entranceKeys = Object.keys(filteredAccessibilityData);

  const curLocaleId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];
  const filteredPlaces = accessibilityPlaceData.filter((place) => place.language_id === curLocaleId);

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

                {servicepointData.new_entrance_possible === "Y" && <ServicepointLandingSummaryNewButton />}
              </div>
              */}

              <h2>{i18n.t("common.mainEntrance")}</h2>
            </div>

            <ServicepointLandingSummaryContact entranceData={entranceData.main} hasData={hasMainAccessibilityData} hasModifyButton />

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
                    entrancePlaceData={entrancePlaceData}
                    servicepointData={servicepointData}
                    accessibilityData={filteredAccessibilityData}
                    accessibilityPlaces={filteredPlaces}
                    questionAnswerData={questionAnswerData}
                  />
                </div>
              );
            })}

            <div>{servicepointData.new_entrance_possible === "Y" && <ServicepointLandingSummaryNewButton />}</div>
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
  let accessibilityPlaceData: BackendPlace[] = [];
  let entranceData: EntranceData = {};
  let entrancePlaceData: EntrancePlaceData = {};
  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let questionAnswerData: EntranceChoiceData = {};
  let isMainEntrancePublished = false;

  if (params !== undefined) {
    try {
      const servicepointBackendDetailResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_SERVICEPOINT}?servicepoint_id=${params.servicepointId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const servicepointBackendDetail = await (servicepointBackendDetailResp.json() as Promise<BackendServicepoint[]>);

      if (servicepointBackendDetail?.length > 0) {
        servicepointData = servicepointBackendDetail[0];
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

          // In some cases there is no published entrance, so form_submitted is null
          const entranceY = entranceDetail.find((e) => e.form_submitted === "Y");
          const entranceNull = entranceDetail.find((e) => e.form_submitted === null);
          return { entranceResult, entrance: entranceY ?? entranceNull };
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
      isMainEntrancePublished = !!mainEntranceDetails?.entrance && mainEntranceDetails?.entrance.form_submitted === "Y";

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

      // Get the accessibility place data for use in the accessibility summaries for entrance place names
      const accessibilityPlaceResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_PLACES}?format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      accessibilityPlaceData = await (accessibilityPlaceResp.json() as Promise<BackendPlace[]>);

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

      // Get the entrance place data for all the entrances for use in the accessibility summaries for pictures and maps
      const entranceAccessibilityPlaceData = await Promise.all(
        Object.keys(entranceData).map(async (entranceKey) => {
          const entrance = entranceData[entranceKey];

          const allEntrancePlaceDataResp = await fetch(
            `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_PLACES}?entrance_id=${entrance.entrance_id}&format=json`,
            {
              headers: new Headers({ Authorization: getTokenHash() }),
            }
          );
          const allEntrancePlaceData = await (allEntrancePlaceDataResp.json() as Promise<BackendEntrancePlace[]>);

          return { entranceKey, allEntrancePlaceData };
        })
      );

      entrancePlaceData = entranceAccessibilityPlaceData.reduce((acc, placeData) => {
        const entrance = entranceData[placeData.entranceKey];
        return { ...acc, [placeData.entranceKey]: placeData.allEntrancePlaceData.filter((a) => a.log_id === entrance.log_id) };
      }, {});

      // Get the questions and answers for all the entrances for use in the accessibility summaries
      const entranceQuestionAnswerData = await Promise.all(
        Object.keys(entranceData).map(async (entranceKey) => {
          const entrance = entranceData[entranceKey];

          const allEntranceChoicesResp = await fetch(
            `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_CHOICES}?entrance_id=${entrance.entrance_id}&format=json`,
            {
              headers: new Headers({ Authorization: getTokenHash() }),
            }
          );
          const allEntranceChoiceData = await (allEntranceChoicesResp.json() as Promise<BackendEntranceChoice[]>);

          return { entranceKey, allEntranceChoiceData };
        })
      );

      questionAnswerData = entranceQuestionAnswerData.reduce((acc, answerData) => {
        const entrance = entranceData[answerData.entranceKey];
        return { ...acc, [answerData.entranceKey]: answerData.allEntranceChoiceData.filter((a) => a.log_id === entrance.log_id) };
      }, {});
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as BackendServicepoint;
      accessibilityData = {};
      accessibilityPlaceData = [];
      entranceData = {};
      entrancePlaceData = {};
      questionAnswerData = {};
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      accessibilityData,
      accessibilityPlaceData,
      entranceData,
      entrancePlaceData,
      questionAnswerData,
      // hasExistingFormData,
      isMainEntrancePublished,
    },
  };
};

export default Details;
