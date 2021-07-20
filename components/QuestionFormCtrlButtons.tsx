import React from "react";
import { IconArrowRight, IconArrowLeft, Card } from "hds-react";
import Button from "./QuestionButton";
import { QuestionFormCtrlButtonsProps } from "../types/general";
import styles from "./QuestionFormCtrlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import router from "next/router";
import { useI18n } from "next-localization";

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
  const handleCancel = (): void => {
    console.log("cancel clicked");
    // TODO: Add errorpage
    const url =
      curServicepointId == ""
        ? "http://localhost:3000/"
        : "http://localhost:3000/servicepoint/" + curServicepointId;
    router.push(url);
  };
  const isPreviewActive = curAnsweredChoices.length > 1;
  const handleSaveClick = async () => {
    var log_id;
    // TODO: Add correct data
    console.log("save clicked");
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip_address: "",
        started_answering: null,
        finished_answering: null,
        form_submitted: "N",
        form_cancelled: "Y",
        accessibility_editor: "Leba",
        entrance: 341
      })
    };
    await fetch("http://localhost:8000/api/ArXAnswerLog/", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        log_id = data;
      });
    console.log(log_id);
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
        {hasSaveDraftButton ? (
          <Button variant="secondary" onClickHandler={handleSaveClick}>
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
