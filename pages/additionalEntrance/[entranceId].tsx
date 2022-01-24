// note: copied from accessibilityEdit page -> edit accordingly

import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { IconCrossCircle, IconQuestionCircle } from "hds-react";
import Layout from "../../components/common/Layout";
import i18nLoader from "../../utils/i18n";
import QuestionInfo from "../../components/QuestionInfo";
import styles from "./additionalEntrance.module.scss";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import {
  API_FETCH_QUESTIONBLOCK_URL,
  API_FETCH_QUESTIONCHOICES,
  API_FETCH_QUESTION_URL,
  PHONE_REGEX,
  EMAIL_REGEX,
  API_FETCH_ENTRANCES,
  API_FETCH_BACKEND_ENTRANCE_ANSWERS,
  API_FETCH_SERVICEPOINTS,
  API_FETCH_QUESTION_ANSWER_COMMENTS,
  API_FETCH_QUESTION_ANSWER_LOCATIONS,
  API_FETCH_QUESTION_ANSWER_PHOTOS,
  API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS,
  LanguageLocales,
} from "../../types/constants";
import { useAppSelector, useAppDispatch, useLoading } from "../../state/hooks";
import QuestionBlock from "../../components/QuestionBlock";
import {
  BackendEntranceAnswer,
  BackendQuestion,
  BackendQuestionBlock,
  BackendQuestionChoice,
  Entrance,
  QuestionAnswerComment,
  QuestionAnswerLocation,
  QuestionAnswerPhoto,
  QuestionAnswerPhotoTxt,
  Servicepoint,
} from "../../types/backendModels";
import { MainEntranceFormProps } from "../../types/general";
import HeadlineQuestionContainer from "../../components/HeadlineQuestionContainer";

import QuestionFormCtrlButtons from "../../components/QuestionFormCtrlButtons";
import PathTreeComponent from "../../components/PathTreeComponent";
import {
  setAnswer,
  setAnsweredChoice,
  setEmail,
  setPhoneNumber,
  setServicepointId,
  initForm,
  setContactPerson,
  changePhoneNumberStatus,
  changeEmailStatus,
  setEntranceId,
  setStartDate,
  setWwwAddress,
} from "../../state/reducers/formSlice";
// import ContactInformationQuestionContainer from "../../components/ContactInformationQuestionContainer";
import {
  addComment,
  addComponent,
  addLocation,
  addPicture,
  clearEditingInitialState,
  setAlt,
  setInitAdditionalInfoFromDb,
} from "../../state/reducers/additionalInfoSlice";
import { getCurrentDate } from "../../utils/utilFunctions";
import { setCurrentlyEditingBlock, setCurrentlyEditingQuestion } from "../../state/reducers/generalSlice";
import LoadSpinner from "../../components/common/LoadSpinner";

