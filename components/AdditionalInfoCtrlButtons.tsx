import React from "react";
import { IconArrowLeft } from "hds-react";
import styles from "./AdditionalInfoCtrlButtons.module.scss";
import QuestionButton from "./QuestionButton";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  removeSingleQuestionAdditionalinfo,
  setPreviousInitStateAdditionalinfo,
} from "../state/reducers/additionalInfoSlice";
import {
  AdditionalInfoCtrlButtonsProps,
  AdditionalInfoProps,
} from "../types/general";

const AdditionalInfoCtrlButtons = ({
  questionId,
}: AdditionalInfoCtrlButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSaveAndReturn = () => {
    router.back();
  };

  const prevState = useAppSelector(
    (state) =>
      state.additionalInfoReducer.curEditingInitialState as AdditionalInfoProps
  );

  const handleReturnNoSave = (questionId: number) => {
    // if current addinfo had initial values -> set them instead of clearing the state for not losing existing values
    if (prevState && Object.entries(prevState).length > 0) {
      dispatch(setPreviousInitStateAdditionalinfo({ questionId, prevState }));
    } else {
      dispatch(removeSingleQuestionAdditionalinfo({ questionId }));
    }
    router.back();
  };

  return (
    <div className={styles.maincontainer}>
      <QuestionButton
        variant="secondary"
        iconLeft={<IconArrowLeft />}
        onClickHandler={handleSaveAndReturn}
      >
        {i18n.t("common.buttons.saveAndReturn")}
      </QuestionButton>
      <span className={styles.noborderbutton}>
        <QuestionButton
          variant="secondary"
          onClickHandler={() => handleReturnNoSave(questionId)}
        >
          {i18n.t("common.buttons.returnNoSave")}
        </QuestionButton>
      </span>
    </div>
  );
};

export default AdditionalInfoCtrlButtons;
