import React, { ReactElement, useEffect } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { StatusLabel, IconCrossCircle, IconQuestionCircle, Tabs, TabList, Tab, TabPanel } from "hds-react";
import Layout from "../../components/common/Layout";
import i18nLoader from "../../utils/i18n";
import ServicepointLandingSummaryAccessibility from "../../components/ServicepointLandingSummaryAccessibility";
import ServicepointLandingSummaryContact from "../../components/ServicepointLandingSummaryContact";
import ServicepointLandingSummaryNewButton from "../../components/ServicepointLandingSummaryNewButton";
import styles from "./details.module.scss";
// import ServicepointLandingSummaryCtrlButtons from "../../components/ServicepointLandingSummaryCtrlButtons";
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
  API_FETCH_BACKEND_SENTENCES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_SERVICEPOINTS,
  API_URL_BASE,
} from "../../types/constants";
import LoadSpinner from "../../components/common/LoadSpinner";
import { persistor } from "../../state/store";
import { BackendEntrance, BackendEntranceSentence, BackendServicepoint, EntranceResults, Servicepoint } from "../../types/backendModels";
import { AccessibilityData, DetailsProps, EntranceData } from "../../types/general";

// usage: the details / landing page of servicepoint
const Details = ({
  servicepointData,
  servicepointDetail,
  accessibilityData,
  entranceData,
  // hasExistingFormData,
  isMainEntrancePublished,
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

              <div className={styles.entranceHeader}>
                <h2>{`${i18n.t("servicepoint.contactFormSummaryHeader")} (${entranceKeys.length} ${
                  entranceKeys.length === 1 ? i18n.t("servicepoint.numberOfEntrances1") : i18n.t("servicepoint.numberOfEntrances2+")
                })`}</h2>

                {servicepointDetail.new_entrance_possible === "Y" && <ServicepointLandingSummaryNewButton />}
              </div>
            </div>

            <div>
              <Tabs>
                <TabList>
                  {entranceKeys.map((key, index) => {
                    return (
                      <Tab key={`tabheader_${key}`}>
                        {key === "main" ? i18n.t("common.mainEntrance") : `${i18n.t("common.additionalEntrance")} ${index > 1 ? index : ""}`}
                      </Tab>
                    );
                  })}
                </TabList>
                {entranceKeys.map((key) => {
                  const hasAccessibilityData = accessibilityData && accessibilityData[key] && accessibilityData[key].length > 0;

                  return (
                    <TabPanel key={`tabpanel_${key}`}>
                      {key === "main" && (
                        <ServicepointLandingSummaryContact
                          servicepointData={servicepointDetail}
                          entranceData={entranceData[key]}
                          hasData={hasAccessibilityData}
                          hasModifyButton
                        />
                      )}

                      <ServicepointLandingSummaryAccessibility
                        entranceKey={key}
                        entranceData={entranceData[key]}
                        servicepointData={servicepointData}
                        accessibilityData={filteredAccessibilityData}
                        hasData={hasAccessibilityData}
                        hasModifyButton
                      />
                    </TabPanel>
                  );
                })}
              </Tabs>
            </div>

            {/*
            <ServicepointLandingSummaryCtrlButtons hasData={hasExistingFormData} />
            */}
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
    } catch (err) {
      console.error("Error", err);

      servicepointData = {} as Servicepoint;
      servicepointDetail = {} as BackendServicepoint;
      accessibilityData = {};
      entranceData = {};
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
    },
  };
};

export default Details;
