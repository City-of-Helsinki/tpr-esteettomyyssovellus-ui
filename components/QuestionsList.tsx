import React from "react";
import QuestionDropdown from "./QuestionDropdown";
import QuestionRadioButtons from "./QuestionRadioButtons";
import QuestionContainer from "./QuestionContainer";
import { QuestionChoicesProps, QuestionDataProps, QuestionsListProps } from "../types/general";
import { TextInput } from "hds-react";
import { Dictionary } from "@reduxjs/toolkit";

// TODO: when data, get questions data as props and map to return
// used to list multiple questions: <QContainer><QElement /></QC>
const QuestionsList = ({ additionalInfoVisible, questions, answers }: QuestionsListProps): JSX.Element => {
  // remove mock data after real data from fecth

  // const mockDataList = [
  //   {
  //     type: "dropdown",
  //     qnumber: 1.1,
  //     qText: "PH: Onko portaat",
  //     qInfo: "Tässä on ohjeet",
  //     data: [{ label: "100" }, { label: "200" }],
  //   },
  //   {
  //     type: "dropdown",
  //     qnumber: 1.2,
  //     qText: "PH: Onko ovia",
  //     qInfo: "Tässä on ohjeet 2",
  //     data: [{ label: "900" }, { label: "901" }],
  //   },
  //   {
  //     type: "radiobutton",
  //     qnumber: 1.3,
  //     qText: "PH: Onko ramppi",
  //     qInfo: "",
  //     data: [{}],
  //   },
  // ];

  let dataComponent: JSX.Element;

  return (
    <>
      {questions?.map((question: any, ind: number) => {
        const answerChoices: any = answers
          ?.filter((answer) => answer.question_id === question.question_id)
          .map((choice) => {
            return {
              label: choice.text,
            };
          });

        const backgroundColor: string = ind % 2 === 0 ? "#f2f2fc" : "#ffffff";
        return (
          <QuestionContainer
            key={question.question_id}
            questionNumber={question.question_code}
            questionText={question.text}
            questionInfo={question.description ?? null}
            hasAdditionalInfo={additionalInfoVisible}
            backgroundColor={backgroundColor}
          >
            {/* {dataComponent} */}
            {/* For checking if the component is yes_or_no question -> data from db */}
            {question.yes_no_question === "Y" ? (
              // todo: add some logic to figure out what qustion id is and save answer to state
              <>
                <QuestionRadioButtons key={question.question_code} />
              </>
            ) : (
              <>
                <QuestionDropdown key={question.question_code} options={answerChoices} />
              </>
            )}
          </QuestionContainer>
        );
      })}
      {/* for testing textinput component */}
      {/* <QuestionContainer key={1.4} questionNumber={1.4} questionText="PH: Yhteyshenkilö" backgroundColor="white" hasAdditionalInfo={false}>
        <TextInput id="1" placeholder="esim etunimi sukunimi" />
      </QuestionContainer> */}
    </>
  );
};

export default QuestionsList;
