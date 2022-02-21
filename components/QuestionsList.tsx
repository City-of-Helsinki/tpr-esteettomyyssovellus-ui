import React from "react";
import QuestionDropdown from "./QuestionDropdown";
import QuestionRadioButtons from "./QuestionRadioButtons";
import QuestionContainer from "./QuestionContainer";
import { BackendQuestion } from "../types/backendModels";
import { QuestionsListProps } from "../types/general";

// usage: list questions component, should be called once per question block
const QuestionsList = ({ additionalInfoVisible, questions, answerChoices }: QuestionsListProps): JSX.Element => {
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
          <QuestionContainer
            key={question.question_id}
            questionId={question.question_id}
            questionBlockId={question.question_block_id}
            questionNumber={question.question_code}
            questionText={question.text}
            questionInfo={question.description ?? null}
            hasAdditionalInfo={
              additionalInfoVisible &&
              (question.can_add_location === "Y" || question.can_add_comment === "Y" || question.can_add_photo_max_count !== 0)
            }
            canAddLocation={question.can_add_location === "Y"}
            canAddComment={question.can_add_comment === "Y"}
            canAddPhotoMaxCount={question.can_add_photo_max_count}
            photoText={question.photo_text}
            photoUrl={question.photo_url}
          >
            {/* For checking if the component is yes_or_no question -> data from db */}
            {question.yes_no_question === "Y" ? (
              <QuestionRadioButtons
                key={question.question_code}
                options={answerOptions}
                questionId={question.question_id}
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
