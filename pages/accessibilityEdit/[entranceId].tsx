import React, { ReactElement, useState } from "react";
import { useI18n } from "next-localization";
import Head from "next/head";
import { GetServerSideProps } from "next";
import Layout from "../../components/common/Layout";
import { store } from "../../state/store";
import i18nLoader from "../../utils/i18n";
import QuestionInfo from "../../components/QuestionInfo";
import styles from "./accessibilityEdit.module.scss";
import { StatusLabel, IconCrossCircle, IconQuestionCircle } from "hds-react";
import ServicepointMainInfoContent from "../../components/ServicepointMainInfoContent";
import {
  API_FETCH_QUESTIONBLOCK_URL,
  API_FETCH_QUESTIONCHOICES,
  API_FETCH_QUESTION_URL,
  backendApiBaseUrl,
  API_URL_BASE,
} from "../../types/constants";
import { useAppSelector, useAppDispatch } from "../../state/hooks";
import QuestionBlock from "../../components/QuestionBlock";
import {
  AddInfoPhoto,
  AddInfoPhotoText,
  MainEntranceFormProps,
  QuestionBlockProps,
} from "../../types/general";
import HeadlineQuestionContainer from "../../components/HeadlineQuestionContainer";
import { LANGUAGE_LOCALES } from "../../types/constants";
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
} from "../../state/reducers/formSlice";
import ContactInformationQuestionContainer from "../../components/ContactInformationQuestionContainer";
import {
  addComment,
  addComponent,
  addLocation,
  addPicture,
  setAlt,
  setInitAdditionalInfoFromDb,
} from "../../state/reducers/additionalInfoSlice";
const AccessibilityEdit = ({
  QuestionsData,
  QuestionChoicesData,
  QuestionBlocksData,
  QuestionAnswerData,
  ServicepointData,
  AdditionalInfosData,
}: MainEntranceFormProps): ReactElement => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const dispatch = useAppDispatch();
  // @ts-ignore: TODO:
  const curLocaleId: number = LANGUAGE_LOCALES[curLocale];

  let curAnsweredChoices = useAppSelector(
    (state) => state.formReducer.answeredChoices
  );
  let curInvalidBlocks = useAppSelector(
    (state) => state.formReducer.invalidBlocks
  );
  let formInited = useAppSelector((state) => state.formReducer.formInited);

  if (ServicepointData != undefined && !formInited) {
    const phoneNumber = ServicepointData["accessibility_phone"];
    const email = ServicepointData["accessibility_email"];

    // REGEXES FOR VALIDATING
    var phonePattern = new RegExp(/^[^a-zA-Z]+$/);
    var emailPattern = new RegExp(
      /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
    );
    dispatch(setPhoneNumber(phoneNumber));
    dispatch(setEmail(email));
    dispatch(setServicepointId(ServicepointData["servicepoint_id"]));

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

  const additionalInfoInitedFromDb = useAppSelector(
    (state) => state.additionalInfoReducer.initAddInfoFromDb
  );

  // loop additional info to state, only once if data found
  if (AdditionalInfosData && !additionalInfoInitedFromDb) {
    dispatch(setInitAdditionalInfoFromDb({ isInited: true }));
    if (AdditionalInfosData.comments) {
      AdditionalInfosData.comments.forEach((comment, ind) => {
        const curLangStr = LANGUAGE_LOCALES[comment.language];
        dispatch(
          addComment({
            questionId: comment.question,
            language: curLangStr,
            value: comment.comment,
          })
        );
        // little hacky, only add component for the 1st language => fi for not adding 3 components if all languages
        if (comment.language === 1 && ind === 0) {
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

  if (Object.keys(QuestionAnswerData).length !== 0) {
    let curAnswers = useAppSelector((state) => state.formReducer.answers);
    QuestionAnswerData.map((a: any) => {
      const questionNumber = a.question_id;
      const answer = a.question_choice_id;
      const answerString = answer;
      if (
        !curAnsweredChoices.includes(answer) &&
        curAnswers[questionNumber] == undefined
      ) {
        dispatch(setAnsweredChoice(answerString));
        dispatch(setAnswer({ questionNumber, answer }));
      }
    });
  }

  if (typeof window !== "undefined") {
    window.onbeforeunload = (event: BeforeUnloadEvent) => {
      const e = event || window.event;
      // Cancel the event
      e.preventDefault();
      if (e) {
        e.returnValue = ""; // Legacy method for cross browser support
      }
      return ""; // Legacy method for cross browser support
    };
  }

  let isContinueClicked = useAppSelector(
    (state) => state.formReducer.isContinueClicked
  );
  // let curAnswers = useAppSelector(
  //   (state) => state.formReducer.answeredChoices
  // );
  //console.log(curAnsweredChoices);

  // let curFinishedBlocks = useAppSelector((state) => state.formReducer.finishedBlocks);
  let nextBlock = 0;
  let lastBlockNumber = "";
  let visibleBlocks =
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
            (block.visible_if_question_choice == null &&
              block.language_id == curLocaleId) ||
            (answersIncludeAllVisibleQuestions &&
              block.language_id == curLocaleId &&
              isContinueClicked);

          const blockQuestions = isVisible
            ? QuestionsData.filter(
                (question) =>
                  question.question_block_id === block.question_block_id &&
                  question.language_id == curLocaleId
              )
            : null;

          const answerChoices = isVisible
            ? QuestionChoicesData.filter(
                (choice) =>
                  choice.question_block_id === block.question_block_id &&
                  choice.language_id == curLocaleId
              )
            : null;

          if (
            isVisible &&
            blockQuestions &&
            answerChoices &&
            block.question_block_code != undefined
          )
            lastBlockNumber = block.question_block_code;

          return isVisible &&
            blockQuestions &&
            answerChoices &&
            block.question_block_id != undefined ? (
            <HeadlineQuestionContainer
              key={block.question_block_id}
              number={block.question_block_id}
              text={block.question_block_code + " " + block.text}
              initOpen={block.question_block_id == nextBlock}
              isValid={!curInvalidBlocks.includes(block.question_block_id)}
            >
              <QuestionBlock
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

  if (isContinueClicked) {
    visibleBlocks?.push(
      <HeadlineQuestionContainer
        key={99}
        number={99}
        text={i18n.t("ContactInformation.contactInformation")}
        initOpen={false}
        isValid={!curInvalidBlocks.includes(99)}
      >
        <ContactInformationQuestionContainer
          blockNumber={Number(lastBlockNumber) + 1}
        />{" "}
      </HeadlineQuestionContainer>
    );
  }

  const treeItems = [
    ServicepointData["servicepoint_name"],
    "Esteettömyystiedot",
  ];

  return (
    <Layout>
      <Head>
        <title>{i18n.t("notification.title")}</title>
      </Head>
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
            <h1>{ServicepointData["servicepoint_name"]}</h1>
            <h2>{i18n.t("common.mainEntrance")}</h2>
          </div>
          <div>
            {visibleBlocks}
            <QuestionFormCtrlButtons
              hasCancelButton
              hasValidateButton={isContinueClicked}
              hasSaveDraftButton
              hasPreviewButton
              visibleBlocks={visibleBlocks}
            />
          </div>
        </div>
      </main>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  locales,
}) => {
  const lngDict = await i18nLoader(locales);

  const reduxStore = store;
  // reduxStore.dispatch({ type: CLEAR_STATE });
  const initialReduxState = reduxStore.getState();

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
  if (params != undefined) {
    try {
      const entrance_id = params.entranceId;

      // todo: put urls in types/constants and get form_id from props
      const QuestionsResp = await fetch(API_FETCH_QUESTION_URL);
      const QuestionChoicesResp = await fetch(API_FETCH_QUESTIONCHOICES);
      const QuestionBlocksResp = await fetch(API_FETCH_QUESTIONBLOCK_URL);
      const QuestionAnswersResp = await fetch(
        `${backendApiBaseUrl}/ArBackendEntranceAnswer/?entrance_id=${entrance_id}&format=json`
      );
      const EntranceResp = await fetch(
        API_URL_BASE + `ArEntrances/${entrance_id}/?format=json`
      );
      EntranceData = await EntranceResp.json();
      const servicepoint_id = EntranceData["servicepoint"];
      const ServicepointResp = await fetch(
        API_URL_BASE + `ArServicepoints/${servicepoint_id}/?format=json`
      );
      QuestionsData = await QuestionsResp.json();
      QuestionChoicesData = await QuestionChoicesResp.json();
      QuestionBlocksData = await QuestionBlocksResp.json();
      QuestionAnswerData = await QuestionAnswersResp.json();
      ServicepointData = await ServicepointResp.json();
      if (QuestionAnswerData.length != 0) {
        const logId = (await QuestionAnswerData[0].log_id) ?? -1;
        if (logId && logId >= 0) {
          const AddInfoComments = await fetch(
            `${backendApiBaseUrl}/ArXQuesitonAnswerComment/?log=${logId}`
          );

          const AddInfoLocations = await fetch(
            `${backendApiBaseUrl}/ArXQuesitonAnswerLocation/?log=${logId}`
          );

          const AddInfoPhotos = await fetch(
            `${backendApiBaseUrl}/ArXQuesitonAnswerPhoto/?log=${logId}`
          );

          const AddInfoPhotoTexts = await fetch(
            `${backendApiBaseUrl}/ArXQuesitonAnswerPhotoTxt/?log=${logId}`
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
      console.log(e);
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
      initialReduxState,
      QuestionsData: QuestionsData,
      QuestionChoicesData: QuestionChoicesData,
      QuestionBlocksData: QuestionBlocksData,
      QuestionAnswerData: QuestionAnswerData,
      ServicepointData: ServicepointData,
      AdditionalInfosData: AdditionalInfosData,
      lngDict,
    },
  };
};

export default AccessibilityEdit;
