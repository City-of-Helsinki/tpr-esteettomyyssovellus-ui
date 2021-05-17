import React from "react";
import QuestionDropdown from "./QuestionDropdown";
import QuestionRadioButtons from "./QuestionRadioButtons";
import QuestionContainer from "./QuestionContainer";
import { QuestionDataProps } from "../types/general";

// TODO: when data, get questions data as props and map to return
// used to list multiple questions: <QContainer><QElement /></QC>
const QuestionsList = (): JSX.Element => {
  // remove mock data after real data from fecth

  const mockDataList = [
    {
      type: "dropdown",
      qnumber: 1.1,
      qText: "PH: Onko portaat",
      qInfo: "Tässä on ohjeet",
      hasAdditionalInformation: true,
      data: [{ label: "100" }, { label: "200" }],
    },
    {
      type: "dropdown",
      qnumber: 1.2,
      qText: "PH: Onko ovia",
      qInfo: "Tässä on ohjeet 2",
      hasAdditionalInformation: true,
      data: [{ label: "900" }, { label: "901" }],
    },
    {
      type: "radiobutton",
      qnumber: 1.3,
      qText: "PH: Onko ramppi",
      qInfo: "",
      data: [{}],
      hasAdditionalInformation: true,
    },
  ];

  let dataComponent: JSX.Element;

  return (
    <>
      {/* mapping logic might need to be modified after real data! */}
      {mockDataList.map(({ type, qnumber, qText, qInfo, hasAdditionalInformation, data }: QuestionDataProps, ind) => {
        const backgroundColor: string = ind % 2 === 0 ? "#f2f2fc" : "white";
        if (type === "dropdown") {
          dataComponent = <QuestionDropdown key={qnumber} options={data} />;
        }
        if (type === "radiobutton") {
          dataComponent = <QuestionRadioButtons key={qnumber} />;
        }

        return (
          <QuestionContainer
            key={qnumber}
            questionNumber={qnumber}
            questionText={qText}
            questionInfo={qInfo}
            hasAdditionalInfo={hasAdditionalInformation}
            backgroundColor={backgroundColor}
          >
            {dataComponent}
          </QuestionContainer>
        );
      })}
    </>
  );
};

export default QuestionsList;
