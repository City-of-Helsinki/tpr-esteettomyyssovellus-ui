import React, { ReactElement, useEffect } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { StatusLabel } from "hds-react";
import Layout from "../../components/common/Layout";
import LoadSpinner from "../../components/common/LoadSpinner";
import PageHelp from "../../components/common/PageHelp";
import SummaryAccessibility from "../../components/SummaryAccessibility";
import SummaryAccessibilityPlaceGroup from "../../components/SummaryAccessibilityPlaceGroup";
import SummaryContact from "../../components/SummaryContact";
import SummaryLocationPicture from "../../components/SummaryLocationPicture";
import SummaryNewButton from "../../components/SummaryNewButton";
import SummaryModifyButton from "../../components/SummaryModifyButton";
import SummaryRemoveButton from "../../components/SummaryRemoveButton";
import { useAppDispatch, useAppSelector, useLoading } from "../../state/hooks";
import { setServicepointId } from "../../state/reducers/formSlice";
import { setServicepointLocationEuref, setServicepointLocationWGS84 } from "../../state/reducers/generalSlice";
import { persistor } from "../../state/store";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_CHOICES,
  API_FETCH_BACKEND_ENTRANCE_PLACES,
  API_FETCH_BACKEND_ENTRANCE_SENTENCE_GROUPS,
  API_FETCH_BACKEND_FORM_GUIDE,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_SENTENCES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_URL_BASE,
  LanguageLocales,
} from "../../types/constants";
import {
  BackendEntrance,
  BackendEntranceChoice,
  BackendEntrancePlace,
  BackendEntranceSentence,
  BackendEntranceSentenceGroup,
  BackendFormGuide,
  BackendPlace,
  BackendServicepoint,
  EntranceResults,
} from "../../types/backendModels";
import { AccessibilityData, DetailsProps, EntranceChoiceData, EntranceData, EntrancePlaceData } from "../../types/general";
import i18nLoader from "../../utils/i18n";
import { validateServicepointHash } from "../../utils/serverside";
import { convertCoordinates, filterByLanguage, formatAddress, getFinnishDate, getTokenHash } from "../../utils/utilFunctions";
import styles from "./details.module.scss";

