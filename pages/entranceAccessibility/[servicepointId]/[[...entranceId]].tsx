import React, { ReactElement, useEffect, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { Notification } from "hds-react";
import Layout from "../../../components/common/Layout";
import LoadSpinner from "../../../components/common/LoadSpinner";
import PageHelp from "../../../components/common/PageHelp";
import ValidationSummary from "../../../components/common/ValidationSummary";
import HeadlineQuestionContainer from "../../../components/HeadlineQuestionContainer";
import QuestionBlock from "../../../components/QuestionBlock";
import QuestionFormCtrlButtons from "../../../components/QuestionFormCtrlButtons";
import { useAppSelector, useAppDispatch, useLoading } from "../../../state/hooks";
import { setEntranceLocationPhoto, setEntrancePlaceBoxes, setQuestionBlockComments } from "../../../state/reducers/additionalInfoSlice";
import { setAnswers, setEntranceId, setExtraAnswers, setServicepointId, setStartDate } from "../../../state/reducers/formSlice";
import { setServicepointLocationEuref, setServicepointLocationWGS84 } from "../../../state/reducers/generalSlice";
// import { persistor } from "../../../state/store";
import {
  BackendCopyableEntrance,
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceField,
  BackendEntrancePlace,
  BackendFormGuide,
  BackendPlace,
  BackendQuestion,
  BackendQuestionBlock,
  BackendQuestionBlockField,
  BackendQuestionChoice,
  BackendServicepoint,
  Entrance,
  EntranceResults,
} from "../../../types/backendModels";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_ANSWERS,
  API_FETCH_BACKEND_ENTRANCE_FIELD,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_QUESTIONBLOCK_FIELD,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  API_FETCH_QUESTION_URL,
  API_FETCH_QUESTIONBLOCK_URL,
  API_FETCH_QUESTIONCHOICES,
  API_URL_BASE,
  LanguageLocales,
  API_FETCH_BACKEND_ENTRANCE_PLACES,
  API_FETCH_BACKEND_FORM_GUIDE,
  API_FETCH_COPYABLE_ENTRANCE,
} from "../../../types/constants";
import { BlockComment, EntranceFormProps, KeyValueNumber, KeyValueString, QuestionBlockComment, Validation } from "../../../types/general";
import i18nLoader from "../../../utils/i18n";
import { getVisibleQuestions } from "../../../utils/question";
import { getMaxLogId, validateServicepointHash } from "../../../utils/serverside";
import { getTokenHash, getCurrentDate, formatAddress, convertCoordinates, isLocationValid } from "../../../utils/utilFunctions";
import styles from "./entranceAccessibility.module.scss";

