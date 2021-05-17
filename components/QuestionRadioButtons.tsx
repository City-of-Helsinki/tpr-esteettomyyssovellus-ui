import { SelectionGroup, RadioButton } from "hds-react";
import React, { useState } from "react";
import { useI18n } from "next-localization";

const QuestionRadioButtons = (): JSX.Element => {
  // todo: maybe take in props
  const i18n = useI18n();
  const [selectedRadioItem, setSelectedRadioItem] = useState("0");

  const handleRadioClick = (e: any) => {
    setSelectedRadioItem(e.target.value);
  };
  return (
    // TODO: id, name, value, label (?) for radiobuttons needs to be set programatically with data
    <SelectionGroup direction="horizontal">
      <RadioButton
        id="v-radio1"
        name="v-radio"
        value="1"
        label="PH: kyllä"
        checked={selectedRadioItem === "1"}
        onChange={handleRadioClick}
      />
      <RadioButton
        id="v-radio2"
        name="v-radio"
        value="2"
        label="PH: ei"
        checked={selectedRadioItem === "2"}
        onChange={handleRadioClick}
      />
    </SelectionGroup>
  );
};

export default QuestionRadioButtons;