// usage: the details / landing page of servicepoint
const Details = ({
  servicepointData,
  entranceSentenceGroupData,
  accessibilityData,
  accessibilityPlaceData,
  entranceData,
  entrancePlaceData,
  entranceChoiceData,
  formGuideData,
  formId,
  mainEntranceId,
  draftMainEntranceId,
  isMainEntrancePublished,
  isChecksumValid,
}: DetailsProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const finnishDate = servicepointData.modified ? getFinnishDate(servicepointData.modified) : "";

  const user = useAppSelector((state) => state.generalSlice.user);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);
  const isUserValid = !!user && user.length > 0;

  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);

  // The details page is only allowed for servicepoints (form id 0) not meeting rooms (form id 2)
  // const hasData = Object.keys(servicepointData).length > 0 && Object.keys(entranceData).length > 0;
  const hasData = Object.keys(servicepointData).length > 0 && formId === 0;
  const hasMainAccessibilityData = accessibilityData && accessibilityData[mainEntranceId] && accessibilityData[mainEntranceId].length > 0;

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

  const curLocaleId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];
  const filteredPlaces = accessibilityPlaceData.filter((place) => place.language_id === curLocaleId);

  const subHeader = `${i18n.t("common.mainEntrance")}: ${formatAddress(
    servicepointData.address_street_name,
    servicepointData.address_no,
    servicepointData.address_city
  )}`;

  const treeItems = { [servicepointData.servicepoint_name ?? ""]: `/details/${servicepointData.servicepoint_id}?checksum=${checksum}` };

  // Special case where the saved draft main entrance has a different id
  const mainEntranceIdToModify = draftMainEntranceId > 0 && mainEntranceId !== draftMainEntranceId ? draftMainEntranceId : mainEntranceId;

  return (
    <Layout>
      <Head>
        <title>{i18n.t("common.header.title")}</title>
      </Head>
      {!isChecksumValid && <h1>{i18n.t("common.invalidParams")}</h1>}

      {isChecksumValid && !isUserValid && <h1>{i18n.t("common.notAuthorized")}</h1>}

      {isChecksumValid && isUserValid && isLoading && <LoadSpinner />}

      {isChecksumValid && isUserValid && !isLoading && !hasData && <h1>{i18n.t("common.noData")}</h1>}

      {isChecksumValid && isUserValid && !isLoading && hasData && (
        <main id="content">
          <div className={styles.maincontainer}>
            <div className={styles.infocontainer}>
              <PageHelp formGuideData={formGuideData} treeItems={treeItems} />
            </div>

            <div className={styles.headingcontainer}>
              <h1>{servicepointData.servicepoint_name}</h1>
              <h2 className={styles.subHeader}>{subHeader}</h2>

              <span className={styles.statuslabel}>
                {isMainEntrancePublished && hasMainAccessibilityData ? (
                  <StatusLabel type="success"> {i18n.t("common.statusReady")} </StatusLabel>
                ) : (
                  <StatusLabel type="neutral"> {i18n.t("common.statusNotReady")} </StatusLabel>
                )}

                <p>
                  {i18n.t("common.updated")} {finnishDate}
                </p>
              </span>
            </div>

            <SummaryContact
              entranceData={entranceData[mainEntranceId]}
              entranceIdToModify={mainEntranceIdToModify}
              hasData={hasMainAccessibilityData}
              hasModifyButton
            />

            <div>
              {entranceSentenceGroupData
                .sort((a: BackendEntranceSentenceGroup, b: BackendEntranceSentenceGroup) => {
                  return (a.order_text ?? "").localeCompare(b.order_text ?? "");
                })
                .map((entranceSentenceGroup) => {
                  const { entrance_id, sentence_group_id, display_entrance_with_map } = entranceSentenceGroup;
                  const entranceKey = String(entrance_id);
                  const sentenceGroupKey = String(sentence_group_id);
                  const subHeading = (entranceSentenceGroup[`subheading_${curLocale}`] || "") as string;
                  const hasAccessibilityData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;
                  const entranceIdToModify = entrance_id === mainEntranceId ? mainEntranceIdToModify : entrance_id;

                  return (
                    <div key={`entrance_sentence_group_${entrance_id}_${sentence_group_id}`}>
                      {sentence_group_id === 0 ? (
                        <>
                          <div className={styles.headercontainer}>
                            <h3>{subHeading}</h3>
                            <div className={styles.modifybutton}>
                              {entrance_id !== mainEntranceId && hasAccessibilityData && (
                                <SummaryRemoveButton entranceData={entranceData[entranceKey]} />
                              )}
                              <SummaryModifyButton
                                entranceData={entranceData[entranceKey]}
                                entranceIdToModify={entranceIdToModify}
                                hasData={hasAccessibilityData}
                              />
                            </div>
                          </div>

                          <SummaryLocationPicture
                            entranceKey={entranceKey}
                            entranceData={entranceData[entranceKey]}
                            servicepointData={servicepointData}
                            isMainEntrance={entrance_id === mainEntranceId}
                            isMapDisplayed={display_entrance_with_map === "Y"}
                          />
                        </>
                      ) : (
                        <>
                          {subHeading.length > 0 && (
                            <div className={styles.headercontainer}>
                              <h3>{subHeading}</h3>
                            </div>
                          )}

                          <SummaryAccessibility
                            entranceKey={entranceKey}
                            sentenceGroupId={sentenceGroupKey}
                            accessibilityData={filteredAccessibilityData}
                            entranceChoiceData={entranceChoiceData}
                          />

                          <SummaryAccessibilityPlaceGroup
                            entranceKey={entranceKey}
                            sentenceGroupKey={sentenceGroupKey}
                            accessibilityPlaces={filteredPlaces}
                            entrancePlaceData={entrancePlaceData}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className={styles.footercontainer}>{servicepointData.new_entrance_possible === "Y" && <SummaryNewButton />}</div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async ({ params, query, locales }) => {
  const lngDict = await i18nLoader(locales);

  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let entranceSentenceGroupData: BackendEntranceSentenceGroup[] = [];
  let accessibilityData: AccessibilityData = {};
  let accessibilityPlaceData: BackendPlace[] = [];
  let entranceData: EntranceData = {};
  let entrancePlaceData: EntrancePlaceData = {};
  let entranceChoiceData: EntranceChoiceData = {};
  let formGuideData: BackendFormGuide[] = [];
  let formId = -1;
  let mainEntranceId = -1;
  let draftMainEntranceId = -1;
  let isMainEntrancePublished = false;

  const isChecksumValid = params !== undefined && query !== undefined && validateServicepointHash(Number(params.servicepointId), query.checksum);

  if (isChecksumValid && params !== undefined) {
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
        formId = servicepointData.form_id ?? -1;
      }
    } catch (err) {
      console.error("Error", err);
    }
  }

  // The details page is only allowed for servicepoints (form id 0) not meeting rooms (form id 2)
  if (isChecksumValid && params !== undefined && servicepointData && formId === 0) {
    try {
      // Get all the existing entrances for the service point
      const servicepointEntranceResp = await fetch(
        `${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${servicepointData.servicepoint_id}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const servicepointEntranceData = await (servicepointEntranceResp.json() as Promise<EntranceResults>);

      // Get all the entrance and sentence group combinations for the service point
      const entranceSentenceGroupResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_SENTENCE_GROUPS}?servicepoint_id=${servicepointData.servicepoint_id}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      entranceSentenceGroupData = await (entranceSentenceGroupResp.json() as Promise<BackendEntranceSentenceGroup[]>);

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
          const entranceD = entranceDetail.find((e) => e.form_submitted === "D");
          return { entranceResult, entrance: entranceY ?? entranceNull, draftEntrance: entranceD };
        })
      );

      // const mainEntranceDetails = entranceResultDetails.find((resultDetails) => resultDetails.entranceResult.is_main_entrance === "Y");
      const mainEntranceDetailsPublished = entranceResultDetails.find(
        (resultDetails) => resultDetails.entranceResult.is_main_entrance === "Y" && resultDetails.entrance
      );
      const mainEntranceDetailsDraft = entranceResultDetails.find(
        (resultDetails) => resultDetails.entranceResult.is_main_entrance === "Y" && resultDetails.draftEntrance
      );

      entranceData = entranceResultDetails.reduce((acc, resultDetails) => {
        return {
          ...acc,
          ...(resultDetails.entrance && { [resultDetails.entrance.entrance_id]: resultDetails.entrance }),
        };
      }, {});

      // Check if the main entrance exists and is published
      // isMainEntrancePublished = !!mainEntranceDetails?.entrance && mainEntranceDetails?.entrance.form_submitted === "Y";
      isMainEntrancePublished = !!mainEntranceDetailsPublished;

      // In some special cases there is a draft main entrance with a different id to the published one, so return both ids
      // It's also possible for a new main entrance to be saved as draft but not published yet
      // mainEntranceId = mainEntranceDetails?.entrance?.entrance_id ?? -1;
      mainEntranceId = mainEntranceDetailsPublished?.entrance?.entrance_id ?? -1;
      draftMainEntranceId = mainEntranceDetailsDraft?.draftEntrance?.entrance_id ?? -1;

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
      accessibilityData = entranceResultSentences.reduce((acc, resultSentence) => {
        return {
          ...acc,
          [resultSentence.entranceResult.entrance_id]: resultSentence.sentenceData,
        };
      }, {});

      // Get the accessibility place data for use in the accessibility summaries for entrance place names
      const accessibilityPlaceResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_PLACES}?format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      accessibilityPlaceData = await (accessibilityPlaceResp.json() as Promise<BackendPlace[]>);

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
      entranceChoiceData = entranceQuestionAnswerData.reduce((acc, answerData) => {
        const entrance = entranceData[answerData.entranceKey];
        return { ...acc, [answerData.entranceKey]: answerData.allEntranceChoiceData.filter((a) => a.log_id === entrance.log_id) };
      }, {});

      // Get the guide text using the main entrance form id 0 for the details page
      const formGuideResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_FORM_GUIDE}?form_id=0`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      formGuideData = await (formGuideResp.json() as Promise<BackendFormGuide[]>);
    } catch (err) {
      console.error("Error", err);
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      entranceSentenceGroupData,
      accessibilityData,
      accessibilityPlaceData,
      entranceData,
      entrancePlaceData,
      entranceChoiceData,
      formGuideData,
      formId,
      mainEntranceId,
      draftMainEntranceId,
      isMainEntrancePublished,
      isChecksumValid,
    },
  };
};

export default Details;
