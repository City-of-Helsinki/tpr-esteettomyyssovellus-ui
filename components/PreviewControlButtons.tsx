import React from "react";
import { IconArrowLeft } from "hds-react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import SaveSpinner from "./common/SaveSpinner";
import Button from "./QuestionButton";
import styles from "./PreviewControlButtons.module.scss";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setSaving } from "../state/reducers/formSlice";
// import { setContinue } from "../state/reducers/formSlice";
import { saveFormData } from "../utils/utilFunctions";
import { PreviewControlButtonsProps } from "../types/general";

// usage: controls for preview page
const PreviewControlButtons = ({
  hasData,
  hasSaveDraftButton,
  isNewEntrancePossible,
  formData,
  setSendingComplete,
}: PreviewControlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isSavingDraft = useAppSelector((state) => state.formReducer.isSaving.draft);
  const isSavingFinal = useAppSelector((state) => state.formReducer.isSaving.final);

  // const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const curAnsweredChoices = Object.values(curAnswers);
  const curExtraAnswers = useAppSelector((state) => state.formReducer.extraAnswers);
  const curEntranceLocationPhoto = useAppSelector((state) => state.additionalInfoReducer.entranceLocationPhoto);
  const curEntrancePlaceBoxes = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceBoxes);
  const curQuestionBlockComments = useAppSelector((state) => state.additionalInfoReducer.questionBlockComments);
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  // const formFinished = useAppSelector((state) => state.formReducer.formFinished);
  // const formSubmitted = useAppSelector((state) => state.formReducer.formSubmitted);
  const user = useAppSelector((state) => state.generalSlice.user);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);

  const handleContinueEditing = (): void => {
    // dispatch(setContinue());
    // TODO: Add errorpage
    const url =
      curEntranceId > 0
        ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}?checksum=${checksum}`
        : `/entranceAccessibility/${curServicepointId}?checksum=${checksum}`;
    const pageUrl = curServicepointId === -1 ? "/" : url;
    router.push(pageUrl);
  };

  const handleReturnToDetailsPage = async () => {
    router.push(`/details/${curServicepointId}?checksum=${checksum}`);
  };

  const saveData = async (isDraft: boolean): Promise<void> => {
    // Filter to make sure the answered choices do not include any null values
    const filteredAnswerChoices = curAnsweredChoices.filter((a) => a);

    if (curEntranceId > 0) {
      await saveFormData(
        curServicepointId,
        curEntranceId,
        filteredAnswerChoices,
        curExtraAnswers,
        curEntranceLocationPhoto,
        curEntrancePlaceBoxes,
        curQuestionBlockComments,
        startedAnswering,
        user,
        isDraft,
        router
      );
    }
  };

  const handleSaveDraftClick = async () => {
    dispatch(setSaving({ draft: true }));
    await saveData(true);
    dispatch(setSaving({ draft: false }));
  };

  const handleSaveAndSend = async () => {
    dispatch(setSaving({ final: true }));
    await saveData(false);
    dispatch(setSaving({ final: false }));

    // For form id 0 or 1, if it's not possible to add a new entrance, then redirect to the details page immediately after sending
    if (!isNewEntrancePossible) {
      const showSummaryPage = formData?.show_summary_page ?? "N";
      if (showSummaryPage === "Y") {
        handleReturnToDetailsPage();
      }
    }

    // Show the sent successfully message
    setSendingComplete(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.previewControlButtons}>
        <Button
          variant="secondary"
          iconLeft={<IconArrowLeft />}
          onClickHandler={handleContinueEditing}
          disabled={isSavingDraft || isSavingFinal || !hasData}
        >
          {i18n.t("PreviewPage.continueEditing")}
        </Button>

        {hasSaveDraftButton && (
          <Button
            variant="secondary"
            onClickHandler={handleSaveDraftClick}
            disabled={isSavingDraft || isSavingFinal || !hasData}
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
          disabled={isSavingDraft || isSavingFinal || !hasData}
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
