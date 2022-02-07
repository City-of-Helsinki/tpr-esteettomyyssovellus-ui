import React from "react";
import { TextInput } from "hds-react";
import QuestionExtraField from "./QuestionExtraField";
import { BackendQuestionBlockField } from "../types/backendModels";
import { QuestionBlockExtraFieldListProps } from "../types/general";

// usage: extra fields list component, should be called once per question block
const QuestionBlockExtraFieldList = ({ extraFields, answers }: QuestionBlockExtraFieldListProps): JSX.Element => {
  return (
    <>
      {extraFields?.map((extraField: BackendQuestionBlockField, ind: number) => {
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

        const backgroundColor: string = ind % 2 === 0 ? "#f2f2fc" : "#ffffff";
        return (
          <QuestionExtraField
            key={extraField.field_number}
            questionBlockId={extraField.question_block_id}
            fieldNumber={extraField.field_number}
            questionText={extraField.field_title}
            questionInfo={extraField.description ?? null}
            isMandatory={extraField.obligatory === "Y"}
            backgroundColor={backgroundColor}
          >
            {/* TODO: convert this to a QuestionText component when the answer handling is done */}
            <TextInput id={extraField.field_name as string} />
          </QuestionExtraField>
        );
      })}
    </>
  );
};

export default QuestionBlockExtraFieldList;
