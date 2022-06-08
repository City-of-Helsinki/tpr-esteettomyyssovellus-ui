import React, { ReactElement, useEffect, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconQuestionCircle, Notification } from "hds-react";
import Layout from "../../../components/common/Layout";
import i18nLoader from "../../../utils/i18n";
import ServicepointLandingSummaryContact from "../../../components/ServicepointLandingSummaryContact";
import styles from "./preview.module.scss";
import QuestionInfo from "../../../components/QuestionInfo";
import ServicepointMainInfoContent from "../../../components/ServicepointMainInfoContent";
import PathTreeComponent from "../../../components/PathTreeComponent";
import PreviewControlButtons from "../../../components/PreviewControlButtons";
import ServicepointLandingSummaryContent from "../../../components/ServicepointLandingSummaryContent";
import SummaryAccessibility from "../../../components/SummaryAccessibility";
import SummaryAccessibilityPlace from "../../../components/SummaryAccessibilityPlace";
import SummaryLocationPicture from "../../../components/SummaryLocationPicture";
import AddNewEntranceNotice from "../../../components/common/AddNewEntranceNotice";
import LoadSpinner from "../../../components/common/LoadSpinner";
import { useAppDispatch, useAppSelector, useLoading } from "../../../state/hooks";
import { setEntranceLocationPhoto, setEntrancePlaceBoxes, setQuestionBlockComments } from "../../../state/reducers/additionalInfoSlice";
import { setServicepointId, setEntranceId, setStartDate, setAnswers, setExtraAnswers } from "../../../state/reducers/formSlice";
import { filterByLanguage, formatAddress, getCurrentDate, getTokenHash } from "../../../utils/utilFunctions";
import {
  // API_FETCH_ANSWER_LOGS,
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_ANSWERS,
  API_FETCH_BACKEND_ENTRANCE_CHOICES,
  API_FETCH_BACKEND_ENTRANCE_FIELD,
  API_FETCH_BACKEND_ENTRANCE_PLACES,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_SENTENCES,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_QUESTION_BLOCK_COMMENT,
  API_URL_BASE,
  LanguageLocales,
} from "../../../types/constants";
import { persistor } from "../../../state/store";
import {
  // AnswerLog,
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceChoice,
  BackendEntranceField,
  BackendEntrancePlace,
  BackendEntranceSentence,
  BackendPlace,
  BackendServicepoint,
  Entrance,
  EntranceResults,
  QuestionBlockAnswerCmt,
} from "../../../types/backendModels";
import {
  AccessibilityData,
  BlockComment,
  EntranceData,
  EntrancePlaceData,
  KeyValueNumber,
  KeyValueString,
  PreviewProps,
  QuestionBlockComment,
} from "../../../types/general";

