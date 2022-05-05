import { SelectionGroup, RadioButton } from "hds-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useI18n } from "next-localization";
import { QuestionRadioButtonsProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { removeAnsweredChoice, setAnswer, setAnsweredChoice } from "../state/reducers/formSlice";

// usage: general custom radiobutton from HDS
const QuestionRadioButtons = ({
  mainLabel,
  firstButtonLabel = "",
  secondButtonLabel = "",
  options,
  questionId,
  blockId,
}: QuestionRadioButtonsProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const curAnswers = useAppSelector((state) => state.formReducer.answers);
  const curInvalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);

  const [selectedRadioItem, setSelectedRadioItem] = useState("0");

  const isInvalid = selectedRadioItem === "0" && blockId !== undefined && curInvalidBlocks.includes(blockId);

  useEffect(() => {
    const startState = questionId !== undefined && curAnswers[questionId] !== undefined ? curAnswers[questionId].toString() : "0";
    setSelectedRadioItem(startState);
  }, [questionId, curAnswers]);

  const handleRadioClick = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedRadioItem(e.target.value);

    if (questionId && options) {
      const answer = Number(e.target.value);
      if (curAnswers[questionId] !== undefined) {
        dispatch(removeAnsweredChoice(curAnswers[questionId]));
      }
      dispatch(setAnsweredChoice(answer));
      dispatch(setAnswer({ questionId, answer }));
    }
  };

  // Add values to radiobuttons. The Y and N makes them uniques which then can also be used
  // to collect the answer.
  const firstValue = options !== undefined ? options[0].value?.toString() : "";
  const secondValue = options !== undefined ? options[1].value?.toString() : "";
  const firstId = `v-radio${firstValue}`;
  const secondId = `v-radio${secondValue}`;

  return (
    <SelectionGroup direction="horizontal" label={mainLabel} errorText={isInvalid ? i18n.t("common.missingAnswerValue") : ""}>
      <RadioButton
        id={firstId}
        name={firstValue}
        value={firstValue}
        label={firstButtonLabel}
        checked={selectedRadioItem === firstValue}
        onChange={handleRadioClick}
      />
      <RadioButton
        id={secondId}
        name={secondValue}
        value={secondValue}
        label={secondButtonLabel}
        checked={selectedRadioItem === secondValue}
        onChange={handleRadioClick}
      />
    </SelectionGroup>
  );
};

export default QuestionRadioButtons;
