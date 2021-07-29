import React from "react";
import { IconArrowRight, IconArrowLeft, Card } from "hds-react";
import Button from "./QuestionButton";
import { QuestionFormCtrlButtonsProps } from "../types/general";
import styles from "./QuestionFormCtrlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import router from "next/router";
import { useI18n } from "next-localization";
import publicIp from "public-ip";
import {
  API_FETCH_ANSWER_LOGS,
  API_FETCH_QUESTION_ANSWERS,
  FRONT_URL_BASE
} from "../types/constants";
import {
  changeEmailStatus,
  changePhoneNumberStatus,
  setFinished,
  setInvalid,
  unsetFinished,
  unsetInvalid,
  changeContactPersonStatus
} from "../state/reducers/formSlice";
import { getCurrentDate } from "../utils/utilFunctions";

export const getClientIp = async () =>
  await publicIp.v4({
    fallbackUrls: ["https://ifconfig.co/ip"]
  });

const QuestionFormCtrlButtons = ({
  hasCancelButton,
  hasValidateButton,
  hasSaveDraftButton,
  hasPreviewButton,
  visibleBlocks
}: QuestionFormCtrlButtonsProps): JSX.Element => {
  // TODO: save button might need own component of Button
  // also preview view should probably also have own component/buttons

  // testing click handle, edit with real logic later
  // also add handlers for all buttons respectively
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  let curAnsweredChoices = useAppSelector(
    (state) => state.formReducer.answeredChoices
  );
  let curServicepointId = useAppSelector(
    (state) => state.formReducer.currentServicepointId
  );
  const startedAnswering = useAppSelector(
    (state) => state.formReducer.startedAnswering
  );
  const curEntranceId = useAppSelector(
    (state) => state.formReducer.currentEntranceId
  );
  const contacts = useAppSelector((state) => state.formReducer.contacts);
  const finishedBlocks = useAppSelector(
    (state) => state.formReducer.finishedBlocks
  );

  const handleCancel = (): void => {
    console.log("cancel clicked");
    // TODO: Add errorpage
    const url =
      curServicepointId == ""
        ? FRONT_URL_BASE
        : FRONT_URL_BASE + "details/" + curServicepointId;
    router.push(url);
  };
  const isPreviewActive = curAnsweredChoices.length > 1;

  const postData = async (url: string, data: {}) => {
    let postAnswerOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    return fetch(url, postAnswerOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  // TODO: MAKE INTO SMALLER FUNCTIONS
  const handleSaveDraftClick = async () => {
    console.log("save clicked");
    let logId: any;

    // DATE FOR FINISHED ANSWERING
    const finishedAnswering = getCurrentDate();

    // THIS RETURNS THE IP ADDRESS OF THE CLIENT USED IN THE ANSWER LOG
    const ipAddress = await getClientIp();

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
        form_cancelled: "Y",
        // TODO: GET CURRENT USER HERE
        accessibility_editor: "Leba",
        entrance: curEntranceId
      })
    };

    // POST TO AR_X_ANSWER_LOG. RETURNS NEW LOG_ID USED FOR OTHER POST REQUESTS
    await fetch(API_FETCH_ANSWER_LOGS, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        logId = data;
      });

    // CHECK IF RETURNED LOG_ID IS A NUMBER. IF NOT A NUMBER STOP EXECUTING
    if (!isNaN(logId)) {
      // POST ALL QUESTION ANSWERS
      const data = { log: logId, data: curAnsweredChoices };
      postData(API_FETCH_QUESTION_ANSWERS, data);
    } else {
      console.log("log_id was not number");
      return -1;
    }

    // TODO: POST ALL ADDITIONAL INFO

    // TODO: CREATE SENTENCES WITH FUNCTION CALL
    console.log("Posted to database new log entry with log_id=", logId);
  };

  const validateForm = () => {
    console.log("Started validating.");

    // VALIDATE BLOCKS
    visibleBlocks?.forEach((elem) => {
      if (elem != null) {
        if (!finishedBlocks.includes(Number(elem?.key?.toString()))) {
          dispatch(setInvalid(Number(elem?.key?.toString())));
        } else {
          dispatch(unsetInvalid(Number(elem?.key?.toString())));
        }
      }
    });
  };

  const handleValidateClick = () => {
    console.log("Validate clicked");
    validateForm();
  };

  return (
    <Card className={styles.container}>
      <div className={styles.left}>
        {hasCancelButton ? (
          <Button
            variant="secondary"
            iconLeft={<IconArrowLeft />}
            onClickHandler={handleCancel}
          >
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
            disabled={!isPreviewActive}
          >
            {i18n.t("questionFormControlButtons.preview")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
export default QuestionFormCtrlButtons;
