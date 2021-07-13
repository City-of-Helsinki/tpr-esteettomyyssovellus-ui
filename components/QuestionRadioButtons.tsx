import { SelectionGroup, RadioButton } from "hds-react";
import React, { useState } from "react";
import { useI18n } from "next-localization";
import { QuestionRadioButtonsProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import {
  removeAnsweredChoice,
  setAnswer,
  setAnsweredChoice
} from "../state/reducers/formSlice";

const QuestionRadioButtons = ({
  mainLabel,
  firstButtonLabel = "",
  secondButtonLabel = "",
  options,
  value
}: QuestionRadioButtonsProps): JSX.Element => {
  // todo: maybe take in prost
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  let curAnswers = useAppSelector((state) => state.formReducer.answers);
  let startState = "0";
  if (value != undefined && curAnswers[value] != undefined) {
    startState = curAnswers[value].toString();
  }
  const [selectedRadioItem, setSelectedRadioItem] = useState(startState);

  const handleRadioClick = (e: any) => {
    setSelectedRadioItem(e.target.value);
    const questionNumber = value ? value : -1;

    if (value && options) {
      const answer = Number(e.target.value);
      // console.log(curAnswers);
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
    // TODO: id, name, value, label (?) for radiobuttons needs to be set programatically with data
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
