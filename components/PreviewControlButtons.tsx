import React, { useState } from "react";
import { IconArrowLeft } from "hds-react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import SaveSpinner from "./common/SaveSpinner";
import Button from "./QuestionButton";
import styles from "./PreviewControlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { setContinue } from "../state/reducers/formSlice";
import { saveFormData } from "../utils/utilFunctions";
import { PreviewControlButtonsProps } from "../types/general";

// usage: controls for preview page
const PreviewControlButtons = ({ hasSaveDraftButton, setSendingComplete }: PreviewControlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [isSavingDraft, setSavingDraft] = useState(false);
  const [isSavingFinal, setSavingFinal] = useState(false);

  const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curExtraAnswers = useAppSelector((state) => state.formReducer.extraAnswers);
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  // const formFinished = useAppSelector((state) => state.formReducer.formFinished);
  // const formSubmitted = useAppSelector((state) => state.formReducer.formSubmitted);
  // const additionalInfo = useAppSelector((state) => state.additionalInfoReducer);
  const user = useAppSelector((state) => state.generalSlice.user);

  const handleContinueEditing = (): void => {
    dispatch(setContinue());
    // TODO: Add errorpage
    const url = curServicepointId === -1 ? "/" : `/entranceAccessibility/${curServicepointId}/${curEntranceId}`;
    router.push(url);
  };

  const saveData = async (isDraft: boolean): Promise<void> => {
    if (curEntranceId > 0) {
      await saveFormData(curEntranceId, curAnsweredChoices, curExtraAnswers, startedAnswering, user, isDraft, router);
    }
  };

  const handleSaveDraftClick = async () => {
    setSavingDraft(true);
    await saveData(true);
    setSavingDraft(false);
  };

  const handleSaveAndSend = async () => {
    setSavingFinal(true);
    await saveData(false);
    setSavingFinal(false);

    // Show the sent successfully message
    setSendingComplete(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.previewControlButtons}>
        <Button variant="secondary" iconLeft={<IconArrowLeft />} onClickHandler={handleContinueEditing} disabled={isSavingDraft || isSavingFinal}>
          {i18n.t("PreviewPage.continueEditing")}
        </Button>

        {hasSaveDraftButton && (
          <Button
            variant="secondary"
            onClickHandler={handleSaveDraftClick}
            disabled={isSavingDraft || isSavingFinal}
            iconRight={
              isSavingDraft ? (
                <SaveSpinner
                  savingText={i18n.t("questionFormControlButtons.saving")}
                  savingFinishedText={i18n.t("questionFormControlButtons.savingFinished")}
                />
              ) : undefined
            }
          >
            {i18n.t("questionFormControlButtons.saveAsIncomplete")}
          </Button>
        )}

        <Button
          variant="primary"
          onClickHandler={handleSaveAndSend}
          //disabled={!formFinished}
          disabled={isSavingDraft || isSavingFinal}
          iconRight={
            isSavingFinal ? (
              <SaveSpinner
                savingText={i18n.t("questionFormControlButtons.saving")}
                savingFinishedText={i18n.t("questionFormControlButtons.savingFinished")}
              />
            ) : undefined
          }
        >
          {i18n.t("PreviewPage.saveAndSend")}
        </Button>
      </div>
    </div>
  );
};

export default PreviewControlButtons;
