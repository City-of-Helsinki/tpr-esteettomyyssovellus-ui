import React from "react";
import QuestionDropdown from "./QuestionDropdown";
import QuestionRadioButtons from "./QuestionRadioButtons";
import QuestionContainer from "./QuestionContainer";
import { BackendQuestion } from "../types/backendModels";
import { QuestionsListProps } from "../types/general";

// usage: list questions component, should be called once per question block
const QuestionsList = ({ questions, answerChoices, accessibilityPlaces }: QuestionsListProps): JSX.Element => {
  return (
    <>
      {questions?.map((question: BackendQuestion) => {
        const answerOptions = answerChoices
          ?.filter((choice) => choice.question_id === question.question_id)
          .map((choice) => {
            return {
              label: choice.text,
              value: choice.question_choice_id,
            };
          });

        return (
          <QuestionContainer key={question.question_id} question={question} accessibilityPlaces={accessibilityPlaces}>
            {/* For checking if the component is yes_or_no question -> data from db */}
            {question.yes_no_question === "Y" ? (
              <QuestionRadioButtons
                key={question.question_code}
                options={answerOptions}
                questionId={question.question_id}
                blockId={question.question_block_id}
                firstButtonLabel={answerOptions ? answerOptions[0].label : undefined}
                secondButtonLabel={answerOptions ? answerOptions[1].label : undefined}
              />
            ) : (
              <QuestionDropdown
                key={question.question_id}
                options={answerOptions}
                questionId={question.question_id}
                blockId={question.question_block_id}
              />
            )}
          </QuestionContainer>
        );
      })}
    </>
  );
};

export default QuestionsList;
