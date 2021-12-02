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
  LANGUAGE_LOCALES,
} from "../../types/constants";
import { useAppSelector, useAppDispatch, useLoading } from "../../state/hooks";
import QuestionBlock from "../../components/QuestionBlock";
import {
  AddInfoPhoto,
  AddInfoPhotoText,
  MainEntranceFormProps,
  QuestionBlockProps,
} from "../../types/general";
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
import ContactInformationQuestionContainer from "../../components/ContactInformationQuestionContainer";
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
import {
  setCurrentlyEditingBlock,
  setCurrentlyEditingQuestion,
} from "../../state/reducers/generalSlice";
import LoadSpinner from "../../components/common/LoadSpinner";

// usage: the main form / pääsisäänkäynti page
const AccessibilityEdit = ({
  QuestionsData,
  QuestionChoicesData,
  QuestionBlocksData,
  QuestionAnswerData,
  ServicepointData,
  AdditionalInfosData,
  form_id,
  entrance_id,
}: MainEntranceFormProps): ReactElement => {
  console.log("tää on formiiiii");
  console.log(form_id);

  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const dispatch = useAppDispatch();
  // @ts-ignore: TODO:
  const curLocaleId: number = LANGUAGE_LOCALES[curLocale];

  const isLoading = useLoading();

  const curEditingQuestionAddInfoNumber = useAppSelector(
    (state) => state.generalSlice.currentlyEditingQuestionAddinfo
  );

  const curEditingBlockAddInfoNumber = useAppSelector(
    (state) => state.generalSlice.currentlyEditingBlockAddinfo
  );

  const curAnsweredChoices = useAppSelector(
    (state) => state.formReducer.answeredChoices
  );
  const curInvalidBlocks = useAppSelector(
    (state) => state.formReducer.invalidBlocks
  );
  const formInited = useAppSelector((state) => state.formReducer.formInited);
  const additionalInfoInitedFromDb = useAppSelector(
    (state) => state.additionalInfoReducer.initAddInfoFromDb
  );
  const isContinueClicked = useAppSelector(
    (state) => state.formReducer.isContinueClicked
  );
  const startedAnswering = useAppSelector(
    (state) => state.formReducer.startedAnswering
  );
  const treeItems = [
    ServicepointData.servicepoint_name,
    "PH: Esteettömyystiedot",
  ];

  // validates contactinfo data and sets to state
  if (ServicepointData !== undefined && !formInited) {
    const phoneNumber = ServicepointData.accessibility_phone;
    const email = ServicepointData.accessibility_email;
    const www = ServicepointData.accessibility_www;

    const phonePattern = new RegExp(PHONE_REGEX);
    const emailPattern = new RegExp(EMAIL_REGEX);

    dispatch(setPhoneNumber(phoneNumber));
    dispatch(setEmail(email));
    dispatch(setWwwAddress(www));
    dispatch(setServicepointId(ServicepointData.servicepoint_id));
    dispatch(setEntranceId(Number(entrance_id!)));
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
  if (AdditionalInfosData && !additionalInfoInitedFromDb) {
    // dispatch(removeImproperlySavedAddInfos());
    dispatch(setInitAdditionalInfoFromDb({ isInited: true }));
    if (AdditionalInfosData.comments) {
      AdditionalInfosData.comments.forEach((comment) => {
        const curLangStr = LANGUAGE_LOCALES[comment.language];
        dispatch(
          addComment({
            questionId: comment.question,
            language: curLangStr,
            value: comment.comment,
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
    if (AdditionalInfosData.locations) {
      AdditionalInfosData.locations.forEach((location) => {
        dispatch(
          addLocation({
            questionId: location.question,
            coordinates: [location.loc_northing, location.loc_easting],
            locNorthing: location.loc_northing,
            locEasting: location.loc_easting,
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

    if (AdditionalInfosData.photos) {
      AdditionalInfosData.photos.forEach((photo: AddInfoPhoto) => {
        const picture = {
          qNumber: photo.question,
          id: photo.answer_photo_id,
          base: photo.photo_url,
          url: photo.photo_url,
          fi: "",
          sv: "",
          en: "",
        };

        dispatch(addPicture(picture));
        dispatch(
          addComponent({
            questionId: photo.question,
            type: "link",
            id: photo.answer_photo_id,
          })
        );

        if (AdditionalInfosData.phototexts) {
          const curPhotoAlts = AdditionalInfosData.phototexts.filter(
            (phototext) => phototext.answer_photo === photo.answer_photo_id
          );
          if (curPhotoAlts) {
            curPhotoAlts.forEach((alt: AddInfoPhotoText) => {
              const curLangStr = LANGUAGE_LOCALES[alt.language];
              dispatch(
                setAlt({
                  questionId: photo.question,
                  language: curLangStr,
                  value: alt.photo_text,
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

  if (Object.keys(QuestionAnswerData).length !== 0) {
    const curAnswers = useAppSelector((state) => state.formReducer.answers);
    QuestionAnswerData.map((a: any) => {
      const questionNumber = a.question_id;
      const answer = a.question_choice_id;
      const answerString = answer;
      if (
        !curAnsweredChoices.includes(answer) &&
        curAnswers[questionNumber] === undefined
      ) {
        dispatch(setAnsweredChoice(answerString));
        dispatch(setAnswer({ questionNumber, answer }));
      }
    });
  }

  // map visible blocks & questions & answers
  const nextBlock = 0;
  let lastBlockNumber = "";
  const visibleBlocks =
    QuestionBlocksData && QuestionsData && QuestionChoicesData
      ? QuestionBlocksData.map((block: QuestionBlockProps) => {
          // The visible_if_question_choice is sometimes of form "1231+1231+12313+etc"
          const visibleQuestions = block.visible_if_question_choice?.split("+");

          const answersIncludeAllVisibleQuestions = visibleQuestions
            ? visibleQuestions.some((elem) =>
                // @ts-ignore: For some reason curAnsweredChoices type string[] contains numbers O_o
                curAnsweredChoices.includes(Number(elem))
              )
            : false;

          const isVisible =
            (block.visible_if_question_choice === null &&
              block.language_id === curLocaleId) ||
            (answersIncludeAllVisibleQuestions &&
              block.language_id === curLocaleId &&
              isContinueClicked);

          const blockQuestions = isVisible
            ? QuestionsData.filter(
                (question) =>
                  question.question_block_id === block.question_block_id &&
                  question.language_id === curLocaleId
              )
            : null;

          const answerChoices = isVisible
            ? QuestionChoicesData.filter(
                (choice) =>
                  choice.question_block_id === block.question_block_id &&
                  choice.language_id === curLocaleId
              )
            : null;

          if (
            isVisible &&
            blockQuestions &&
            answerChoices &&
            block.question_block_code !== undefined
          )
            lastBlockNumber = block.question_block_code;

          return isVisible &&
            blockQuestions &&
            answerChoices &&
            block.question_block_id !== undefined ? (
            <HeadlineQuestionContainer
              key={block.question_block_id}
              number={block.question_block_id}
              text={`${block.question_block_code} ${block.text}`}
              id={`questionblockid-${block.question_block_id}`}
              initOpen={
                curEditingBlockAddInfoNumber &&
                curEditingBlockAddInfoNumber === block.question_block_id
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

  const visibleQuestionChoices = QuestionChoicesData?.filter((choice) => {
    if (
      visibleBlocks
        ?.map((elem) => Number(elem?.key))
        .includes(choice.question_block_id!)
    ) {
      return choice.question_choice_id;
    }
  });

  // if returning from additional info page -> init page to correct location / question
  // when the window.location.hash is set -> set states of question and block numbers to -1
  // (useEffect [] didn't work for some reason)
  if (
    curEditingQuestionAddInfoNumber >= 0 &&
    curEditingBlockAddInfoNumber >= 0
  ) {
    window.location.hash = `questionid-${curEditingQuestionAddInfoNumber}`;
    dispatch(setCurrentlyEditingQuestion(-1));
    dispatch(setCurrentlyEditingBlock(-1));
  }

  const formSubmitted = useAppSelector(
    (state) => state.formReducer.formSubmitted
  );

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
              <h1>{ServicepointData.servicepoint_name}</h1>
              <h2>
                {form_id === 0
                  ? i18n.t("common.mainEntrance")
                  : i18n.t("common.additionalEntrance")}
              </h2>
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
export const getServerSideProps: GetServerSideProps = async ({
  params,
  locales,
}) => {
  const lngDict = await i18nLoader(locales);

  // todo: if user not checked here remove these
  // also reduxStore and reduxStore.getState() need to be changed to redux-toolkit
  // const reduxStore = store;
  // const initialReduxState = reduxStore.getState();

  // const user = await checkUser(req);
  // if (!user) {
  //   // Invalid user but login is not required
  // }
  // if (user && user.authenticated) {
  //   initialReduxState.general.user = user;
  // }
  let QuestionsData;
  let QuestionChoicesData;
  let QuestionBlocksData;
  let QuestionAnswerData;
  let EntranceData;
  let ServicepointData;
  let AdditionalInfosData = {};
  let AddInfoCommentsData;
  let AddInfoLocationsData;
  let AddInfoPhotosData;
  let AddInfoPhotoTextsData;
  const form_id = 1;
  let entrance_id: string | string[] | undefined = "";
  if (params !== undefined) {
    try {
      entrance_id = params.entranceId;
      const EntranceResp = await fetch(
        `${API_FETCH_ENTRANCES}${entrance_id}/?format=json`
      );
      EntranceData = await EntranceResp.json();

      const servicepoint_id = EntranceData.servicepoint;
      //   form_id = EntranceData["form"];
      const QuestionsResp = await fetch(API_FETCH_QUESTION_URL + form_id);
      const QuestionChoicesResp = await fetch(
        API_FETCH_QUESTIONCHOICES + form_id
      );
      const QuestionBlocksResp = await fetch(
        API_FETCH_QUESTIONBLOCK_URL + form_id
      );
      const QuestionAnswersResp = await fetch(
        `${API_FETCH_BACKEND_ENTRANCE_ANSWERS}?entrance_id=${entrance_id}&format=json`
      );

      const ServicepointResp = await fetch(
        `${API_FETCH_SERVICEPOINTS}${servicepoint_id}/?format=json`
      );
      QuestionsData = await QuestionsResp.json();
      QuestionChoicesData = await QuestionChoicesResp.json();
      QuestionBlocksData = await QuestionBlocksResp.json();
      QuestionAnswerData = await QuestionAnswersResp.json();
      ServicepointData = await ServicepointResp.json();
      if (QuestionAnswerData.length !== 0) {
        const logId =
          (await QuestionAnswerData.sort((a: any, b: any) => {
            return b.log_id - a.log_id;
          })[0].log_id) ?? -1;

        if (logId && logId >= 0) {
          const AddInfoComments = await fetch(
            `${API_FETCH_QUESTION_ANSWER_COMMENTS}?log=${logId}`
          );

          const AddInfoLocations = await fetch(
            `${API_FETCH_QUESTION_ANSWER_LOCATIONS}?log=${logId}`
          );

          const AddInfoPhotos = await fetch(
            `${API_FETCH_QUESTION_ANSWER_PHOTOS}?log=${logId}`
          );

          const AddInfoPhotoTexts = await fetch(
            `${API_FETCH_QUESTION_ANSWER_PHOTO_TEXTS}?log=${logId}`
          );

          AddInfoCommentsData = await AddInfoComments.json();
          AddInfoLocationsData = await AddInfoLocations.json();
          AddInfoPhotosData = await AddInfoPhotos.json();
          AddInfoPhotoTextsData = await AddInfoPhotoTexts.json();

          AdditionalInfosData = {
            comments: AddInfoCommentsData,
            locations: AddInfoLocationsData,
            photos: AddInfoPhotosData,
            phototexts: AddInfoPhotoTextsData,
          };
        }
      }
    } catch (e) {
      QuestionsData = {};
      QuestionChoicesData = {};
      QuestionBlocksData = {};
      QuestionAnswerData = {};
      EntranceData = {};
      ServicepointData = {};
      AdditionalInfosData = {};
    }
  }
  return {
    props: {
      form_id,
      QuestionsData,
      QuestionChoicesData,
      QuestionBlocksData,
      QuestionAnswerData,
      ServicepointData,
      AdditionalInfosData,
      entrance_id,
      lngDict,
    },
  };
};

export default AccessibilityEdit;
