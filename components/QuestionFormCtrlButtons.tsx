import React from "react";
import { IconArrowRight, IconArrowLeft, Card } from "hds-react";
import router from "next/router";
import { useI18n } from "next-localization";
import publicIp from "public-ip";
import Button from "./QuestionButton";
import { QuestionFormCtrlButtonsProps } from "../types/general";
import styles from "./QuestionFormCtrlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import {
  API_FETCH_ANSWER_LOGS,
  API_FETCH_QUESTION_ANSWERS,
  API_FETCH_SERVICEPOINTS,
  FRONT_URL_BASE,
} from "../types/constants";
import {
  setFormFinished,
  setInvalid,
  unsetFormFinished,
  unsetInvalid,
} from "../state/reducers/formSlice";
import {
  getCurrentDate,
  postData,
  postAdditionalInfo,
} from "../utils/utilFunctions";

export const getClientIp = async () =>
  publicIp.v4({
    fallbackUrls: ["https://ifconfig.co/ip"],
  });

// usage: Form control buttons: return, save / draft, preview, validate
const QuestionFormCtrlButtons = ({
  hasCancelButton,
  hasValidateButton,
  hasSaveDraftButton,
  hasPreviewButton,
  visibleBlocks,
  visibleQuestionChoices,
}: QuestionFormCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const curAnsweredChoices = useAppSelector(
    (state) => state.formReducer.answeredChoices
  );
  const curServicepointId = useAppSelector(
    (state) => state.formReducer.currentServicepointId
  );
  const startedAnswering = useAppSelector(
    (state) => state.formReducer.startedAnswering
  );
  const curEntranceId = useAppSelector(
    (state) => state.formReducer.currentEntranceId
  );
  const finishedBlocks = useAppSelector(
    (state) => state.formReducer.finishedBlocks
  );
  const isContinueClicked = useAppSelector(
    (state) => state.formReducer.isContinueClicked
  );
  const additionalInfo = useAppSelector((state) => state.additionalInfoReducer);
  const contacts = useAppSelector((state) => state.formReducer.contacts);

  const handleCancel = (): void => {
    // TODO: Add errorpage
    const url =
      curServicepointId === -1
        ? FRONT_URL_BASE
        : `${FRONT_URL_BASE + i18n.locale()}/details/${curServicepointId}`;
    window.location.href = url;
  };
  const isPreviewActive = curAnsweredChoices.length > 1;

  const updateAccessibilityContacts = async (contacts: any) => {
    const updateContactsOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessibility_phone: contacts.phoneNumber[1]
          ? contacts.phoneNumber[0]
          : null,
        accessibility_email: contacts.email[1] ? contacts.email[0] : null,
        accessibility_www: contacts.www[1] ? contacts.www[0] : null,
        modified_by: "placeholder",
        // TODO: Add user here
        modified: getCurrentDate(),
      }),
    };
    const updateContactsUrl = `${API_FETCH_SERVICEPOINTS}${curServicepointId}/update_accessibility_contacts/`;

    await fetch(updateContactsUrl, updateContactsOptions)
      .then((response) => response.json())
      .then((data) => {});
  };

  // TODO: MAKE INTO SMALLER FUNCTIONS
  const saveDraft = async () => {
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
        form_cancelled: "N",
        // TODO: GET CURRENT USER HERE
        accessibility_editor: "Leba",
        entrance: curEntranceId,
      }),
    };

    updateAccessibilityContacts(contacts);
    // POST TO AR_X_ANSWER_LOG. RETURNS NEW LOG_ID USED FOR OTHER POST REQUESTS
    await fetch(API_FETCH_ANSWER_LOGS, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        logId = data;
      });

    // CHECK IF RETURNED LOG_ID IS A NUMBER. IF NOT A NUMBER STOP EXECUTING
    if (!isNaN(logId)) {
      // POST ALL QUESTION ANSWERS
      const filteredAnswerChoices = curAnsweredChoices.filter((choice) => {
        if (
          visibleQuestionChoices
            ?.map((elem) => {
              return elem.question_choice_id;
            })
            .includes(Number(choice))
        )
          return choice;
      });
      const questionAnswerData = { log: logId, data: filteredAnswerChoices };
      await postData(API_FETCH_QUESTION_ANSWERS, questionAnswerData);
      // GENERATE SENTENCES
      const parsedAdditionalInfos = Object.keys(additionalInfo).map((key) => {
        if (!isNaN(Number(key))) return [key, additionalInfo[key]];
      });
      if (parsedAdditionalInfos !== undefined) {
        await postAdditionalInfo(logId, parsedAdditionalInfos);
      }
      const generateData = { entrance_id: curEntranceId, form_submitted: "D" };
      await postData(
        "http://localhost:8000/api/GenerateSentences/",
        generateData
      );
    } else {
      return -1;
    }
  };

  const handleSaveDraftClick = () => {
    saveDraft();
  };

  const validateForm = () => {
    // VALIDATE BLOCKS
    visibleBlocks?.forEach((elem) => {
      if (elem !== null) {
        if (!finishedBlocks.includes(Number(elem?.key?.toString()))) {
          dispatch(setInvalid(Number(elem?.key?.toString())));
          dispatch(unsetFormFinished());
        } else {
          dispatch(unsetInvalid(Number(elem?.key?.toString())));
        }
      }
    });
  };

  const invalidBlocks = useAppSelector(
    (state) => state.formReducer.invalidBlocks
  );

  if (invalidBlocks.length === 0) {
    dispatch(setFormFinished());
  } else {
    dispatch(unsetFormFinished());
  }

  const handleValidateClick = () => {
    validateForm();
  };

  const handlePreviewClick = async () => {
    validateForm();
    await saveDraft();
    // TODO: TÄSSÄ KOHTAA MAHDOLLISESTI PITÄÄ POSTATA TIEDOT APIIN/KANTAAN, ETTÄ PREVIEW SIVULLE
    // SAADAAN NÄKYMÄÄN JUURI TÄYTETYT TIEDOT.
    router.push(`/preview/${curServicepointId}`);
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
            disabled={!isPreviewActive || !isContinueClicked}
            onClickHandler={handlePreviewClick}
          >
            {i18n.t("questionFormControlButtons.preview")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
export default QuestionFormCtrlButtons;
