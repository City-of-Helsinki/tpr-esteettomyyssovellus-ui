import { BackendQuestion } from "../types/backendModels";
import { KeyValueNumber } from "../types/general";

export const getVisibleQuestionsForBlock = (blockQuestions: BackendQuestion[], curAnswers: KeyValueNumber): BackendQuestion[] => {
  const curAnswerQuestionIds = Object.keys(curAnswers);
  const curAnsweredChoices = Object.values(curAnswers);

  // Get the visible questions for this block based on the answers chosen
  // The questions are in a hierarchy, and the visibility of a question depends on the visibility of its parent question
  return blockQuestions
    .sort((a, b) => (a.question_order_text ?? "").localeCompare(b.question_order_text ?? ""))
    .reduce((visibleQuestions: BackendQuestion[], question) => {
      if (question.visible_if_question_choice === null) {
        // This question is always visible
        return [...visibleQuestions, question];
      }

      // Check if this question's parent is visible and was answered with a choice that makes this question visible
      return question.visible_if_question_choice?.split("+").some((parentChoice) => {
        const parentQuestionId = curAnswerQuestionIds.find((key) => curAnswers[Number(key)] === Number(parentChoice));
        const parentQuestionVisible = visibleQuestions.some((q) => q.question_id === Number(parentQuestionId));
        const questionVisible = curAnsweredChoices.includes(Number(parentChoice));

        return (parentQuestionVisible || visibleQuestions.length === 0) && questionVisible;
      })
        ? [...visibleQuestions, question]
        : visibleQuestions;
    }, []);
};
