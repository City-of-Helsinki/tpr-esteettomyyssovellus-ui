import React from "react";
import QuestionDropdown from "./QuestionDropdown";
import QuestionRadioButtons from "./QuestionRadioButtons";
import QuestionContainer from "./QuestionContainer";
import { QuestionDataProps, QuestionsListProps } from "../types/general";
import QuestionTextInput from "./QuestionTextInput";

// TODO: when data, get questions data as props and map to return
// used to list multiple questions: <QContainer><QElement /></QC>
const QuestionsList = ({ additionalInfoVisible }: QuestionsListProps): JSX.Element => {
  // remove mock data after real data from fecth

  const mockDataList = [
    {
      type: "dropdown",
      qnumber: 1.1,
      qText: "PH: Onko portaat",
      qInfo: "Tässä on ohjeet",
      data: [{ label: "100" }, { label: "200" }],
    },
    {
      type: "dropdown",
      qnumber: 1.2,
      qText: "PH: Onko ovia",
      qInfo: "Tässä on ohjeet 2",
      data: [{ label: "900" }, { label: "901" }],
    },
    {
      type: "radiobutton",
      qnumber: 1.3,
      qText: "PH: Onko ramppi",
      qInfo: "",
      data: [{}],
    },
  ];

  let dataComponent: JSX.Element;

  return (
    <>
      {/* mapping logic might need to be modified after real data! */}
      {mockDataList.map(({ type, qnumber, qText, qInfo, data }: QuestionDataProps, ind) => {
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
            hasAdditionalInfo={additionalInfoVisible}
            backgroundColor={backgroundColor}
          >
            {dataComponent}
          </QuestionContainer>
        );
      })}
      {/* for testing textinput component */}
      <QuestionContainer key={1.4} questionNumber={1.4} questionText="PH: Yhteyshenkilö" backgroundColor="white" hasAdditionalInfo={false}>
        <QuestionTextInput id="1" placeholder="esim etunimi sukunimi" />
      </QuestionContainer>
    </>
  );
};

export default QuestionsList;
