import React from "react";
import { IconArrowLeft, Card, Notification } from "hds-react";
import Button from "./QuestionButton";
import styles from "./PreviewControlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import router from "next/router";
import { useI18n } from "next-localization";
import {
  API_FETCH_ANSWER_LOGS,
  API_FETCH_QUESTION_ANSWERS,
  FRONT_URL_BASE
} from "../types/constants";
import { setContinue } from "../state/reducers/formSlice";
import { getCurrentDate } from "../utils/utilFunctions";
import {
  postData,
  getClientIp,
  postAdditionalInfo
} from "../utils/utilFunctions";

const PreviewControlButtons = ({ hasHeader }: any): JSX.Element => {
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
  const formFinished = useAppSelector(
    (state) => state.formReducer.formFinished
  );
  const additionalInfo = useAppSelector((state) => state.additionalInfoReducer);
  const handelContinueEditing = (): void => {
    console.log("cancel clicked");
    dispatch(setContinue());
    // TODO: Add errorpage
    const url =
      curServicepointId == ""
        ? FRONT_URL_BASE
        : `${FRONT_URL_BASE}accessibilityEdit/${curEntranceId}`;
    router.push(url);
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
      const parsedAdditionalInfos = Object.keys(additionalInfo).map((key) => {
        if (!isNaN(Number(key))) return [key, additionalInfo[key]];
      });
      if (parsedAdditionalInfos != undefined) {
        postAdditionalInfo(logId, parsedAdditionalInfos);
      }
      window.location.href = FRONT_URL_BASE;
    } else {
      console.log("log_id was not number");
      return -1;
    }

    // TODO: POST ALL ADDITIONAL INFO

    // TODO: CREATE SENTENCES WITH FUNCTION CALL
    console.log("Posted to database new log entry with log_id=", logId);
  };

  const handleSaveAndSend = () => {
    console.log("Save and send clicked");
  };

  return (
    <Card className={styles.container}>
      {hasHeader ? (
        <div className={styles.previewButtonHeader}>
          <h2>{i18n.t("PreviewPage.previewAccessibilityInformation")}</h2>
          {formFinished ? (
            <Notification label="Form done" type="success">
              PH: Form filled correctly
            </Notification>
          ) : (
            <Notification label="Missing information" type="error">
              {i18n.t("PreviewPage.errorNotice")}
            </Notification>
          )}
        </div>
      ) : (
        ""
      )}

      <div className={styles.previewControlButtons}>
        <Button
          variant="primary"
          iconLeft={<IconArrowLeft />}
          onClickHandler={handelContinueEditing}
        >
          {i18n.t("PreviewPage.continueEditing")}
        </Button>
        <Button variant="secondary" onClickHandler={handleSaveDraftClick}>
          {i18n.t("questionFormControlButtons.saveAsIncomplete")}
        </Button>
        <Button
          variant="primary"
          disabled={!formFinished}
          onClickHandler={handleSaveAndSend}
        >
          {i18n.t("PreviewPage.saveAndSend")}
        </Button>
      </div>
    </Card>
  );
};

export default PreviewControlButtons;