// usage: the preview page of an entrance, displayed before saving the completed form
const Preview = ({
  servicepointData,
  accessibilityData,
  accessibilityPlaceData,
  entranceData,
  entrancePlaceData,
  questionBlockCommentData,
  entranceChoiceData,
  questionAnswerData,
  questionExtraAnswerData,
  isMainEntrancePublished,
}: PreviewProps): ReactElement => {
  const i18n = useI18n();
  const curLocale = i18n.locale();
  const dispatch = useAppDispatch();
  const isLoading = useLoading();
  const treeItems = [servicepointData.servicepoint_name ?? ""];

  const [isSendingComplete, setSendingComplete] = useState(false);

  // TODO - improve this by checking user on server-side
  const user = useAppSelector((state) => state.generalSlice.user);
  const isUserValid = !!user && user.length > 0;

  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);

  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);

  const entranceKey = accessibilityData && Object.keys(accessibilityData).length > 0 ? Object.keys(accessibilityData)[0] : "";
  const entranceName = entranceData && entranceData[entranceKey] ? entranceData[entranceKey][`name_${curLocale}`] : "";
  const subHeader =
    entranceKey === "main"
      ? `${i18n.t("common.mainEntrance")}: ${formatAddress(
          servicepointData.address_street_name,
          servicepointData.address_no,
          servicepointData.address_city
        )}`
      : `${i18n.t("common.entrance")}: ${entranceName ?? ""}`;

  const hasData = Object.keys(servicepointData).length > 0;
  const hasAccessibilityData = accessibilityData && accessibilityData[entranceKey] && accessibilityData[entranceKey].length > 0;
  const hasPlaceData = entrancePlaceData && entrancePlaceData.length > 0;

  const initReduxData = () => {
    // Update servicepointId and entranceId in redux state
    if (Object.keys(servicepointData).length > 0) {
      dispatch(setServicepointId(servicepointData.servicepoint_id));
    }
    if (Object.keys(entranceData).length > 0) {
      dispatch(setEntranceId(entranceData[entranceKey].entrance_id));
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
    const entranceLocationPhotoAnswer = questionAnswerData.find((a) => a.question_id === undefined || a.question_id === null);
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
        entrancePlaceData.map((place) => {
          const { entrance_id, place_id, order_number } = place;

          // Try to make sure the order number is 1 or higher
          return {
            entrance_id: entrance_id,
            place_id: place_id,
            order_number: order_number && order_number > 0 ? order_number : 1,
            existingBox: place,
            modifiedBox: place,
            isDeleted: false,
            termsAccepted: true,
            invalidValues: [],
          };
        })
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

  const curLocaleId: number = LanguageLocales[i18n.locale() as keyof typeof LanguageLocales];
  const filteredPlaces = accessibilityPlaceData.filter((place) => place.language_id === curLocaleId);

  const getGroupedAccessibilityData = (sentences?: BackendEntranceSentence[]): AccessibilityData | undefined => {
    if (sentences) {
      return sentences.reduce((acc: AccessibilityData, sentence) => {
        const { sentence_group_id } = sentence;
        return {
          ...acc,
          [sentence_group_id]: acc[sentence_group_id] ? [...acc[sentence_group_id], sentence] : [sentence],
        };
      }, {});
    }
  };

  const groupedAccessibilityData = getGroupedAccessibilityData(filteredAccessibilityData ? filteredAccessibilityData[entranceKey] : undefined);

  const getSentenceGroups = (groupedSentences?: AccessibilityData) => {
    if (groupedSentences) {
      return Object.keys(groupedSentences).map((sentenceGroupId) => {
        return (
          <SummaryAccessibility
            key={`sentencegroup_${sentenceGroupId}`}
            entranceKey={entranceKey}
            sentenceGroupId={sentenceGroupId}
            sentenceGroup={groupedAccessibilityData ? groupedAccessibilityData[sentenceGroupId] : undefined}
            entranceChoiceData={{ [entranceKey]: entranceChoiceData }}
            hasData={hasAccessibilityData}
          />
        );
      });
    }
  };

  const getEntrancePlaceName = (entrancePlaceId: string) => {
    if (filteredPlaces) {
      const accessibilityPlace = filteredPlaces.find((place) => place.place_id === Number(entrancePlaceId));
      const { name } = accessibilityPlace ?? {};
      return name ?? i18n.t("additionalInfo.additionalInfo");
    }
    return i18n.t("additionalInfo.additionalInfo");
  };

  const getGroupedEntrancePlaceData = (entrancePlaces?: BackendEntrancePlace[]): EntrancePlaceData | undefined => {
    if (entrancePlaces) {
      return entrancePlaces.reduce((acc: EntrancePlaceData, entrancePlace) => {
        const { place_id } = entrancePlace;
        return {
          ...acc,
          [place_id]: acc[place_id] ? [...acc[place_id], entrancePlace] : [entrancePlace],
        };
      }, {});
    }
  };

  const groupedEntrancePlaceData = getGroupedEntrancePlaceData(entrancePlaceData);

  const getEntrancePlaces = (groupedEntrancePlaces?: EntrancePlaceData) => {
    if (groupedEntrancePlaces) {
      return Object.keys(groupedEntrancePlaces).map((entrancePlaceId) => {
        return (
          <SummaryAccessibilityPlace
            key={`entranceplace_${entrancePlaceId}`}
            entrancePlaceName={getEntrancePlaceName(entrancePlaceId)}
            entrancePlaceData={groupedEntrancePlaceData ? groupedEntrancePlaceData[entrancePlaceId] : undefined}
          />
        );
      });
    }
  };

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

              <div className={styles.entranceHeader}>
                <h2>{i18n.t("servicepoint.contactFormPreviewHeader")}</h2>
              </div>
            </div>

            {!isSendingComplete && (
              <div className={styles.contentcontainer}>
                <PreviewControlButtons hasSaveDraftButton={!isMainEntrancePublished} setSendingComplete={setSendingComplete} />

                {entranceKey === "main" && (
                  <ServicepointLandingSummaryContact entranceData={entranceData[entranceKey]} hasData={hasAccessibilityData} />
                )}

                <ServicepointLandingSummaryContent
                  contentHeader={
                    entranceKey === "main" ? i18n.t("servicepoint.mainEntranceLocationLabel") : i18n.t("servicepoint.entranceLocationLabel")
                  }
                >
                  <SummaryLocationPicture entranceKey={entranceKey} entranceData={entranceData[entranceKey]} servicepointData={servicepointData} />
                </ServicepointLandingSummaryContent>

                {hasAccessibilityData && (
                  <div>
                    <h2 className={styles.header}>{i18n.t("servicepoint.accessibilityPreviewHeader")}</h2>
                    <div className={styles.content}>{getSentenceGroups(groupedAccessibilityData)}</div>
                  </div>
                )}

                {hasPlaceData && (
                  <div>
                    <h2 className={styles.header}>{i18n.t("servicepoint.picturesLocations")}</h2>
                    <div className={styles.content}>{getEntrancePlaces(groupedEntrancePlaceData)}</div>
                  </div>
                )}

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
  let accessibilityPlaceData: BackendPlace[] = [];
  let entranceData: EntranceData = {};
  let entrancePlaceData: BackendEntrancePlace[] = [];
  let questionBlockCommentData: QuestionBlockAnswerCmt[] = [];
  let entranceChoiceData: BackendEntranceChoice[] = [];
  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let questionAnswerData: BackendEntranceAnswer[] = [];
  let questionExtraAnswerData: BackendEntranceField[] = [];
  // const hasExistingFormData = false;
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

      // Get the draft entrance place data for pictures and maps
      const allEntrancePlaceDataResp = await fetch(
        `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_PLACES}?entrance_id=${params.entranceId}&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const allEntrancePlaceData = await (allEntrancePlaceDataResp.json() as Promise<BackendEntrancePlace[]>);

      if (allEntrancePlaceData?.length > 0) {
        entrancePlaceData = allEntrancePlaceData.filter((a) => a.form_submitted === "D");
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
        entranceChoiceData = allEntranceChoiceData.filter((a) => a.form_submitted === "D");
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

      servicepointData = {} as BackendServicepoint;
      accessibilityData = {};
      accessibilityPlaceData = [];
      entranceData = {};
      entrancePlaceData = [];
      questionBlockCommentData = [];
      entranceChoiceData = [];
      questionAnswerData = [];
      questionExtraAnswerData = [];
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
      questionBlockCommentData,
      entranceChoiceData,
      questionAnswerData,
      questionExtraAnswerData,
      // hasExistingFormData,
      isMainEntrancePublished,
    },
  };
};

export default Preview;
