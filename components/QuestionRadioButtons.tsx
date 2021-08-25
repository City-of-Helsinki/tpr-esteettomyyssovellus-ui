import { SelectionGroup, RadioButton } from "hds-react";
import React, { useState } from "react";
import { QuestionRadioButtonsProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  removeAnsweredChoice,
  setAnswer,
  setAnsweredChoice,
} from "../state/reducers/formSlice";

// usage: general custom radiobutton from HDS
const QuestionRadioButtons = ({
  mainLabel,
  firstButtonLabel = "",
  secondButtonLabel = "",
  options,
  value,
}: QuestionRadioButtonsProps): JSX.Element => {
  const dispatch = useAppDispatch();
  let curAnswers = useAppSelector((state) => state.formReducer.answers);

  let startState =
    value != undefined && curAnswers[value] != undefined
      ? curAnswers[value].toString()
      : "0";

  const [selectedRadioItem, setSelectedRadioItem] = useState(startState);

  const handleRadioClick = (e: any) => {
    setSelectedRadioItem(e.target.value);
    const questionNumber = value ? value : -1;

    if (value && options) {
      const answer = Number(e.target.value);
      if (curAnswers[questionNumber] != undefined) {
        dispatch(removeAnsweredChoice(curAnswers[questionNumber].toString()));
      }
      // @ts-ignore: this is weird
      dispatch(setAnsweredChoice(answer));
      dispatch(setAnswer({ questionNumber, answer }));
    }
  };

  // Add values to radiobuttons. The Y and N makes them uniques which then can also be used
  // to collect the answer.
  const firstValue = options != undefined ? options[0].value?.toString() : "";
  const secondValue = options != undefined ? options[1].value?.toString() : "";
  const firstId = "v-radio" + firstValue;
  const secondId = "v-radio" + secondValue;

  return (
    <SelectionGroup direction="horizontal" label={mainLabel}>
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
