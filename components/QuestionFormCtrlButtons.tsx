import React from "react";
import { IconArrowRight, IconArrowLeft } from "hds-react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import SaveSpinner from "./common/SaveSpinner";
import Button from "./QuestionButton";
import { Entrance } from "../types/backendModels";
import { API_FETCH_ENTRANCES, LanguageLocales } from "../types/constants";
import { QuestionFormCtrlButtonsProps } from "../types/general";
import styles from "./QuestionFormCtrlButtons.module.scss";
import { useAppSelector, useAppDispatch } from "../state/hooks";
import { setContinue, setEntranceId, setInvalid, setSaving, setValidationTime, unsetInvalid } from "../state/reducers/formSlice";
import getOrigin from "../utils/request";
import { getTokenHash, saveFormData } from "../utils/utilFunctions";

// usage: Form control buttons: return, save / draft, preview, validate
const QuestionFormCtrlButtons = ({
  hasCancelButton,
  hasValidateButton,
  hasSaveDraftButton,
  hasPreviewButton,
  hasContinueButton,
  hasSaveMeetingRoomButton,
  setMeetingRoomSaveComplete,
  visibleBlocks,
  visibleQuestions,
  questionChoicesData,
  formId,
}: QuestionFormCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const curLocale: string = i18n.locale();
  const curLocaleId: number = LanguageLocales[curLocale as keyof typeof LanguageLocales];

  const isSavingDraft = useAppSelector((state) => state.formReducer.isSaving.draft);
  const isSavingPreview = useAppSelector((state) => state.formReducer.isSaving.preview);
  const isSavingMeetingRoom = useAppSelector((state) => state.formReducer.isSaving.meetingRoom);

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
  const finishedBlocks = useAppSelector((state) => state.formReducer.finishedBlocks);
  // const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  const user = useAppSelector((state) => state.generalSlice.user);
  const checksum = useAppSelector((state) => state.generalSlice.checksum);

  const handleCancel = (): void => {
    // TODO: Add errorpage
    const url = curServicepointId === -1 ? "/" : `/details/${curServicepointId}?checksum=${checksum}`;
    router.push(url);
  };

  // const isPreviewActive = curAnsweredChoices.length > 1;

  const checkEntranceExists = async (entranceId: number): Promise<number> => {
    if (entranceId === undefined || entranceId < 0) {
      // Create an empty entrance row in the database in order to get the entrance id
      const entranceRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: getTokenHash() },
        body: JSON.stringify({
          created: new Date(),
          created_by: user,
          modified: new Date(),
          modified_by: user,
          is_main_entrance: formId === 0 ? "Y" : "N",
          servicepoint: curServicepointId,
          form: formId,
        }),
      };
      const newEntranceResponse = await fetch(`${getOrigin(router)}/${API_FETCH_ENTRANCES}`, entranceRequestOptions);
      const newEntrance = await (newEntranceResponse.json() as Promise<Entrance>);

      return newEntrance.entrance_id;
    } else {
      // Entrance id is already valid
      return entranceId;
    }
  };

  const saveData = async (isDraft: boolean): Promise<number> => {
    const entranceId = await checkEntranceExists(curEntranceId);
    dispatch(setEntranceId(entranceId));

    if (entranceId > 0) {
      // The visible questions are based on the answers chosen
      const visibleBlockIds = visibleBlocks?.map((elem) => Number(elem?.key)) || [];
      const visibleQuestionIds = visibleQuestions.map((question) => question.question_id);

      const visibleQuestionChoiceIds = visibleBlockIds.flatMap((blockId) => {
        // Get all possible answer choices for the visible questions
        const questionChoices = questionChoicesData.filter((choice) => {
          return choice.question_block_id === blockId && choice.language_id === curLocaleId && visibleQuestionIds.includes(choice.question_id);
        });

        // Return the answer choice ids only for easier lookups
        return questionChoices.map((choice) => choice.question_choice_id);
      });

      // Filter to make sure the answered choices only include answers for the visible questions
      // It is possible to answer a question, then change a previous answer, which then makes this question hidden
      const filteredAnswerChoices = curAnsweredChoices.filter((choice) => {
        return visibleQuestionChoiceIds?.includes(Number(choice));
      });

      // Filter accessibility places and comments to make sure they are applicable for the visible question blocks
      // It is possible to add a place or comment in a block, then change the location type (block 0 answer),
      // which changes the visible blocks and makes the accessibility place or comment invalid for the form
      const filteredEntrancePlaceBoxes = curEntrancePlaceBoxes.filter((box) => {
        return visibleBlockIds.includes(box.question_block_id);
      });
      const filteredBlockComments = curQuestionBlockComments.filter((comment) => {
        return visibleBlockIds.includes(comment.question_block_id);
      });

      await saveFormData(
        curServicepointId,
        entranceId,
        filteredAnswerChoices,
        curExtraAnswers,
        curEntranceLocationPhoto,
        filteredEntrancePlaceBoxes,
        filteredBlockComments,
        startedAnswering,
        user,
        isDraft,
        router
      );
    }

    return entranceId;
  };

  const handleSaveDraftClick = async () => {
    dispatch(setSaving({ draft: true }));
    await saveData(true);
    dispatch(setSaving({ draft: false }));
  };

  const validateForm = () => {
    // VALIDATE BLOCKS
    const validBlocks = visibleBlocks?.map((elem) => {
      if (elem !== null) {
        if (!finishedBlocks.includes(Number(elem?.key?.toString()))) {
          dispatch(setInvalid(Number(elem?.key?.toString())));
          // dispatch(unsetFormFinished());
          return false;
        } else {
          dispatch(unsetInvalid(Number(elem?.key?.toString())));
          return true;
        }
      }
      return true;
    });

    // Store the time when the validation occurred to force the validation summary to be scrolled into view again if needed
    dispatch(setValidationTime(new Date().getTime()));

    return validBlocks?.every((b) => b) || false;
  };

  /*
  const invalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);

  if (invalidBlocks.length === 0) {
    dispatch(setFormFinished());
  } else {
    dispatch(unsetFormFinished());
  }
  */

  const handleValidateClick = () => {
    validateForm();
  };

  const handlePreviewClick = async () => {
    if (validateForm()) {
      dispatch(setSaving({ preview: true }));
      const entranceId = await saveData(true);
      dispatch(setSaving({ preview: false }));

      if (entranceId > 0) {
        router.push(`/entrancePreview/${curServicepointId}/${entranceId}?checksum=${checksum}`);
      }
    }
  };

  const handleContinueClick = () => {
    if (validateForm()) {
      dispatch(setContinue());
    }
  };

  const handleSaveMeetingRoomClick = async () => {
    setMeetingRoomSaveComplete(false);

    if (validateForm()) {
      dispatch(setSaving({ meetingRoom: true }));
      const entranceId = await saveData(false);
      dispatch(setSaving({ meetingRoom: false }));

      if (entranceId > 0) {
        // Show the saved successfully message
        setMeetingRoomSaveComplete(true);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        {hasCancelButton && (formId === 0 || formId === 1) ? (
          <Button variant="secondary" iconLeft={<IconArrowLeft />} onClickHandler={handleCancel} disabled={isSavingDraft || isSavingPreview}>
            {i18n.t("questionFormControlButtons.quit")}
          </Button>
        ) : null}
      </div>
      <div className={styles.right}>
        {hasValidateButton ? (
          <Button variant="secondary" onClickHandler={handleValidateClick} disabled={isSavingDraft || isSavingPreview}>
            {i18n.t("questionFormControlButtons.verifyInformation")}
          </Button>
        ) : null}

        {hasSaveDraftButton && formId === 0 ? (
          <Button
            variant="secondary"
            onClickHandler={handleSaveDraftClick}
            disabled={isSavingDraft || isSavingPreview}
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
        ) : null}

        {hasPreviewButton && (formId === 0 || formId === 1) ? (
          <Button
            variant="primary"
            onClickHandler={handlePreviewClick}
            // disabled={!isPreviewActive || !isContinueClicked}
            disabled={isSavingDraft || isSavingPreview}
            iconRight={
              isSavingPreview ? (
                <SaveSpinner
                  savingText={i18n.t("questionFormControlButtons.saving")}
                  savingFinishedText={i18n.t("questionFormControlButtons.savingFinished")}
                />
              ) : (
                <IconArrowRight />
              )
            }
          >
            {i18n.t("questionFormControlButtons.preview")}
          </Button>
        ) : null}

        {hasContinueButton ? (
          <Button variant="primary" iconRight={<IconArrowRight />} onClickHandler={handleContinueClick}>
            {i18n.t("accessibilityForm.continue")}
          </Button>
        ) : null}

        {hasSaveMeetingRoomButton && formId >= 2 ? (
          <Button
            variant="primary"
            onClickHandler={handleSaveMeetingRoomClick}
            disabled={isSavingDraft || isSavingPreview || isSavingMeetingRoom}
            iconRight={
              isSavingMeetingRoom ? (
                <SaveSpinner
                  savingText={i18n.t("questionFormControlButtons.saving")}
                  savingFinishedText={i18n.t("questionFormControlButtons.savingFinished")}
                />
              ) : undefined
            }
          >
            {i18n.t("questionFormControlButtons.saveMeetingRoom")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
export default QuestionFormCtrlButtons;
