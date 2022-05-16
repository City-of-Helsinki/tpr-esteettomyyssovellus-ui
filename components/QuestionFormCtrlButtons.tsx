import React, { useState } from "react";
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
import { setContinue, setEntranceId, setInvalid, unsetInvalid } from "../state/reducers/formSlice";
import getOrigin from "../utils/request";
import { getTokenHash, saveFormData } from "../utils/utilFunctions";

// usage: Form control buttons: return, save / draft, preview, validate
const QuestionFormCtrlButtons = ({
  hasCancelButton,
  hasValidateButton,
  hasSaveDraftButton,
  hasPreviewButton,
  hasContinueButton,
  visibleBlocks,
  questionsData,
  questionChoicesData,
  formId,
}: QuestionFormCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const curLocale: string = i18n.locale();
  const curLocaleId: number = LanguageLocales[curLocale as keyof typeof LanguageLocales];

  const [isSavingDraft, setSavingDraft] = useState(false);
  const [isSavingPreview, setSavingPreview] = useState(false);

  const curAnsweredChoices = useAppSelector((state) => state.formReducer.answeredChoices);
  const curExtraAnswers = useAppSelector((state) => state.formReducer.extraAnswers);
  const curEntranceLocationPhoto = useAppSelector((state) => state.additionalInfoReducer.entranceLocationPhoto);
  const curEntrancePlaceBoxes = useAppSelector((state) => state.additionalInfoReducer.entrancePlaceBoxes);
  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const startedAnswering = useAppSelector((state) => state.formReducer.startedAnswering);
  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const finishedBlocks = useAppSelector((state) => state.formReducer.finishedBlocks);
  // const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  // const additionalInfo = useAppSelector((state) => state.additionalInfoReducer);
  const user = useAppSelector((state) => state.generalSlice.user);

  const handleCancel = (): void => {
    // TODO: Add errorpage
    const url = curServicepointId === -1 ? "/" : `/details/${curServicepointId}/`;
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

  const saveDraft = async (): Promise<number> => {
    const entranceId = await checkEntranceExists(curEntranceId);
    dispatch(setEntranceId(entranceId));

    if (entranceId > 0) {
      const visibleQuestionChoiceIds = visibleBlocks?.flatMap((elem) => {
        // Get the visible questions for this block based on the answers chosen
        const filteredQuestionIds = questionsData
          .filter((question) => {
            const visibleQuestions = question.visible_if_question_choice?.split("+");

            const answersIncludeAllVisibleQuestions = visibleQuestions
              ? visibleQuestions.some((elem2) => curAnsweredChoices.includes(Number(elem2)))
              : false;

            return question.language_id === curLocaleId && (question.visible_if_question_choice === null || answersIncludeAllVisibleQuestions);
          })
          .map((question) => question.question_id);

        // Get all possible answer choices for the visible questions
        const questionChoices = questionChoicesData.filter((choice) => {
          return (
            choice.question_block_id === Number(elem?.key) && choice.language_id === curLocaleId && filteredQuestionIds.includes(choice.question_id)
          );
        });

        // Return the answer choice ids only for easier lookups
        return questionChoices.map((choice) => choice.question_choice_id);
      });

      // Filter to make sure the answered choices only include answers for the visible questions
      // It is possible to answer a question, then change a previous answer, which then makes this question hidden
      const filteredAnswerChoices = curAnsweredChoices.filter((choice) => {
        return visibleQuestionChoiceIds?.includes(Number(choice));
      });

      await saveFormData(
        curServicepointId,
        entranceId,
        filteredAnswerChoices,
        curExtraAnswers,
        curEntranceLocationPhoto,
        curEntrancePlaceBoxes,
        startedAnswering,
        user,
        true,
        router
      );
    }

    return entranceId;
  };

  const handleSaveDraftClick = async () => {
    setSavingDraft(true);
    await saveDraft();
    setSavingDraft(false);
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
      setSavingPreview(true);
      const entranceId = await saveDraft();
      setSavingPreview(false);

      // router.push(`/preview/${curServicepointId}`);
      router.push(`/entrancePreview/${curServicepointId}/${entranceId}`);
    }
  };

  const handleContinueClick = () => {
    if (validateForm()) {
      dispatch(setContinue());
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        {hasCancelButton ? (
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
      </div>
    </div>
  );
};
export default QuestionFormCtrlButtons;
