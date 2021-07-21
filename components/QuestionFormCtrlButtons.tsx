import React from "react";
import { IconArrowRight, IconArrowLeft, Card } from "hds-react";
import Button from "./QuestionButton";
import { QuestionFormCtrlButtonsProps } from "../types/general";
import styles from "./QuestionFormCtrlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import router from "next/router";
import { useI18n } from "next-localization";
import publicIp from "public-ip";
import { API_URL_BASE, FRONT_URL_BASE } from "../types/constants";

export const getClientIp = async () =>
  await publicIp.v4({
    fallbackUrls: ["https://ifconfig.co/ip"]
  });

const QuestionFormCtrlButtons = ({
  hasCancelButton,
  hasValidateButton,
  hasSaveDraftButton,
  hasPreviewButton
}: QuestionFormCtrlButtonsProps): JSX.Element => {
  // TODO: save button might need own component of Button
  // also preview view should probably also have own component/buttons

  // testing click handle, edit with real logic later
  // also add handlers for all buttons respectively
  const i18n = useI18n();

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

  const handleCancel = (): void => {
    console.log("cancel clicked");
    // TODO: Add errorpage
    const url =
      curServicepointId == ""
        ? FRONT_URL_BASE
        : FRONT_URL_BASE + "servicepoint/" + curServicepointId;
    router.push(url);
  };
  const isPreviewActive = curAnsweredChoices.length > 1;

  const postData = async (url: string, data: {}) => {
    let postAnswerOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
    console.log(data);
    //console.log(postAnswerOptions);
    return fetch(url, postAnswerOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };
  // console.log(curAnsweredChoices);

  // TODO: MAKE INTO SMALLER FUNCTIONS
  const handleSaveDraftClick = async () => {
    console.log("save clicked");
    let logId: any;

    // DATE FOR FINISHED ANSWERING
    let today = new Date();
    const finishedAnswering =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate() +
      "T" +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds();

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
    await fetch(API_URL_BASE + "ArXAnswerLog/", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        logId = data;
      });

    // CHECK IF RETURNED LOG_ID IS A NUMBER. IF NOT A NUMBER STOP EXECUTING
    if (!isNaN(logId)) {
      console.log(logId);
      // POST ALL QUESTION ANSWERS
      const data = { log: logId, data: curAnsweredChoices };
      postData(API_URL_BASE + "ArXQuestionAnswer/", data);
    } else {
      console.log("log_id was not number");
      return -1;
    }

    // TODO: POST ALL ADDITIONAL INFO

    // TODO: CREATE SENTENCES WITH FUNCTION CALL
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
          <Button variant="secondary">
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
