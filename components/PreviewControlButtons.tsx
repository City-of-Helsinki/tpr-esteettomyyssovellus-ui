import React from "react";
import { IconArrowLeft, Card, Notification } from "hds-react";
import router from "next/router";
import { useI18n } from "next-localization";
import Button from "./QuestionButton";
import styles from "./PreviewControlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { API_FETCH_ANSWER_LOGS, API_FETCH_QUESTION_ANSWERS, FRONT_URL_BASE } from "../types/constants";
import { setContinue } from "../state/reducers/formSlice";
import { getCurrentDate, postData, getClientIp, postAdditionalInfo } from "../utils/utilFunctions";
import AddNewEntranceNotice from "./common/AddNewEntranceNotice";
import { PreviewControlButtonsProps } from "../types/general";

// usage: controls for preview page
const PreviewControlButtons = ({ hasHeader }: PreviewControlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const formFinished = useAppSelector((state) => state.formReducer.formFinished);
  const formSubmitted = useAppSelector((state) => state.formReducer.formSubmitted);
  const additionalInfo = useAppSelector((state) => state.additionalInfoReducer);
  const handelContinueEditing = (): void => {
    dispatch(setContinue());
    // TODO: Add errorpage
    const url = curServicepointId === -1 ? FRONT_URL_BASE : `${FRONT_URL_BASE}accessibilityEdit/${curEntranceId}`;
    router.push(url);
  };

  // TODO: MAKE INTO SMALLER FUNCTIONS
  const handleSaveDraftClick = async (): Promise<void> => {
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
        entrance: curEntranceId,
      }),
    };

    // POST TO AR_X_ANSWER_LOG. RETURNS NEW LOG_ID USED FOR OTHER POST REQUESTS
    const response = await fetch(API_FETCH_ANSWER_LOGS, requestOptions);
    const logId = await (response.json() as Promise<number>);

    // CHECK IF RETURNED LOG_ID IS A NUMBER. IF NOT A NUMBER STOP EXECUTING
    if (!Number.isNaN(logId)) {
      // POST ALL QUESTION ANSWERS
      const data = { log: logId, data: curAnsweredChoices };
      postData(API_FETCH_QUESTION_ANSWERS, JSON.stringify(data));
      await postAdditionalInfo(logId, additionalInfo.additionalInfo);
      const generateData = { entrance_id: curEntranceId };
      // todo: change static localhost to const
      postData("http://localhost:8000/api/GenerateSentences/", JSON.stringify(generateData));
      window.location.href = FRONT_URL_BASE;
    }

    // TODO: POST ALL ADDITIONAL INFO
    // TODO: CREATE SENTENCES WITH FUNCTION CALL
  };

  // todo: todo
  const handleSaveAndSend = () => {
    return true;
  };

  return (
    <Card className={styles.container}>
      {hasHeader ? (
        <div className={styles.previewButtonHeader}>
          <h2>{i18n.t("PreviewPage.previewAccessibilityInformation")}</h2>
          {formFinished ? (
            <>
              <Notification label="Form done" type="success">
                {i18n.t("common.formFilledCorrectly")}
              </Notification>
              {/* todo: check that this functionality/workflow is correct */}
            </>
          ) : (
            <>
              <Notification label="Missing information" type="error">
                {i18n.t("PreviewPage.errorNotice")}
              </Notification>
              <AddNewEntranceNotice />
            </>
          )}
        </div>
      ) : (
        ""
      )}

      <div className={styles.previewControlButtons}>
        <Button variant="primary" iconLeft={<IconArrowLeft />} onClickHandler={handelContinueEditing}>
          {i18n.t("PreviewPage.continueEditing")}
        </Button>
        {formSubmitted ? null : (
          <Button variant="secondary" onClickHandler={handleSaveDraftClick}>
            {i18n.t("questionFormControlButtons.saveAsIncomplete")}
          </Button>
        )}
        <Button variant="primary" disabled={!formFinished} onClickHandler={handleSaveAndSend}>
          {i18n.t("PreviewPage.saveAndSend")}
        </Button>
      </div>
    </Card>
  );
};

export default PreviewControlButtons;
