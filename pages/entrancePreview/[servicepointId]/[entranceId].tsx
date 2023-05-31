import React, { ReactElement, useEffect, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { Notification } from "hds-react";
import AddNewEntranceNotice from "../../../components/common/AddNewEntranceNotice";
import Layout from "../../../components/common/Layout";
import LoadSpinner from "../../../components/common/LoadSpinner";
import PageHelp from "../../../components/common/PageHelp";
import SummaryContact from "../../../components/SummaryContact";
import PreviewControlButtons from "../../../components/PreviewControlButtons";
import SummaryAccessibility from "../../../components/SummaryAccessibility";
import SummaryAccessibilityPlaceGroup from "../../../components/SummaryAccessibilityPlaceGroup";
import SummaryLocationPicture from "../../../components/SummaryLocationPicture";
import { useAppDispatch, useAppSelector, useLoading } from "../../../state/hooks";
import { setEntranceLocationPhoto, setEntrancePlaceBoxes, setQuestionBlockComments } from "../../../state/reducers/additionalInfoSlice";
import { setServicepointId, setEntranceId, setStartDate, setAnswers, setExtraAnswers } from "../../../state/reducers/formSlice";
import { persistor } from "../../../state/store";
import {
  API_DISPLAY_ENTRANCE_WITH_MAP,
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_ANSWERS,
  API_FETCH_BACKEND_ENTRANCE_CHOICES,
  API_FETCH_BACKEND_ENTRANCE_FIELD,
  API_FETCH_BACKEND_ENTRANCE_PLACES,
  // API_FETCH_BACKEND_ENTRANCE_SENTENCE_GROUPS,
  API_FETCH_BACKEND_FORM_GUIDE,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_SENTENCES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_QUESTION_BLOCK_COMMENT,
  API_URL_BASE,
  LanguageLocales,
} from "../../../types/constants";
import {
  // AnswerLog,
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceChoice,
  BackendEntranceField,
  BackendEntrancePlace,
  BackendEntranceSentence,
  // BackendEntranceSentenceGroup,
  BackendFormGuide,
  BackendPlace,
  BackendServicepoint,
  EntranceResults,
  QuestionBlockAnswerCmt,
} from "../../../types/backendModels";
import {
  AccessibilityData,
  BlockComment,
  EntranceChoiceData,
  EntranceData,
  EntrancePlaceData,
  KeyValueNumber,
  KeyValueString,
  PreviewProps,
  QuestionBlockComment,
} from "../../../types/general";
import i18nLoader from "../../../utils/i18n";
import { validateServicepointHash } from "../../../utils/serverside";
import { filterByLanguage, formatAddress, getCurrentDate, getTokenHash, isLocationValid } from "../../../utils/utilFunctions";
import styles from "./preview.module.scss";

// usage: the preview page of an entrance, displayed before saving the completed form
const Preview = ({
  servicepointData,
  // entranceSentenceGroupData,
  accessibilityData,
  accessibilityPlaceData,
  entranceData,
  entrancePlaceData,
  questionBlockCommentData,
  entranceChoiceData,
  questionAnswerData,
  questionExtraAnswerData,
  formGuideData,
  displayEntranceWithMap,
  formId,
  mainEntranceId,
  isMainEntrancePublished,
  isChecksumValid,
}: PreviewProps): ReactElement => {
  const i18n = useI18n();
  const curLocale = i18n.locale();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();

  const [isSendingComplete, setSendingComplete] = useState(false);

  const user = useAppSelector((state) => state.generalSlice.user);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);
  const isUserValid = !!user && user.length > 0;

  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);

  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);

  const entranceKey = accessibilityData && Object.keys(accessibilityData).length > 0 ? Object.keys(accessibilityData)[0] : "";
  const entranceId = entranceData && entranceData[entranceKey] ? entranceData[entranceKey].entrance_id : -1;
  const entranceName = entranceData && entranceData[entranceKey] ? entranceData[entranceKey][`name_${curLocale}`] : "";
  const subHeader =
    entranceKey === String(mainEntranceId)
      ? `${i18n.t("common.mainEntrance")}: ${formatAddress(
          servicepointData.address_street_name,
          servicepointData.address_no,
          servicepointData.address_city
        )}`
      : `${i18n.t("common.entrance")}: ${entranceName ?? ""}`;

  // The preview page is only allowed for servicepoint entrances (form id 0 or 1) not meeting rooms (form id 2)
  const hasData = Object.keys(servicepointData).length > 0 && (formId === 0 || formId === 1);
  const hasAccessibilityData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;

  const initReduxData = () => {
    // Update servicepointId and entranceId in redux state
    if (Object.keys(servicepointData).length > 0) {
      dispatch(setServicepointId(servicepointData.servicepoint_id));
    }
    if (Object.keys(entranceData).length > 0) {
      dispatch(setEntranceId(hasAccessibilityData ? entranceData[entranceKey].entrance_id : -1));
    }

    // Put existing answers into redux state
    dispatch(
      setAnswers(
        questionAnswerData.reduce((acc: KeyValueNumber, a: BackendEntranceAnswer) => {
          const questionId = a.question_id;
          const answer = a.question_choice_id;
          if (questionId !== undefined && answer !== undefined) {
            return { ...acc, [questionId]: answer };
          } else {
            return acc;
          }
        }, {})
      )
    );

    // Put the existing entrance location and photo into redux state
    // Get the answer with the location and/or photo data (not comment data, which also has empty question_id)
    const entranceLocationPhotoAnswer = questionAnswerData.find((a) => {
      const { loc_easting, loc_northing, photo_url } = a || {};
      const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
      return (a.question_id === undefined || a.question_id === null) && (photo_url || isLocationValid(coordinatesEuref));
    });
    if (entranceLocationPhotoAnswer) {
      // Use the existing location and/or photo
      dispatch(
        setEntranceLocationPhoto({
          entrance_id: entranceData[entranceKey].entrance_id,
          question_block_id: entranceLocationPhotoAnswer.question_block_id,
          existingAnswer: entranceLocationPhotoAnswer,
          modifiedAnswer: entranceLocationPhotoAnswer,
          termsAccepted: true,
          invalidValues: [],
          canAddLocation: false,
          canAddPhoto: false,
        })
      );
    }

    // Put existing extra field answers into redux state
    dispatch(
      setExtraAnswers(
        questionExtraAnswerData.reduce((acc: KeyValueString, ea: BackendEntranceField) => {
          const questionBlockFieldId = ea.question_block_field_id;
          const answer = ea.entry;
          if (questionBlockFieldId !== undefined && answer !== undefined) {
            return { ...acc, [questionBlockFieldId]: answer };
          } else {
            return acc;
          }
        }, {})
      )
    );

    // Put entrance places into redux state
    dispatch(
      setEntrancePlaceBoxes(
        entrancePlaceData[entranceKey]
          ? entrancePlaceData[entranceKey].map((place) => {
              const { entrance_id, question_block_id, place_id, order_number } = place;

              // Try to make sure the order number is 1 or higher
              return {
                entrance_id: entrance_id,
                question_block_id: question_block_id,
                place_id: place_id,
                order_number: order_number && order_number > 0 ? order_number : 1,
                existingBox: place,
                modifiedBox: place,
                isDeleted: false,
                termsAccepted: true,
                invalidValues: [],
              };
            })
          : []
      )
    );

    // Put question block comments into redux state
    const questionBlockComments: QuestionBlockComment[] = [];

    questionBlockCommentData.forEach((answerComment) => {
      const { question_block_id, language_id, comment } = answerComment;
      const language = LanguageLocales[language_id];

      const blockComment: BlockComment = {
        question_block_id: question_block_id,
        [`comment_text_${language}`]: comment,
      };

      const questionBlockComment = questionBlockComments.find(
        (c) => c.entrance_id === entranceData[entranceKey].entrance_id && c.question_block_id === question_block_id
      );

      if (questionBlockComment) {
        // Add the comment for the different language
        questionBlockComment.existingComment = {
          ...questionBlockComment.existingComment,
          ...blockComment,
        };
        questionBlockComment.modifiedComment = {
          ...questionBlockComment.modifiedComment,
          ...blockComment,
        };
      } else {
        // Add a new question block comment
        const newQuestionBlockComment: QuestionBlockComment = {
          entrance_id: entranceData[entranceKey].entrance_id,
          question_block_id: question_block_id,
          existingComment: blockComment,
          modifiedComment: blockComment,
          invalidValues: [],
        };
        questionBlockComments.push(newQuestionBlockComment);
      }
    });

    dispatch(setQuestionBlockComments(questionBlockComments));
  };

  // Initialise the redux data on first render only, using a workaround utilising useEffect with empty dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useMountEffect = (fun: () => void) => useEffect(fun, []);
  useMountEffect(initReduxData);

  useEffect(() => {
    // Update when the question answering started, if needed
    // TODO: try to preserve the start date on state purge
    if (startedAnswering === "") {
      dispatch(setStartDate(getCurrentDate()));
    }
  }, [startedAnswering, dispatch]);

  // Filter by language
  const filteredAccessibilityData: AccessibilityData = hasAccessibilityData
    ? {
        [entranceKey]: filterByLanguage(accessibilityData[entranceKey], i18n.locale()),
      }
    : {};
  const sentenceGroups = hasAccessibilityData
    ? filteredAccessibilityData[entranceKey].reduce((acc: KeyValueString, sentence) => {
        const existing = Object.keys(acc).find((s) => Number(s) === sentence.sentence_group_id);
        return !existing ? { ...acc, [sentence.sentence_group_id]: sentence.sentence_order_text } : acc;
      }, {})
    : {};

  const curLocaleId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];
  const filteredPlaces = accessibilityPlaceData.filter((place) => place.language_id === curLocaleId);

  const treeItems = {
    [servicepointData.servicepoint_name ?? ""]: hasData ? `/details/${servicepointData.servicepoint_id}?checksum=${checksum}` : "",
    [i18n.t(
      "servicepoint.contactFormSummaryHeader"
    )]: `/entranceAccessibility/${servicepointData.servicepoint_id}/${entranceId}?checksum=${checksum}`,
    [i18n.t("servicepoint.contactFormPreviewHeader")]: `/entrancePreview/${servicepointData.servicepoint_id}/${entranceId}?checksum=${checksum}`,
  };

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

              <div className={styles.entranceHeader}>
                <h2>{i18n.t("servicepoint.contactFormPreviewHeader")}</h2>
              </div>
            </div>

            {!isSendingComplete && (
              <div>
                <PreviewControlButtons
                  hasSaveDraftButton={!isMainEntrancePublished}
                  setSendingComplete={setSendingComplete}
                  hasData={hasAccessibilityData}
                />

                {entranceKey === String(mainEntranceId) && <SummaryContact entranceData={entranceData[entranceKey]} hasData={hasAccessibilityData} />}

                <div>
                  <div className={styles.headercontainer}>
                    <h3>
                      {entranceId === mainEntranceId ? i18n.t("common.mainEntrance") : `${i18n.t("common.additionalEntrance")}: ${entranceName}`}
                    </h3>
                  </div>

                  <SummaryLocationPicture
                    entranceKey={entranceKey}
                    entranceData={entranceData[entranceKey]}
                    servicepointData={servicepointData}
                    isMainEntrance={entranceId === mainEntranceId}
                    isMapDisplayed={displayEntranceWithMap === "Y"}
                  />
                </div>

                {Object.keys(sentenceGroups)
                  .sort((a, b) => {
                    const orderA = sentenceGroups[Number(a)];
                    const orderB = sentenceGroups[Number(b)];
                    return orderA.localeCompare(orderB);
                  })
                  .map((sentenceGroupKey) => {
                    return (
                      <div key={`entrance_sentence_group_${entranceId}_${sentenceGroupKey}`}>
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
                      </div>
                    );
                  })}

                <div className={styles.footercontainer}>
                  <PreviewControlButtons
                    hasSaveDraftButton={!isMainEntrancePublished}
                    setSendingComplete={setSendingComplete}
                    hasData={hasAccessibilityData}
                  />
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
export const getServerSideProps: GetServerSideProps = async ({ params, query, locales }) => {
  const lngDict = await i18nLoader(locales);

  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  // let entranceSentenceGroupData: BackendEntranceSentenceGroup[] = [];
  let accessibilityData: AccessibilityData = {};
  let accessibilityPlaceData: BackendPlace[] = [];
  let entranceData: EntranceData = {};
  let entrancePlaceData: EntrancePlaceData = {};
  let questionBlockCommentData: QuestionBlockAnswerCmt[] = [];
  let entranceChoiceData: EntranceChoiceData = {};
  let questionAnswerData: BackendEntranceAnswer[] = [];
  let questionExtraAnswerData: BackendEntranceField[] = [];
  let formGuideData: BackendFormGuide[] = [];
  let displayEntranceWithMap = null;
  let formId = -1;
  let mainEntranceId = -1;
  let isMainEntrancePublished = false;

  const isChecksumValid = params !== undefined && query !== undefined && validateServicepointHash(Number(params.servicepointId), query.checksum);

  let entranceKey: string | undefined = undefined;
  let draftEntrance: BackendEntrance | undefined = undefined;

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
      }

      // Get all the existing entrances for the service point
      const servicepointEntranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}?servicepoint=${params.servicepointId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const servicepointEntranceData = await (servicepointEntranceResp.json() as Promise<EntranceResults>);

      // Get all the sentence groups for the service point and entrance
      // NOTE: commented out since it currently only get data for form_submitted 'Y'
      /*
      const entranceSentenceGroupResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_SENTENCE_GROUPS}?servicepoint_id=${servicepointData.servicepoint_id}&entrance_id=${params.entranceId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      entranceSentenceGroupData = await (entranceSentenceGroupResp.json() as Promise<BackendEntranceSentenceGroup[]>);
      */

      const mainEntrance = servicepointEntranceData?.results?.find((result) => result.is_main_entrance === "Y");
      if (!!mainEntrance) {
        // The main entrance exists, but check if it's published
        const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${mainEntrance.entrance_id}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
        isMainEntrancePublished = entranceDetail.some((e) => e.form_submitted === "Y");
        mainEntranceId = mainEntrance.entrance_id;
      } else {
        isMainEntrancePublished = false;
        mainEntranceId = -1;
      }

      // Check this specific entrance
      // Use the draft entrance
      const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${params.entranceId}&format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
      draftEntrance = entranceDetail.find((e) => e.form_submitted === "D");
      entranceKey = String(draftEntrance ? draftEntrance.entrance_id : -1);
      if (draftEntrance) {
        entranceData = {
          [entranceKey]: draftEntrance,
        };
      }

      // Use the form id from the entrance if available
      formId = draftEntrance?.form_id ?? -1;
    } catch (err) {
      console.error("Error", err);
    }
  }

  // The preview page is only allowed for servicepoint entrances (form id 0 or 1) not meeting rooms (form id 2)
  if (isChecksumValid && params !== undefined && servicepointData && entranceKey && draftEntrance && (formId === 0 || formId === 1)) {
    try {
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

      // Get the draft entrance place data for pictures and maps
      const allEntrancePlaceDataResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_PLACES}?entrance_id=${params.entranceId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const allEntrancePlaceData = await (allEntrancePlaceDataResp.json() as Promise<BackendEntrancePlace[]>);

      if (allEntrancePlaceData?.length > 0) {
        entrancePlaceData = {
          [entranceKey]: allEntrancePlaceData.filter((a) => a.form_submitted === "D"),
        };
      }

      // Get the draft question block comment data
      const allQuestionBlockCommentDataResp = await fetch(
        `${API_URL_BASE}${API_FETCH_QUESTION_BLOCK_COMMENT}?entrance_id=${params.entranceId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const allQuestionBlockCommentData = await (allQuestionBlockCommentDataResp.json() as Promise<QuestionBlockAnswerCmt[]>);

      if (allQuestionBlockCommentData?.length > 0) {
        // Note: in this case use the draftEntrance log id to filter since QuestionBlockAnswerCmt does not contain form_submitted
        questionBlockCommentData = allQuestionBlockCommentData.filter((a) => a.log_id === draftEntrance?.log_id);
      }

      // Get the draft questions and answers for use in the accessibility summaries
      const allEntranceChoicesResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_CHOICES}?entrance_id=${params.entranceId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const allEntranceChoiceData = await (allEntranceChoicesResp.json() as Promise<BackendEntranceChoice[]>);

      if (allEntranceChoiceData?.length > 0) {
        entranceChoiceData = {
          [entranceKey]: allEntranceChoiceData.filter((a) => a.form_submitted === "D"),
        };
      }

      // Get the draft sentences for this entrance
      const sentenceResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_SENTENCES}?entrance_id=${params.entranceId}&form_submitted=D&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const sentenceData = await (sentenceResp.json() as Promise<BackendEntranceSentence[]>);
      accessibilityData = {
        [entranceKey]: sentenceData,
      };

      // Get the accessibility place data for use in the accessibility summaries for entrance place names
      const accessibilityPlaceResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_PLACES}?format=json`, {
        headers: new Headers({ Authorization: getTokenHash() }),
      });
      accessibilityPlaceData = await (accessibilityPlaceResp.json() as Promise<BackendPlace[]>);

      // Get the guide text using the form id for this entrance
      if (formId >= 0) {
        const formGuideResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_FORM_GUIDE}?form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        formGuideData = await (formGuideResp.json() as Promise<BackendFormGuide[]>);
      }

      // Get whether to display the map for this draft entrance
      // Note: this value usually comes from ArBackendEntranceSentenceGroup, but this view only returns data for form_submitted 'Y',
      // so a database function is called instead to get the value for this draft entrance where form_submitted is 'D'
      const displayEntranceWithMapRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
        body: JSON.stringify({
          logId: draftEntrance?.log_id,
        }),
      };
      const displayEntranceWithMapResponse = await fetch(`${API_URL_BASE}${API_DISPLAY_ENTRANCE_WITH_MAP}`, displayEntranceWithMapRequestOptions);
      displayEntranceWithMap = await (displayEntranceWithMapResponse.text() as Promise<string | null>);
    } catch (err) {
      console.error("Error", err);
    }
  }

  return {
    props: {
      lngDict,
      servicepointData,
      // entranceSentenceGroupData,
      accessibilityData,
      accessibilityPlaceData,
      entranceData,
      entrancePlaceData,
      questionBlockCommentData,
      entranceChoiceData,
      questionAnswerData,
      questionExtraAnswerData,
      formGuideData,
      displayEntranceWithMap,
      formId,
      mainEntranceId,
      isMainEntrancePublished,
      isChecksumValid,
    },
  };
};

export default Preview;
