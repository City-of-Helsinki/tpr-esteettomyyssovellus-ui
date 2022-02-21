import React from "react";
import { IconArrowRight, IconArrowLeft } from "hds-react";
import router from "next/router";
import { useI18n } from "next-localization";
import Button from "./QuestionButton";
import { Entrance } from "../types/backendModels";
import { QuestionFormCtrlButtonsProps } from "../types/general";
import styles from "./QuestionFormCtrlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import {
  API_FETCH_ANSWER_LOGS,
  API_FETCH_ENTRANCES,
  API_FETCH_QUESTION_ANSWERS,
  API_FETCH_QUESTION_BLOCK_ANSWER_FIELD,
  API_URL_BASE,
  FRONT_URL_BASE,
} from "../types/constants";
import { setEntranceId, setFormFinished, setInvalid, unsetFormFinished, unsetInvalid } from "../state/reducers/formSlice";
import { getCurrentDate, postData, getClientIp } from "../utils/utilFunctions";

// usage: Form control buttons: return, save / draft, preview, validate
const QuestionFormCtrlButtons = ({
  hasCancelButton,
  hasValidateButton,
  hasSaveDraftButton,
  hasPreviewButton,
  visibleBlocks,
  visibleQuestionChoices,
  formId,
}: QuestionFormCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curExtraAnswers = useAppSelector((state) => state.formReducer.extraAnswers);
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const finishedBlocks = useAppSelector((state) => state.formReducer.finishedBlocks);
  // const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  // const additionalInfo = useAppSelector((state) => state.additionalInfoReducer);

  const handleCancel = (): void => {
    // TODO: Add errorpage
    const url = curServicepointId === -1 ? FRONT_URL_BASE : `${FRONT_URL_BASE + i18n.locale()}/details/${curServicepointId}`;
    window.location.href = url;
  };
  // const isPreviewActive = curAnsweredChoices.length > 1;

  const updateExtraFieldAnswers = async (logId: number) => {
    Object.keys(curExtraAnswers).forEach((questionBlockFieldIdStr) => {
      const questionBlockFieldId = Number(questionBlockFieldIdStr);
      const extraAnswer = curExtraAnswers[questionBlockFieldId];

      postData(
        API_FETCH_QUESTION_BLOCK_ANSWER_FIELD,
        JSON.stringify({
          log_id: logId,
          question_block_field_id: questionBlockFieldId,
          entry: extraAnswer,
        })
      );
    });
  };

  // TODO: MAKE INTO SMALLER FUNCTIONS
  const saveDraft = async (): Promise<void> => {
    // DATE FOR FINISHED ANSWERING
    const finishedAnswering = getCurrentDate();

    // THIS RETURNS THE IP ADDRESS OF THE CLIENT USED IN THE ANSWER LOG
    const ipAddress = await getClientIp();

    let entranceId = curEntranceId;
    if (!entranceId || entranceId < 0) {
      // Create an empty entrance row in the database in order to get the entrance id
      const entranceRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          created: new Date(),
          created_by: "test", // TODO - user
          modified: new Date(),
          modified_by: "test", // TODO - user
          is_main_entrance: formId === 0 ? "Y" : "N",
          servicepoint: curServicepointId,
          form: formId,
        }),
      };
      const newEntranceResponse = await fetch(API_FETCH_ENTRANCES, entranceRequestOptions);
      const newEntrance = await (newEntranceResponse.json() as Promise<Entrance>);

      entranceId = newEntrance.entrance_id;
      dispatch(setEntranceId(newEntrance.entrance_id));
    }

    if (entranceId > 0) {
      // POST ANSWER LOG
      // TODO: ERRORCHECK VALUES
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip_address: ipAddress,
          started_answering: startedAnswering,
          finished_answering: finishedAnswering,
          // BECAUSE THIS IS A DRAFT
          form_submitted: "D",
          form_cancelled: "N",
          // TODO: GET CURRENT USER HERE
          accessibility_editor: "Leba",
          entrance: entranceId,
        }),
      };

      // POST TO AR_X_ANSWER_LOG. RETURNS NEW LOG_ID USED FOR OTHER POST REQUESTS
      const response = await fetch(API_FETCH_ANSWER_LOGS, requestOptions);
      const logId = await (response.json() as Promise<number>);

      // CHECK IF RETURNED LOG_ID IS A NUMBER. IF NOT A NUMBER STOP EXECUTING
      if (!!logId && logId > 0) {
        // POST ALL QUESTION ANSWERS
        const filteredAnswerChoices = curAnsweredChoices.filter((choice) => {
          return visibleQuestionChoices
            ?.map((elem) => {
              return elem.question_choice_id;
            })
            .includes(Number(choice));
        });
        const questionAnswerData = { log: logId, data: filteredAnswerChoices };
        postData(API_FETCH_QUESTION_ANSWERS, JSON.stringify(questionAnswerData));
        // await postAdditionalInfo(logId, additionalInfo.additionalInfo);

        updateExtraFieldAnswers(logId);

        // GENERATE SENTENCES
        const generateData = { entrance_id: curEntranceId, form_submitted: "D" };
        postData(`${API_URL_BASE}GenerateSentences/`, JSON.stringify(generateData));
      }
    }
  };

  const handleSaveDraftClick = () => {
    saveDraft();
  };

  const validateForm = () => {
    // VALIDATE BLOCKS
    const validBlocks = visibleBlocks?.map((elem) => {
      if (elem !== null) {
        if (!finishedBlocks.includes(Number(elem?.key?.toString()))) {
          dispatch(setInvalid(Number(elem?.key?.toString())));
          dispatch(unsetFormFinished());
          return false;
        } else {
          dispatch(unsetInvalid(Number(elem?.key?.toString())));
          return true;
        }
      }
      return true;
    });
    return validBlocks?.every((b) => b) || false;
  };

  const invalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);

  if (invalidBlocks.length === 0) {
    dispatch(setFormFinished());
  } else {
    dispatch(unsetFormFinished());
  }

  const handleValidateClick = () => {
    validateForm();
  };

  const handlePreviewClick = async () => {
    if (validateForm()) {
      await saveDraft();
      // TODO: TÄSSÄ KOHTAA MAHDOLLISESTI PITÄÄ POSTATA TIEDOT APIIN/KANTAAN, ETTÄ PREVIEW SIVULLE
      // SAADAAN NÄKYMÄÄN JUURI TÄYTETYT TIEDOT.
      router.push(`/preview/${curServicepointId}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        {hasCancelButton ? (
          <Button variant="secondary" iconLeft={<IconArrowLeft />} onClickHandler={handleCancel}>
            {i18n.t("questionFormControlButtons.quit")}
          </Button>
        ) : null}
      </div>
      <div className={styles.right}>
        {hasValidateButton ? (
          <Button variant="secondary" onClickHandler={handleValidateClick}>
            {i18n.t("questionFormControlButtons.verifyInformation")}
          </Button>
        ) : null}
        {
          // TODO: THIS SAVE DRAFT BUTTON SHOULD ONLY EXIST IF THE SERVICEPOINT HAS NO
          // FINISHED FORM ENTRIES
          // IT SHOULD ALSO ONLY EXIST IF FORM_ID IS 0 OR 1
        }
        {hasSaveDraftButton ? (
          <Button variant="secondary" onClickHandler={handleSaveDraftClick}>
            {i18n.t("questionFormControlButtons.saveAsIncomplete")}
          </Button>
        ) : null}
        {hasPreviewButton ? (
          <Button
            variant="primary"
            iconRight={<IconArrowRight />}
            // disabled={!isPreviewActive || !isContinueClicked}
            onClickHandler={handlePreviewClick}
          >
            {i18n.t("questionFormControlButtons.preview")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
export default QuestionFormCtrlButtons;