// usage: the main form / entrance page
const EntranceAccessibility = ({
  questionsData,
  questionChoicesData,
  questionBlocksData,
  questionBlockFieldData,
  questionAnswerData,
  questionExtraAnswerData,
  accessibilityPlaceData,
  entranceData,
  entrancePlaceData,
  copyableEntranceData,
  servicepointData,
  formGuideData,
  formId,
  isMainEntrancePublished,
  isChecksumValid,
}: EntranceFormProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const curLocaleId: number = LanguageLocales[curLocale as keyof typeof LanguageLocales];
  const isLoading = useLoading();

  const [filteredQuestions, setFilteredQuestions] = useState<BackendQuestion[]>([]);
  const [filteredAnswerChoices, setFilteredAnswerChoices] = useState<BackendQuestionChoice[]>([]);
  const [filteredBlockData, setFilteredBlockData] = useState<BackendQuestionBlock[]>([]);
  const [filteredBlockFieldData, setFilteredBlockFieldData] = useState<BackendQuestionBlockField[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<BackendPlace[]>([]);

  const [isMeetingRoomSaveComplete, setMeetingRoomSaveComplete] = useState(false);

  const user = useAppSelector((state) => state.generalSlice.user);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);
  const isUserValid = !!user && user.length > 0;

  // Note: To preserve any edits, entrance data is not cleared with purge, so population is handled in the useEffect below instead
  /*
  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);
  */

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  // const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const curAnsweredChoices = Object.values(curAnswers);
  const validationTime = useAppSelector((state) => state.formReducer.validationTime);
  const curInvalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);
  const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);

  const hasData = Object.keys(servicepointData).length > 0;
  const isExistingEntrance = hasData && Object.keys(entranceData).length > 0;
  const isInvalid = curInvalidBlocks.length > 0;

  // Get the question block id hash if added to the url, for example "#questionblockid-1"
  const { asPath } = router;
  const pathHash = asPath.indexOf("#") > 0 ? asPath.split("#")[1] : undefined;

  const initReduxData = () => {
    // Update servicepointId and entranceId in redux state
    if (Object.keys(servicepointData).length > 0) {
      dispatch(setServicepointId(servicepointData.servicepoint_id));

      // Update the servicepoint coordinates in redux state, for use as the default location on maps
      const { loc_easting, loc_northing } = servicepointData;
      const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
      const coordinatesWGS84 = convertCoordinates("EPSG:3067", "WGS84", coordinatesEuref).reverse() as [number, number];
      dispatch(setServicepointLocationEuref({ coordinatesEuref }));
      dispatch(setServicepointLocationWGS84({ coordinatesWGS84 }));
    }
    if (Object.keys(entranceData).length > 0) {
      dispatch(setEntranceId(entranceData.entrance_id));
    }

    // Reset the entrance data if the entrance id changes, otherwise keep any edited entrance data already stored in redux state
    const resetEntranceData =
      (Object.keys(entranceData).length === 0 && curEntranceId !== -2) ||
      (Object.keys(entranceData).length > 0 && curEntranceId !== entranceData.entrance_id);

    if (resetEntranceData) {
      // Special case for new entrances to prevent the state being reset once editing has started, since curEntranceId is -1 otherwise
      if (Object.keys(entranceData).length === 0) {
        dispatch(setEntranceId(-2));
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

      // Try to get the answer with the location and/or photo data (not comment data, which also has empty question_id)
      const entranceLocationPhotoAnswer = questionAnswerData.find((a) => {
        const { loc_easting, loc_northing, photo_url } = a || {};
        const coordinatesEuref = [loc_easting ?? 0, loc_northing ?? 0] as [number, number];
        return (a.question_id === undefined || a.question_id === null) && (photo_url || isLocationValid(coordinatesEuref));
      });
      if (entranceLocationPhotoAnswer) {
        // Use the existing location and/or photo
        // The add permissions are set later in QuestionBlockLocationPhoto
        dispatch(
          setEntranceLocationPhoto({
            entrance_id: entranceData.entrance_id,
            question_block_id: entranceLocationPhotoAnswer.question_block_id,
            existingAnswer: entranceLocationPhotoAnswer,
            modifiedAnswer: entranceLocationPhotoAnswer,
            termsAccepted: true,
            invalidValues: [],
            canAddLocation: false,
            canAddPhoto: false,
          })
        );
      } else {
        // No location or photo defined yet
        dispatch(
          setEntranceLocationPhoto({
            entrance_id: entranceData.entrance_id,
            question_block_id: -1,
            existingAnswer: {} as BackendEntranceAnswer,
            modifiedAnswer: {} as BackendEntranceAnswer,
            termsAccepted: false,
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
        )
      );

      // Put question block comments into redux state
      const questionBlockComments: QuestionBlockComment[] = [];

      // Try to get the answers with comment data (not the location or photo data, which also has empty question_id)
      const questionBlockCommentData = questionAnswerData.filter((a) => {
        const { comment_fi, comment_sv, comment_en } = a || {};
        return (a.question_id === undefined || a.question_id === null) && (comment_fi || comment_sv || comment_en);
      });

      questionBlockCommentData.forEach((answerComment) => {
        const { question_block_id, comment_fi, comment_sv, comment_en } = answerComment;

        const blockComment: BlockComment = {
          question_block_id: question_block_id,
          comment_text_fi: comment_fi,
          comment_text_sv: comment_sv,
          comment_text_en: comment_en,
        };

        // Add a new question block comment
        const newQuestionBlockComment: QuestionBlockComment = {
          entrance_id: entranceData.entrance_id,
          question_block_id: question_block_id,
          existingComment: blockComment,
          modifiedComment: blockComment,
          invalidValues: [],
        };
        questionBlockComments.push(newQuestionBlockComment);
      });

      dispatch(setQuestionBlockComments(questionBlockComments));
    }
  };

  // Initialise the redux data on first render only, using a workaround utilising useEffect with empty dependency array
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useMountEffect = (fun: () => void) => useEffect(fun, []);
  useMountEffect(initReduxData);

  useEffect(() => {
    // Update when the question answering started
    if (startedAnswering === "") {
      dispatch(setStartDate(getCurrentDate()));
    }
  }, [startedAnswering, dispatch]);

  useEffect(() => {
    // Store the data needed for the form filtered by language
    setFilteredQuestions(questionsData?.filter((question) => question.language_id === curLocaleId) || []);
    setFilteredAnswerChoices(questionChoicesData?.filter((choice) => choice.language_id === curLocaleId) || []);
    setFilteredBlockData(questionBlocksData?.filter((block) => block.language_id === curLocaleId) || []);
    setFilteredBlockFieldData(questionBlockFieldData?.filter((field) => field.language_id === curLocaleId) || []);
    setFilteredPlaces(accessibilityPlaceData?.filter((place) => place.language_id === curLocaleId) || []);
  }, [questionsData, questionChoicesData, questionBlocksData, questionBlockFieldData, accessibilityPlaceData, curLocaleId]);

  // Show the continue button if the main entrance does not exist and the top-level question has not been answered yet
  // Show the save/preview buttons if the main entrance exists, or this is an additional entrance,
  // or the top-level question has been answered and the continue button has been clicked
  const hasTopLevelAnswer = isMainEntrancePublished || formId >= 1 || (curAnsweredChoices.length > 0 && isContinueClicked);

  // Some questions parent is the top-level question, and their visibility depends on the top-level answer
  // Some questions parents are in other blocks, so determine all the visible questions based on the answers so far
  const allVisibleQuestions = getVisibleQuestions(filteredQuestions, [], curAnswers);

  useEffect(() => {
    // Focus on the first question block after the continue button is clicked
    if (isContinueClicked) {
      // document.getElementById("questionblockid-1")?.focus();
      window.location.href = "#headlinebutton-1";
    }
  }, [isContinueClicked]);

  // Get the visible blocks based on the question answers chosen
  const visibleBlockElements = filteredBlockData.reduce((visibleBlocks: JSX.Element[], block: BackendQuestionBlock) => {
    // Get the visible questions for this block
    const blockQuestions = allVisibleQuestions.filter((question) => question.question_block_id === block.question_block_id);
    const visibleQuestions = getVisibleQuestions(blockQuestions, allVisibleQuestions, curAnswers);

    // The block is only visible if it has visible questions, or is the top-level block 0
    const isVisible = block.visible_if_question_choice === null || (visibleQuestions.length > 0 && hasTopLevelAnswer);
    if (!isVisible) {
      return visibleBlocks;
    }

    // Get the other data needed for this block
    const blockExtraFields = filteredBlockFieldData.filter((field) => field.question_block_id === block.question_block_id);
    const blockAnswerChoices = filteredAnswerChoices.filter((choice) => choice.question_block_id === block.question_block_id);
    const blockCopyableEntrances = copyableEntranceData.filter((copy) => copy.question_block_id === block.question_block_id);

    return [
      ...visibleBlocks,
      <HeadlineQuestionContainer
        key={block.question_block_id}
        questionBlockId={block.question_block_id}
        text={`${block.question_block_code} ${block.text}`}
        initOpen={pathHash?.startsWith(`questionblockid-${block.question_block_id}`)}
        isValid={!curInvalidBlocks.includes(block.question_block_id)}
      >
        <QuestionBlock
          key={block.question_block_id}
          block={block}
          blockQuestions={blockQuestions}
          answerChoices={blockAnswerChoices}
          extraFields={blockExtraFields}
          accessibilityPlaces={filteredPlaces}
          copyableEntrances={blockCopyableEntrances}
        />
      </HeadlineQuestionContainer>,
    ];
  }, []);

  // Determine which blocks are invalid for the validation summary, if any
  const invalidBlockIds =
    visibleBlockElements?.reduce((acc: Validation[], elem) => {
      if (elem !== null) {
        const { id: blockFieldId, number: blockId, text: blockText } = elem.props;

        return curInvalidBlocks.includes(blockId)
          ? [
              ...acc,
              {
                valid: false,
                fieldId: blockFieldId,
                fieldLabel: blockText,
                message: i18n.t("common.missingAnswerValue"),
              },
            ]
          : acc;
      }
      return acc;
    }, []) ?? [];

  // const formSubmitted = useAppSelector((state) => state.formReducer.formSubmitted);

  // Note: There is no sub-header for meeting rooms (form id 2)
  const entranceName = entranceData ? entranceData[`name_${curLocale}`] : "";
  const entranceHeader =
    formId === 0
      ? `${i18n.t("common.mainEntrance")}: ${formatAddress(
          servicepointData.address_street_name,
          servicepointData.address_no,
          servicepointData.address_city
        )}`
      : `${i18n.t("common.entrance")}: ${entranceName}`;
  const newEntranceHeader = formId === 0 ? i18n.t("common.mainEntrance") : i18n.t("common.newEntrance");
  const servicePointHeader = isExistingEntrance ? entranceHeader : newEntranceHeader;
  const subHeader = formId >= 2 ? "" : servicePointHeader;

  const treeItems =
    formId >= 2
      ? {}
      : {
          [servicepointData.servicepoint_name ?? ""]: hasData ? `/details/${servicepointData.servicepoint_id}?checksum=${checksum}` : "",
          [i18n.t("servicepoint.contactFormSummaryHeader")]:
            curEntranceId > 0
              ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}?checksum=${checksum}`
              : `/entranceAccessibility/${curServicepointId}?checksum=${checksum}`,
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
            </div>

            {isMeetingRoomSaveComplete && (
              <div className={styles.previewButtonHeader}>
                <Notification label={i18n.t("common.formSaved")} type="success">
                  {i18n.t("common.formSentAndSaved")}
                </Notification>
              </div>
            )}

            <div className={styles.mainbuttons}>
              <QuestionFormCtrlButtons
                hasCancelButton
                //hasValidateButton={isContinueClicked}
                hasValidateButton={false}
                //hasSaveDraftButton={!formSubmitted}
                hasSaveDraftButton={hasTopLevelAnswer && !isMainEntrancePublished}
                hasPreviewButton={hasTopLevelAnswer}
                hasContinueButton={!hasTopLevelAnswer}
                hasSaveMeetingRoomButton={formId >= 2}
                setMeetingRoomSaveComplete={setMeetingRoomSaveComplete}
                visibleBlocks={visibleBlockElements}
                visibleQuestions={allVisibleQuestions}
                questionChoicesData={questionChoicesData}
                formId={formId}
              />

              {isInvalid && <ValidationSummary pageValid={!isInvalid} validationSummary={invalidBlockIds} validationTime={validationTime} />}
            </div>

            <div>
              {visibleBlockElements}

              <QuestionFormCtrlButtons
                hasCancelButton
                //hasValidateButton={isContinueClicked}
                hasValidateButton={false}
                //hasSaveDraftButton={!formSubmitted}
                hasSaveDraftButton={hasTopLevelAnswer && !isMainEntrancePublished}
                hasPreviewButton={hasTopLevelAnswer}
                hasContinueButton={!hasTopLevelAnswer}
                hasSaveMeetingRoomButton={formId >= 2}
                setMeetingRoomSaveComplete={setMeetingRoomSaveComplete}
                visibleBlocks={visibleBlockElements}
                visibleQuestions={allVisibleQuestions}
                questionChoicesData={questionChoicesData}
                formId={formId}
              />
            </div>
          </div>
        </main>
      )}
    </Layout>
  );
};

// NextJs Server-Side Rendering, HDS best practices (SSR)
export const getServerSideProps: GetServerSideProps = async ({ params, query, locales }) => {
  const lngDict = await i18nLoader(locales);

  let questionsData: BackendQuestion[] = [];
  let questionChoicesData: BackendQuestionChoice[] = [];
  let questionBlocksData: BackendQuestionBlock[] = [];
  let questionBlockFieldData: BackendQuestionBlockField[] = [];
  let accessibilityPlaceData: BackendPlace[] = [];
  let questionAnswerData: BackendEntranceAnswer[] = [];
  let questionExtraAnswerData: BackendEntranceField[] = [];
  let entranceData: BackendEntrance = {} as BackendEntrance;
  let entrancePlaceData: BackendEntrancePlace[] = [];
  let copyableEntranceData: BackendCopyableEntrance[] = [];
  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  let formGuideData: BackendFormGuide[] = [];
  let formId = -1;
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
      if (params.entranceId === undefined && (servicepointData.servicepoint_id === undefined || servicepointData.new_entrance_possible === "Y")) {
        // New entrance
        // This is a new main entrance if not existing, otherwise an additional entrance
        formId = !isMainEntrancePublished || !mainEntrance || servicepointData.servicepoint_id === undefined ? 0 : 1;
      } else if (params.entranceId !== undefined) {
        // Existing entrance
        const entranceResp = await fetch(`${API_URL_BASE}${API_FETCH_ENTRANCES}${params.entranceId}/?format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entrance = await (entranceResp.json() as Promise<Entrance>);

        // Use the form id from the entrance if available
        formId = entrance ? entrance.form : -1;

        const entranceDetailResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE}?entrance_id=${params.entranceId}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const entranceDetail = await (entranceDetailResp.json() as Promise<BackendEntrance[]>);
        if (entranceDetail.length > 0) {
          // Return entrance data for the published log id if available (form_submitted = 'Y'), otherwise the draft log id (form_submitted = 'D')
          const maxLogId = getMaxLogId(entranceDetail);
          entranceData = entranceDetail.find((a) => a.log_id === maxLogId) as BackendEntrance;

          // In some cases there is no published entrance, so form_submitted and log_id are null
          if (!entranceData) {
            entranceData = entranceDetail[0];
          }
        }
      }

      if (formId >= 0) {
        const questionsResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_URL}?format=json&form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const questionChoicesResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONCHOICES}?format=json&form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const questionBlocksResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONBLOCK_URL}?format=json&form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const questionBlockFieldResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_QUESTIONBLOCK_FIELD}?format=json&form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const accessibilityPlaceResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_PLACES}?format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const formGuideResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_FORM_GUIDE}?form_id=${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });

        questionsData = await (questionsResp.json() as Promise<BackendQuestion[]>);
        questionChoicesData = await (questionChoicesResp.json() as Promise<BackendQuestionChoice[]>);
        questionBlocksData = await (questionBlocksResp.json() as Promise<BackendQuestionBlock[]>);
        questionBlockFieldData = await (questionBlockFieldResp.json() as Promise<BackendQuestionBlockField[]>);
        accessibilityPlaceData = await (accessibilityPlaceResp.json() as Promise<BackendPlace[]>);
        formGuideData = await (formGuideResp.json() as Promise<BackendFormGuide[]>);
      }

      if (params.entranceId !== undefined) {
        // Get the question answer data for the entrance
        const allQuestionAnswersResp = await fetch(
          `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_ANSWERS}?entrance_id=${params.entranceId}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const allQuestionAnswerData = await (allQuestionAnswersResp.json() as Promise<BackendEntranceAnswer[]>);

        if (allQuestionAnswerData?.length > 0) {
          // Return answer data for the published log id if available (form_submitted = 'Y'), otherwise the draft log id (form_submitted = 'D')
          const maxLogId = getMaxLogId(allQuestionAnswerData);
          questionAnswerData = allQuestionAnswerData.filter((a) => a.log_id === maxLogId);
        }

        // Get the extra field data for the entrance
        const allQuestionExtraAnswersResp = await fetch(
          `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_FIELD}?entrance_id=${params.entranceId}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const allQuestionExtraAnswerData = await (allQuestionExtraAnswersResp.json() as Promise<BackendEntranceField[]>);

        if (allQuestionExtraAnswerData?.length > 0) {
          // Return extra answer data for the published log id if available (form_submitted = 'Y'), otherwise the draft log id (form_submitted = 'D')
          // Note: This log id value may be different from the main answer data log id
          const maxLogId = getMaxLogId(allQuestionExtraAnswerData);
          questionExtraAnswerData = allQuestionExtraAnswerData.filter((a) => a.log_id === maxLogId);
        }

        // Get the entrance place data for pictures and maps
        const allEntrancePlaceDataResp = await fetch(
          `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_PLACES}?entrance_id=${params.entranceId}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const allEntrancePlaceData = await (allEntrancePlaceDataResp.json() as Promise<BackendEntrancePlace[]>);

        if (allEntrancePlaceData?.length > 0) {
          // Return entrance place data for the published log id if available (form_submitted = 'Y'), otherwise the draft log id (form_submitted = 'D')
          // Note: This log id value may be different from the main answer data log id
          const maxLogId = getMaxLogId(allEntrancePlaceData);
          entrancePlaceData = allEntrancePlaceData.filter((a) => a.log_id === maxLogId);
        }

        // Get the copyable entrance data, used in question blocks
        const copyableEntranceDataResp = await fetch(`${API_URL_BASE}${API_FETCH_COPYABLE_ENTRANCE}?entrance_id=${params.entranceId}&format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        copyableEntranceData = await (copyableEntranceDataResp.json() as Promise<BackendCopyableEntrance[]>);
      }
    } catch (e) {
      console.error("Error", e);
    }
  }
  return {
    props: {
      lngDict,
      questionsData,
      questionChoicesData,
      questionBlocksData,
      questionBlockFieldData,
      accessibilityPlaceData,
      questionAnswerData,
      questionExtraAnswerData,
      entranceData,
      entrancePlaceData,
      copyableEntranceData,
      servicepointData,
      formGuideData,
      formId,
      isMainEntrancePublished,
      isChecksumValid,
    },
  };
};

export default EntranceAccessibility;
