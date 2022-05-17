import React from "react";
import QuestionExtraField from "./QuestionExtraField";
import QuestionTextInput from "./QuestionTextInput";
import { useAppSelector } from "../state/hooks";
import { BackendQuestionBlockField } from "../types/backendModels";
import { QuestionBlockExtraFieldListProps } from "../types/general";

// usage: extra fields list component, should be called once per question block
const QuestionBlockExtraFieldList = ({ extraFields }: QuestionBlockExtraFieldListProps): JSX.Element => {
  const invalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);
  const curExtraAnswers = useAppSelector((state) => state.formReducer.extraAnswers);

  return (
    <>
      {extraFields?.map((extraField: BackendQuestionBlockField) => {
        const { description, field_name, field_number, field_title, obligatory, question_block_id, question_block_field_id } = extraField;

        const isMandatory = obligatory === "Y";
        const isInvalid = invalidBlocks.includes(question_block_id);
        const isTextInvalid =
          isInvalid && isMandatory && (!curExtraAnswers[question_block_field_id] || curExtraAnswers[question_block_field_id] === "");

        return (
          <QuestionExtraField
            key={field_number}
            fieldNumber={field_number}
            questionText={field_title}
            questionInfo={description}
            isMandatory={isMandatory}
            isTextInvalid={isTextInvalid}
          >
            <QuestionTextInput id={field_name as string} questionBlockFieldId={question_block_field_id} isTextInvalid={isTextInvalid} />
          </QuestionExtraField>
        );
      })}
    </>
  );
};

export default QuestionBlockExtraFieldList;
