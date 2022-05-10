import React, { ReactElement, useEffect } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../../components/common/Layout";
import i18nLoader from "../../../utils/i18n";
import QuestionInfo from "../../../components/QuestionInfo";
import styles from "./entranceAccessibility.module.scss";
import ServicepointMainInfoContent from "../../../components/ServicepointMainInfoContent";
import {
  API_FETCH_BACKEND_ENTRANCE,
  API_FETCH_BACKEND_ENTRANCE_ANSWERS,
  API_FETCH_BACKEND_ENTRANCE_FIELD,
  API_FETCH_BACKEND_PLACES,
  API_FETCH_BACKEND_QUESTIONBLOCK_FIELD,
  API_FETCH_BACKEND_SERVICEPOINT,
  API_FETCH_ENTRANCES,
  // API_FETCH_QUESTION_ANSWER_COMMENTS,
  // API_FETCH_QUESTION_ANSWER_LOCATIONS,
  // API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS,
  // API_FETCH_QUESTION_ANSWER_PHOTOS,
  API_FETCH_QUESTION_URL,
  API_FETCH_QUESTIONBLOCK_URL,
  API_FETCH_QUESTIONCHOICES,
  API_URL_BASE,
  LanguageLocales,
  API_FETCH_BACKEND_ENTRANCE_PLACES,
} from "../../../types/constants";
import { useAppSelector, useAppDispatch, useLoading } from "../../../state/hooks";
import QuestionBlock from "../../../components/QuestionBlock";
import {
  BackendEntrance,
  BackendEntranceAnswer,
  BackendEntranceField,
  BackendEntrancePlace,
  BackendPlace,
  BackendQuestion,
  BackendQuestionBlock,
  BackendQuestionBlockField,
  BackendQuestionChoice,
  BackendServicepoint,
  Entrance,
  EntranceResults,
  // QuestionAnswerComment,
  // QuestionAnswerLocation,
  // QuestionAnswerPhoto,
  // QuestionAnswerPhotoTxt,
} from "../../../types/backendModels";
import { EntranceFormProps } from "../../../types/general";
import HeadlineQuestionContainer from "../../../components/HeadlineQuestionContainer";
import QuestionFormCtrlButtons from "../../../components/QuestionFormCtrlButtons";
import PathTreeComponent from "../../../components/PathTreeComponent";
import { setAnswer, setAnsweredChoice, setEntranceId, setExtraAnswer, setServicepointId, setStartDate } from "../../../state/reducers/formSlice";
import { getTokenHash, getCurrentDate, formatAddress } from "../../../utils/utilFunctions";
/*
import {
  addComment,
  addComponent,
  addLocation,
  addPicture,
  clearEditingInitialState,
  setAlt,
  setInitAdditionalInfoFromDb,
} from "../../../state/reducers/additionalInfoSlice";
*/
import { setEntrancePlaceBoxes } from "../../../state/reducers/additionalInfoSlice";
// import { persistor } from "../../../state/store";
// import { setCurrentlyEditingBlock, setCurrentlyEditingQuestion } from "../../../state/reducers/generalSlice";
import LoadSpinner from "../../../components/common/LoadSpinner";

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
  servicepointData,
  // additionalInfosData,
  formId,
  isMainEntrancePublished,
}: EntranceFormProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const dispatch = useAppDispatch();
  const curLocaleId: number = LanguageLocales[curLocale as keyof typeof LanguageLocales];
  const isLoading = useLoading();

  // TODO - improve this by checking user on server-side
  const user = useAppSelector((state) => state.generalSlice.user);
  const isUserValid = !!user && user.length > 0;

  // Note: To preserve any edits, entrance data is not cleared with purge, so population is handled in the useEffect below instead
  /*
  useEffect(() => {
    // Clear the state on initial load
    persistor.purge();
  }, []);
  */

  // const curEditingQuestionAddInfoNumber = useAppSelector((state) => state.generalSlice.currentlyEditingQuestionAddinfo);
  // const curEditingBlockAddInfoNumber = useAppSelector((state) => state.generalSlice.currentlyEditingBlockAddinfo);

  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curInvalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);
  // const additionalInfoInitedFromDb = useAppSelector((state) => state.additionalInfoReducer.initAddInfoFromDb);
  const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);

  const treeItems = [servicepointData.servicepoint_name ?? "", i18n.t("servicepoint.contactFormSummaryHeader")];

  const hasData = Object.keys(servicepointData).length > 0;
  const isExistingEntrance = hasData && Object.keys(entranceData).length > 0;

  useEffect(() => {
    // Reset the entrance data if the entrance id changes, otherwise keep any edited entrance data already stored in redux state
    const resetEntranceData = Object.keys(entranceData).length > 0 && curEntranceId !== entranceData.entrance_id;
    if (resetEntranceData) {
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
    }

    // Update servicepointId and entranceId in redux state
    if (Object.keys(servicepointData).length > 0) {
      dispatch(setServicepointId(servicepointData.servicepoint_id));
      if (startedAnswering === "") {
        dispatch(setStartDate(getCurrentDate()));
      }
    }
    if (Object.keys(entranceData).length > 0) {
      dispatch(setEntranceId(entranceData.entrance_id));
    }

    // The additional info structure will be changing, so the frontend handling has been removed for now
    /*
    // loop additional info to state if first landing to form page and if data found
    if (additionalInfosData && !additionalInfoInitedFromDb) {
      // dispatch(removeImproperlySavedAddInfos());
      dispatch(setInitAdditionalInfoFromDb({ isInited: true }));
      if (additionalInfosData.comments) {
        additionalInfosData.comments.forEach((comment) => {
          const curLangStr = LanguageLocales[comment.language];
          dispatch(
            addComment({
              questionId: comment.question,
              language: curLangStr,
              value: comment.comment ?? "",
            })
          );
          // little hacky, only add component for the 1st language => fi (mandatory) for not adding 3 components if all languages
          if (curLangStr === "fi") {
            dispatch(
              addComponent({
                questionId: comment.question,
                type: "comment",
                id: comment.answer_comment_id,
              })
            );
          }
        });
      }
      if (additionalInfosData.locations) {
        additionalInfosData.locations.forEach((location) => {
          dispatch(
            addLocation({
              questionId: location.question,
              coordinates: [location.loc_northing ?? 0, location.loc_easting ?? 0],
              locNorthing: location.loc_northing ?? 0,
              locEasting: location.loc_easting ?? 0,
            })
          );
          dispatch(
            addComponent({
              questionId: location.question,
              type: "location",
              id: location.answer_location_id,
            })
          );
        });
      }

      if (additionalInfosData.photos) {
        additionalInfosData.photos.forEach((photo: QuestionAnswerPhoto) => {
          const picture = {
            qNumber: photo.question,
            id: photo.answer_photo_id,
            base: photo.photo_url,
            url: photo.photo_url,
            altText: {
              fi: "",
              sv: "",
              en: "",
            },
          };

          dispatch(addPicture(picture));
          dispatch(
            addComponent({
              questionId: photo.question,
              type: "link",
              id: photo.answer_photo_id,
            })
          );

          if (additionalInfosData.phototexts) {
            const curPhotoAlts = additionalInfosData.phototexts.filter((phototext) => phototext.answer_photo === photo.answer_photo_id);
            if (curPhotoAlts) {
              curPhotoAlts.forEach((alt: QuestionAnswerPhotoTxt) => {
                const curLangStr = LanguageLocales[alt.language];
                dispatch(
                  setAlt({
                    questionId: photo.question,
                    language: curLangStr,
                    value: alt.photo_text ?? "",
                    compId: photo.answer_photo_id,
                  })
                );
              });
            }
          }
        });
      }
    }

    // clear addinfo initState
    dispatch(clearEditingInitialState());
    */

    if (resetEntranceData) {
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
    }

    if (resetEntranceData) {
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
    }
  }, [curEntranceId, servicepointData, entranceData, questionAnswerData, questionExtraAnswerData, entrancePlaceData, startedAnswering, dispatch]);

  const filteredPlaces = accessibilityPlaceData.filter((place) => place.language_id === curLocaleId);

  // map visible blocks & questions & answers
  // const nextBlock = 0;
  // const lastBlockNumber = "";
  const visibleBlocks =
    questionBlocksData && questionsData && questionChoicesData
      ? questionBlocksData.map((block: BackendQuestionBlock) => {
          // The visible_if_question_choice is sometimes of form "1231+1231+12313+etc"
          const visibleQuestions = block.visible_if_question_choice?.split("+");

          const answersIncludeAllVisibleQuestions = visibleQuestions
            ? visibleQuestions.some((elem) => curAnsweredChoices.includes(Number(elem)))
            : false;

          const isVisible =
            (block.visible_if_question_choice === null && block.language_id === curLocaleId) ||
            (answersIncludeAllVisibleQuestions && block.language_id === curLocaleId && (isMainEntrancePublished || isContinueClicked));

          const blockQuestions = isVisible
            ? questionsData.filter((question) => question.question_block_id === block.question_block_id && question.language_id === curLocaleId)
            : undefined;

          const blockExtraFields = isVisible
            ? questionBlockFieldData.filter(
                (question) => question.question_block_id === block.question_block_id && question.language_id === curLocaleId
              )
            : undefined;

          const answerChoices = isVisible
            ? questionChoicesData.filter((choice) => choice.question_block_id === block.question_block_id && choice.language_id === curLocaleId)
            : undefined;

          // if (isVisible && blockQuestions && answerChoices && block.question_block_code !== undefined) lastBlockNumber = block.question_block_code;

          return isVisible && blockQuestions && answerChoices && block.question_block_id !== undefined ? (
            <HeadlineQuestionContainer
              key={block.question_block_id}
              number={block.question_block_id}
              text={`${block.question_block_code} ${block.text}`}
              id={`questionblockid-${block.question_block_id}`}
              /*
              initOpen={
                curEditingBlockAddInfoNumber && curEditingBlockAddInfoNumber === block.question_block_id
                  ? true
                  : block.question_block_id === nextBlock
              }
              */
              isValid={!curInvalidBlocks.includes(block.question_block_id)}
            >
              <QuestionBlock
                key={block.question_block_id}
                block={block}
                questions={blockQuestions}
                answerChoices={answerChoices}
                extraFields={blockExtraFields}
                accessibilityPlaces={filteredPlaces}
              />
            </HeadlineQuestionContainer>
          ) : null;
        })
      : null;

  const visibleQuestionChoices = questionChoicesData?.filter((choice) => {
    return choice.question_block_id !== undefined && visibleBlocks?.map((elem) => Number(elem?.key)).includes(choice.question_block_id);
  });

  /*
  // if returning from additional info page -> init page to correct location / question
  // when the window.location.hash is set -> set states of question and block numbers to -1
  // (useEffect [] didn't work for some reason)
  if (curEditingQuestionAddInfoNumber >= 0 && curEditingBlockAddInfoNumber >= 0) {
    window.location.hash = `questionid-${curEditingQuestionAddInfoNumber}`;
    dispatch(setCurrentlyEditingQuestion(-1));
    dispatch(setCurrentlyEditingBlock(-1));
  }
  */

  // const formSubmitted = useAppSelector((state) => state.formReducer.formSubmitted);

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
  const header = isExistingEntrance ? entranceHeader : newEntranceHeader;

  // Show the continue button if the main entrance does not exist and the top-level question has not been answered yet
  // Show the save/preview buttons if the main entrance exists, or this is an additional entrance,
  // or the top-level question has been answered and the continue button has been clicked
  const hasTopLevelAnswer = isMainEntrancePublished || formId >= 1 || (curAnsweredChoices.length > 0 && isContinueClicked);

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
              <h2>{header}</h2>
            </div>

            <div>
              {visibleBlocks}
              <QuestionFormCtrlButtons
                hasCancelButton
                //hasValidateButton={isContinueClicked}
                hasValidateButton={false}
                //hasSaveDraftButton={!formSubmitted}
                hasSaveDraftButton={hasTopLevelAnswer && !isMainEntrancePublished}
                hasPreviewButton={hasTopLevelAnswer}
                hasContinueButton={!hasTopLevelAnswer}
                visibleBlocks={visibleBlocks}
                visibleQuestionChoices={visibleQuestionChoices}
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
export const getServerSideProps: GetServerSideProps = async ({ params, locales }) => {
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
  let servicepointData: BackendServicepoint = {} as BackendServicepoint;
  // let additionalInfosData = {};
  // let addInfoCommentsData;
  // let addInfoLocationsData;
  // let addInfoPhotosData;
  // let addInfoPhotoTextsData;
  let formId = -1;
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
      if (params.entranceId === undefined && (servicepointData.servicepoint_id === undefined || servicepointData.new_entrance_possible === "Y")) {
        // New entrance
        // Make a new main entrance if not existing, otherwise an additional entrance
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
          // Return entrance data for the highest log id only, in case both published and draft data exists (form_submitted = 'Y' and 'D')
          const maxLogId =
            entranceDetail.sort((a: BackendEntrance, b: BackendEntrance) => {
              return (b.log_id ?? 0) - (a.log_id ?? 0);
            })[0].log_id ?? -1;

          entranceData = entranceDetail.find((a) => a.log_id === maxLogId) as BackendEntrance;

          // In some cases there is no published entrance, so form_submitted and log_id are null
          if (!entranceData) {
            entranceData = entranceDetail[0];
          }
        }
      }

      if (formId >= 0) {
        const questionsResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_URL}${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const questionChoicesResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONCHOICES}${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const questionBlocksResp = await fetch(`${API_URL_BASE}${API_FETCH_QUESTIONBLOCK_URL}${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const questionBlockFieldResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_QUESTIONBLOCK_FIELD}${formId}`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });
        const accessibilityPlaceResp = await fetch(`${API_URL_BASE}${API_FETCH_BACKEND_PLACES}?format=json`, {
          headers: new Headers({ Authorization: getTokenHash() }),
        });

        questionsData = await (questionsResp.json() as Promise<BackendQuestion[]>);
        questionChoicesData = await (questionChoicesResp.json() as Promise<BackendQuestionChoice[]>);
        questionBlocksData = await (questionBlocksResp.json() as Promise<BackendQuestionBlock[]>);
        questionBlockFieldData = await (questionBlockFieldResp.json() as Promise<BackendQuestionBlockField[]>);
        accessibilityPlaceData = await (accessibilityPlaceResp.json() as Promise<BackendPlace[]>);
      }

      if (params.entranceId !== undefined) {
        const allQuestionAnswersResp = await fetch(
          `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_ANSWERS}?entrance_id=${params.entranceId}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const allQuestionAnswerData = await (allQuestionAnswersResp.json() as Promise<BackendEntranceAnswer[]>);

        if (allQuestionAnswerData?.length > 0) {
          // Return answer data for the highest log id only, in case both published and draft data exists (form_submitted = 'Y' and 'D')
          const maxLogId =
            allQuestionAnswerData.sort((a: BackendEntranceAnswer, b: BackendEntranceAnswer) => {
              return (b.log_id ?? 0) - (a.log_id ?? 0);
            })[0].log_id ?? -1;

          questionAnswerData = allQuestionAnswerData.filter((a) => a.log_id === maxLogId);
        }

        // The additional info structure will be changing, so the backend calls have been removed for now
        /*
        if (questionAnswerData?.length > 0) {
          const logId =
            questionAnswerData.sort((a: BackendEntranceAnswer, b: BackendEntranceAnswer) => {
              return (b.log_id ?? 0) - (a.log_id ?? 0);
            })[0].log_id ?? -1;

          if (logId && logId >= 0) {
            const addInfoComments = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_ANSWER_COMMENTS}?log=${logId}`);
            const addInfoLocations = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_ANSWER_LOCATIONS}?log=${logId}`);
            const addInfoPhotos = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_ANSWER_PHOTOS}?log=${logId}`);
            const addInfoPhotoTexts = await fetch(`${API_URL_BASE}${API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS}?log=${logId}`);

            addInfoCommentsData = await (addInfoComments.json() as Promise<QuestionAnswerComment[]>);
            addInfoLocationsData = await (addInfoLocations.json() as Promise<QuestionAnswerLocation[]>);
            addInfoPhotosData = await (addInfoPhotos.json() as Promise<QuestionAnswerPhoto[]>);
            addInfoPhotoTextsData = await (addInfoPhotoTexts.json() as Promise<QuestionAnswerPhotoTxt[]>);

            additionalInfosData = {
              comments: addInfoCommentsData,
              locations: addInfoLocationsData,
              photos: addInfoPhotosData,
              phototexts: addInfoPhotoTextsData,
            };
          }
        }
        */

        const allQuestionExtraAnswersResp = await fetch(
          `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_FIELD}?entrance_id=${params.entranceId}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const allQuestionExtraAnswerData = await (allQuestionExtraAnswersResp.json() as Promise<BackendEntranceField[]>);

        if (allQuestionExtraAnswerData?.length > 0) {
          // Return extra answer data for the highest log id only, in case both published and draft data exists (form_submitted = 'Y' and 'D')
          // Note: This log id value may be different from the main answer data log id
          const maxLogId =
            allQuestionExtraAnswerData.sort((a: BackendEntranceField, b: BackendEntranceField) => {
              return (b.log_id ?? 0) - (a.log_id ?? 0);
            })[0].log_id ?? -1;

          questionExtraAnswerData = allQuestionExtraAnswerData.filter((a) => a.log_id === maxLogId);
        }

        const allEntrancePlaceDataResp = await fetch(
          `${API_URL_BASE}${API_FETCH_BACKEND_ENTRANCE_PLACES}?entrance_id=${params.entranceId}&format=json`,
          {
            headers: new Headers({ Authorization: getTokenHash() }),
          }
        );
        const allEntrancePlaceData = await (allEntrancePlaceDataResp.json() as Promise<BackendEntrancePlace[]>);

        if (allEntrancePlaceData?.length > 0) {
          // Return entrance place data for the highest log id only, in case both published and draft data exists (form_submitted = 'Y' and 'D')
          // Note: This log id value may be different from the main answer data log id
          const maxLogId =
            allEntrancePlaceData.sort((a: BackendEntrancePlace, b: BackendEntrancePlace) => {
              return (b.log_id ?? 0) - (a.log_id ?? 0);
            })[0].log_id ?? -1;

          entrancePlaceData = allEntrancePlaceData.filter((a) => a.log_id === maxLogId);
        }
      }
    } catch (e) {
      console.error("Error", e);

      questionsData = [];
      questionChoicesData = [];
      questionBlocksData = [];
      questionBlockFieldData = [];
      accessibilityPlaceData = [];
      questionAnswerData = [];
      questionExtraAnswerData = [];
      entranceData = {} as BackendEntrance;
      entrancePlaceData = [];
      servicepointData = {} as BackendServicepoint;
      // additionalInfosData = {};
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
      servicepointData,
      // additionalInfosData,
      formId,
      isMainEntrancePublished,
    },
  };
};

export default EntranceAccessibility;
