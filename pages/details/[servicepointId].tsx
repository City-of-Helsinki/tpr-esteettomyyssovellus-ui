import React, { ReactElement } from "react";
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
import {
  setServicepointId,
  // setEntranceId,
  setPhoneNumber,
  setEmail,
  clearFormState,
  setFormFinished,
  setContinue,
  setFormSubmitted,
} from "../../state/reducers/formSlice";
import { getFinnishDate, filterByLanguage, convertCoordinates } from "../../utils/utilFunctions";
import { clearGeneralState, setServicepointLocation, setServicepointLocationWGS84 } from "../../state/reducers/generalSlice";
import {
  API_FETCH_ANSWER_LOGS,
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_SENTENCE_LANGS,
  API_FETCH_SERVICEPOINTS,
} from "../../types/constants";
import LoadSpinner from "../../components/common/LoadSpinner";
import { clearAddinfoState } from "../../state/reducers/additionalInfoSlice";
import { AnswerLog, BackendEntrance, BackendServicepoint, EntranceResults, Servicepoint, StoredSentence } from "../../types/backendModels";
import { AccessibilityData, DetailsProps, EntranceData } from "../../types/general";

// usage: the details / landing page of servicepoint
const Details = ({
  servicepointData,
  servicepointDetail,
  accessibilityData,
  entranceData,
  hasExistingFormData,
  isFinished,
}: DetailsProps): ReactElement => {
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

  const hasData = Object.keys(servicepointData).length > 0 && Object.keys(entranceData).length > 0;

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
  // Make sure that the main entrance is listed before the side entrances.
  const filteredAccessibilityData: AccessibilityData = Object.keys(accessibilityData).reduce((acc, key) => {
    return {
      ...acc,
      [key]: filterByLanguage(accessibilityData[key], i18n.locale()),
    };
  }, {});
  const entranceKeys = Object.keys(filteredAccessibilityData);

  // Update entranceId and servicepointId to redux state
  if (servicepointData) {
    dispatch(setServicepointId(servicepointData.servicepoint_id));
  }
  if (hasData && accessibilityData.main.length !== 0) {
    // TODO: Logic for when editing additional entrance vs main entrance
    // dispatch(setEntranceId(accessibilityData.main[0].entrance_id));
    if (accessibilityData.main[0].form_submitted === "Y") {
      dispatch(setFormFinished());
      dispatch(setContinue());
      dispatch(setFormSubmitted());
    }
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
              <div className={styles.entranceHeader}>
                <h2>{`${i18n.t("servicepoint.contactFormSummaryHeader")} (${entranceKeys.length})`}</h2>
                {servicepointDetail.new_entrance_possible === "Y" && <ServicepointLandingSummaryNewButton servicepointData={servicepointData} />}
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
                          servicepointData={servicepointData}
                          entranceData={entranceData[key]}
                          hasData={hasAccessibilityData}
                        />
                      )}

                      <ServicepointLandingSummaryAccessibility
                        entranceKey={key}
                        entranceData={entranceData[key]}
                        servicepointData={servicepointData}
                        accessibilityData={filteredAccessibilityData}
                        hasData={hasAccessibilityData}
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
  let hasExistingFormData = false;
  let isFinished = false;

  if (params !== undefined) {
    try {
      const servicepointResp = await fetch(`${API_FETCH_SERVICEPOINTS}${params.servicepointId}/?format=json`);
      servicepointData = await (servicepointResp.json() as Promise<Servicepoint>);

      const servicepointBackendDetailResp = await fetch(`${API_FETCH_BACKEND_SERVICEPOINT}?servicepoint_id=${params.servicepointId}&format=json`);
      const servicepointBackendDetail = await (servicepointBackendDetailResp.json() as Promise<BackendServicepoint[]>);

      if (servicepointBackendDetail?.length > 0) {
        servicepointDetail = servicepointBackendDetail[0];
      }

      const servicepointEntranceResp = await fetch(`${API_FETCH_ENTRANCES}?servicepoint=${servicepointData.servicepoint_id}&format=json`);
      const servicepointEntranceData = await (servicepointEntranceResp.json() as Promise<EntranceResults>);

      const entranceResultDetails = await Promise.all(
        servicepointEntranceData.results.map(async (entranceResult) => {
          const entranceDetailResp = await fetch(`${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${entranceResult.entrance_id}&format=json`);
          const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
          return { entranceResult, entranceDetail };
        })
      );

      const mainEntranceDetails = entranceResultDetails.find((resultDetails) => resultDetails.entranceResult.is_main_entrance === "Y");

      const sideEntranceDetails = entranceResultDetails
        .filter((resultDetails) => resultDetails.entranceResult.is_main_entrance !== "Y")
        .reduce((acc, resultDetails, j) => {
          return {
            ...acc,
            ...(resultDetails.entranceDetail && resultDetails.entranceDetail.length > 0 && { [`side${j + 1}`]: resultDetails.entranceDetail[0] }),
          };
        }, {});

      entranceData = {
        ...(mainEntranceDetails?.entranceDetail &&
          mainEntranceDetails?.entranceDetail.length > 0 && { main: mainEntranceDetails?.entranceDetail[0] }),
        ...sideEntranceDetails,
      };

      const entranceResultSentences = await Promise.all(
        servicepointEntranceData.results.map(async (entranceResult) => {
          const sentenceResp = await fetch(`${API_FETCH_SENTENCE_LANGS}?entrance_id=${entranceResult.entrance_id}&format=json`);
          const sentenceData = await (sentenceResp.json() as Promise<StoredSentence[]>);
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

      if (servicepointEntranceData.results.length !== 0 && mainEntranceSentences?.entranceResult) {
        const logResp = await fetch(`${API_FETCH_ANSWER_LOGS}?entrance=${mainEntranceSentences?.entranceResult.entrance_id}&format=json`);
        const logData = await (logResp.json() as Promise<AnswerLog[]>);

        // TODO: Should this be true even if the form has not been submitted
        hasExistingFormData = logData.length !== 0;
        isFinished = logData.some((e) => e.form_submitted === "Y");
      }
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
      hasExistingFormData,
      isFinished,
    },
  };
};

export default Details;