// usage: the main form / pääsisäänkäynti page
const AdditionalEntrance = ({
  questionsData,
  questionChoicesData,
  questionBlocksData,
  questionAnswerData,
  servicepointData,
  additionalInfosData,
  form_id,
  entrance_id,
}: MainEntranceFormProps): ReactElement => {
  console.log("tää on formiiiii");
  console.log(form_id);

  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const dispatch = useAppDispatch();
  const curLocaleId: number = LanguageLocales[curLocale as keyof typeof LanguageLocales];

  const isLoading = useLoading();

  const curEditingQuestionAddInfoNumber = useAppSelector((state) => state.generalSlice.currentlyEditingQuestionAddinfo);

  const curEditingBlockAddInfoNumber = useAppSelector((state) => state.generalSlice.currentlyEditingBlockAddinfo);

  const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curInvalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);
  const formInited = useAppSelector((state) => state.formReducer.formInited);
  const additionalInfoInitedFromDb = useAppSelector((state) => state.additionalInfoReducer.initAddInfoFromDb);
  const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);
  const curAnswers = useAppSelector((state) => state.formReducer.answers);

  const treeItems = [servicepointData.servicepoint_name, "PH: Esteettömyystiedot"];

  // validates contactinfo data and sets to state
  if (servicepointData !== undefined && !formInited) {
    const phoneNumber = servicepointData.accessibility_phone ?? "";
    const email = servicepointData.accessibility_email ?? "";
    const www = servicepointData.accessibility_www ?? "";

    const phonePattern = new RegExp(PHONE_REGEX);
    const emailPattern = new RegExp(EMAIL_REGEX);

    dispatch(setPhoneNumber(phoneNumber));
    dispatch(setEmail(email));
    dispatch(setWwwAddress(www));
    dispatch(setServicepointId(servicepointData.servicepoint_id));
    dispatch(setEntranceId(Number(entrance_id)));
    if (startedAnswering === "") dispatch(setStartDate(getCurrentDate()));

    // VALIDATE PHONE
    if (!phonePattern.test(phoneNumber)) {
      dispatch(changePhoneNumberStatus(false));
    } else {
      dispatch(changePhoneNumberStatus(true));
    }

    // VALIDATE EMAIL
    if (!emailPattern.test(email)) {
      dispatch(changeEmailStatus(false));
    } else {
      dispatch(changeEmailStatus(true));
    }

    // CONTACTPERSON DOES NOT EXIST IN THE DATABASE YET
    dispatch(setContactPerson(""));
    dispatch(initForm());
  }

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

  if (Object.keys(questionAnswerData).length !== 0) {
    questionAnswerData.forEach((a: BackendEntranceAnswer) => {
      const questionNumber = a.question_id;
      const answer = a.question_choice_id;
      if (!!questionNumber && !!answer && !curAnsweredChoices.includes(answer) && curAnswers[questionNumber] === undefined) {
        dispatch(setAnsweredChoice(answer));
        dispatch(setAnswer({ questionNumber, answer }));
      }
    });
  }

  // map visible blocks & questions & answers
  const nextBlock = 0;
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
            (answersIncludeAllVisibleQuestions && block.language_id === curLocaleId && isContinueClicked);

          const blockQuestions = isVisible
            ? questionsData.filter((question) => question.question_block_id === block.question_block_id && question.language_id === curLocaleId)
            : null;

          const answerChoices = isVisible
            ? questionChoicesData.filter((choice) => choice.question_block_id === block.question_block_id && choice.language_id === curLocaleId)
            : null;

          // if (isVisible && blockQuestions && answerChoices && block.question_block_code !== undefined) lastBlockNumber = block.question_block_code;

          return isVisible && blockQuestions && answerChoices && block.question_block_id !== undefined ? (
            <HeadlineQuestionContainer
              key={block.question_block_id}
              number={block.question_block_id}
              text={`${block.question_block_code} ${block.text}`}
              id={`questionblockid-${block.question_block_id}`}
              initOpen={
                curEditingBlockAddInfoNumber && curEditingBlockAddInfoNumber === block.question_block_id
                  ? true
                  : block.question_block_id === nextBlock
              }
              isValid={!curInvalidBlocks.includes(block.question_block_id)}
            >
              <QuestionBlock
                key={block.question_block_id}
                description={block.description ?? null}
                questions={blockQuestions}
                answers={answerChoices}
                photoUrl={block.photo_url}
                photoText={block.photo_text}
              />
            </HeadlineQuestionContainer>
          ) : null;
        })
      : null;

  // special case for contact info block for it's not coming from db
  // todo: should isContinueClicked be removed due to the button removed which caused this,
  // also todo: maybe remove this code block and possibly the whole ContactInformationQuestionContainer component
  //
  // if (isContinueClicked) {
  //   visibleBlocks?.push(
  //     <HeadlineQuestionContainer
  //       key={99}
  //       number={99}
  //       text={i18n.t("ContactInformation.contactInformation")}
  //       initOpen={false}
  //       isValid={!curInvalidBlocks.includes(99)}
  //     >
  //       <ContactInformationQuestionContainer
  //         key={99}
  //         blockNumber={Number(lastBlockNumber) + 1}
  //       />{" "}
  //     </HeadlineQuestionContainer>
  //   );
  // }

  const visibleQuestionChoices = questionChoicesData?.filter((choice) => {
    return !!choice.question_block_id && visibleBlocks?.map((elem) => Number(elem?.key)).includes(choice.question_block_id);
  });

  // if returning from additional info page -> init page to correct location / question
  // when the window.location.hash is set -> set states of question and block numbers to -1
  // (useEffect [] didn't work for some reason)
  if (curEditingQuestionAddInfoNumber >= 0 && curEditingBlockAddInfoNumber >= 0) {
    window.location.hash = `questionid-${curEditingQuestionAddInfoNumber}`;
    dispatch(setCurrentlyEditingQuestion(-1));
    dispatch(setCurrentlyEditingBlock(-1));
  }

  const formSubmitted = useAppSelector((state) => state.formReducer.formSubmitted);

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
              <h2>{form_id === 0 ? i18n.t("common.mainEntrance") : i18n.t("common.additionalEntrance")}</h2>
            </div>
            <div>
              {visibleBlocks}
              <QuestionFormCtrlButtons
                hasCancelButton
                hasValidateButton={isContinueClicked}
                hasSaveDraftButton={!formSubmitted}
                hasPreviewButton
                visibleBlocks={visibleBlocks}
                visibleQuestionChoices={visibleQuestionChoices}
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

  let questionsData;
  let questionChoicesData;
  let questionBlocksData;
  let questionAnswerData;
  let entranceData;
  let servicepointData;
  let additionalInfosData = {};
  let addInfoCommentsData;
  let addInfoLocationsData;
  let addInfoPhotosData;
  let addInfoPhotoTextsData;
  const form_id = 1;
  let entrance_id: string | string[] | undefined = "";
  if (params !== undefined) {
    try {
      entrance_id = params.entranceId;
      const entranceResp = await fetch(`${API_FETCH_ENTRANCES}${entrance_id}/?format=json`);
      entranceData = await (entranceResp.json() as Promise<Entrance>);

      const servicepoint_id = entranceData.servicepoint;
      //   form_id = EntranceData["form"];

      const questionsResp = await fetch(API_FETCH_QUESTION_URL + form_id);
      const questionChoicesResp = await fetch(API_FETCH_QUESTIONCHOICES + form_id);
      const questionBlocksResp = await fetch(API_FETCH_QUESTIONBLOCK_URL + form_id);
      const questionAnswersResp = await fetch(`${API_FETCH_BACKEND_ENTRANCE_ANSWERS}?entrance_id=${entrance_id}&format=json`);
      const servicepointResp = await fetch(`${API_FETCH_SERVICEPOINTS}${servicepoint_id}/?format=json`);

      questionsData = await (questionsResp.json() as Promise<BackendQuestion[]>);
      questionChoicesData = await (questionChoicesResp.json() as Promise<BackendQuestionChoice[]>);
      questionBlocksData = await (questionBlocksResp.json() as Promise<BackendQuestionBlock[]>);
      questionAnswerData = await (questionAnswersResp.json() as Promise<BackendEntranceAnswer[]>);
      servicepointData = await (servicepointResp.json() as Promise<Servicepoint>);

      if (questionAnswerData.length !== 0) {
        const logId =
          questionAnswerData.sort((a: BackendEntranceAnswer, b: BackendEntranceAnswer) => {
            return (b.log_id ?? 0) - (a.log_id ?? 0);
          })[0].log_id ?? -1;

        if (logId && logId >= 0) {
          const addInfoComments = await fetch(`${API_FETCH_QUESTION_ANSWER_COMMENTS}?log=${logId}`);
          const addInfoLocations = await fetch(`${API_FETCH_QUESTION_ANSWER_LOCATIONS}?log=${logId}`);
          const addInfoPhotos = await fetch(`${API_FETCH_QUESTION_ANSWER_PHOTOS}?log=${logId}`);
          const addInfoPhotoTexts = await fetch(`${API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS}?log=${logId}`);

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
    } catch (e) {
      questionsData = {};
      questionChoicesData = {};
      questionBlocksData = {};
      questionAnswerData = {};
      entranceData = {};
      servicepointData = {};
      additionalInfosData = {};
    }
  }
  return {
    props: {
      form_id,
      questionsData,
      questionChoicesData,
      questionBlocksData,
      questionAnswerData,
      servicepointData,
      additionalInfosData,
      entrance_id,
      lngDict,
    },
  };
};

export default AdditionalEntrance;
