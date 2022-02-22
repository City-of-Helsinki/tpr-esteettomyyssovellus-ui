import React from "react";
import QuestionExtraField from "./QuestionExtraField";
import QuestionTextInput from "./QuestionTextInput";
import { BackendQuestionBlockField } from "../types/backendModels";
import { QuestionBlockExtraFieldListProps } from "../types/general";

// usage: extra fields list component, should be called once per question block
const QuestionBlockExtraFieldList = ({ extraFields }: QuestionBlockExtraFieldListProps): JSX.Element => {
  return (
    <>
      {extraFields?.map((extraField: BackendQuestionBlockField) => {
        return (
          <QuestionExtraField
            key={extraField.field_number}
            questionBlockId={extraField.question_block_id}
            questionBlockFieldId={extraField.question_block_field_id}
            fieldNumber={extraField.field_number}
            questionText={extraField.field_title}
            questionInfo={extraField.description ?? null}
            isMandatory={extraField.obligatory === "Y"}
          >
            <QuestionTextInput id={extraField.field_name as string} questionBlockFieldId={extraField.question_block_field_id} />
          </QuestionExtraField>
        );
      })}
    </>
  );
};

export default QuestionBlockExtraFieldList;
