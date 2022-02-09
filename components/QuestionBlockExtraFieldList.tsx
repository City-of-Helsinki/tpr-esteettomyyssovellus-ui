import React from "react";
import QuestionExtraField from "./QuestionExtraField";
import QuestionTextInput from "./QuestionTextInput";
import { BackendQuestionBlockField } from "../types/backendModels";
import { QuestionBlockExtraFieldListProps } from "../types/general";

// usage: extra fields list component, should be called once per question block
const QuestionBlockExtraFieldList = ({ extraFields, answers }: QuestionBlockExtraFieldListProps): JSX.Element => {
  return (
    <>
      {extraFields?.map((extraField: BackendQuestionBlockField) => {
        /*
        const answerChoices = answers
          ?.filter((answer) => answer.question_id === extraField.field_number)
          .map((choice) => {
            return {
              label: choice.text,
              value: choice.question_choice_id,
            };
          });
        */

        return (
          <QuestionExtraField
            key={extraField.field_number}
            questionBlockId={extraField.question_block_id}
            fieldNumber={extraField.field_number}
            questionText={extraField.field_title}
            questionInfo={extraField.description ?? null}
            isMandatory={extraField.obligatory === "Y"}
          >
            {/* TODO: implement answer handling */}
            <QuestionTextInput id={extraField.field_name as string} />
          </QuestionExtraField>
        );
      })}
    </>
  );
};

export default QuestionBlockExtraFieldList;
