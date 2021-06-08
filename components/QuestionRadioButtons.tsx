import { SelectionGroup, RadioButton } from "hds-react";
import React, { useState } from "react";
import { useI18n } from "next-localization";
import { QuestionRadioButtonsProps } from "../types/general";

const QuestionRadioButtons = ({ mainLabel, firstButtonLabel = "", secondButtonLabel = "" }: QuestionRadioButtonsProps): JSX.Element => {
  // todo: maybe take in prost
  const i18n = useI18n();
  const [selectedRadioItem, setSelectedRadioItem] = useState("0");

  const handleRadioClick = (e: any) => {
    setSelectedRadioItem(e.target.value);
  };
  return (
    // TODO: id, name, value, label (?) for radiobuttons needs to be set programatically with data
    <SelectionGroup direction="horizontal" label={mainLabel}>
      <RadioButton id="v-radio1" name="v-radio" value="1" label={firstButtonLabel} checked={selectedRadioItem === "1"} onChange={handleRadioClick} />
      <RadioButton id="v-radio2" name="v-radio" value="2" label={secondButtonLabel} checked={selectedRadioItem === "2"} onChange={handleRadioClick} />
    </SelectionGroup>
  );
};

export default QuestionRadioButtons;
