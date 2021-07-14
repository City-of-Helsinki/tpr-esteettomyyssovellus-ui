import { JSXElement, jSXElement } from "@babel/types";
import HeadlineQuestionContainer from "./HeadlineQuestionContainer";
import QuestionBlock from "./QuestionBlock";
import QuestionInfo from "./QuestionInfo";
import { QuestionProps } from "../types/general";
import { IconAngleDown, IconAngleUp } from "hds-react";
import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import QuestionsList from "./QuestionsList";
import QuestionAdditionalInfoCtrlButton from "./QuestionAdditionalInfoCtrlButton";
import { Button } from "hds-react";
import styles from "./ContactInformationQuestionContainer.module.scss";

const ContactInformationQuestionContainer = (): JSX.Element => {
  const blockQuestions: QuestionProps[] = [
    {
      can_add_comment: "N",
      can_add_location: "N",
      can_add_photo_max_count: 0,
      description: "PH: Esim. vahtimestari tai Etunimi Sukunimi",
      language_id: 1,
      photo_text: null,
      photo_url: null,
      question_block_id: 999,
      question_code: "",
      question_id: 12312312312,
      question_level: 1,
      question_order_text: "0101",
      technical_id: "F000-L1-B001-Q00001",
      text: "PH: Yhteishenkilö",
      visible_if_question_choice: "80101",
      yes_no_question: "N"
    },
    {
      can_add_comment: "N",
      can_add_location: "N",
      can_add_photo_max_count: 0,
      description: "Esim. +358 50 123 4567",
      form_id: 0,
      language_id: 1,
      photo_text: null,
      photo_url: null,
      question_block_id: 999,
      question_code: "",
      question_id: 12312312312,
      question_level: 1,
      question_order_text: "0101",
      technical_id: "F000-L1-B001-Q00001",
      text: "PH: Puhelinnumero",
      visible_if_question_choice: "80101",
      yes_no_question: "N"
    },
    {
      can_add_comment: "N",
      can_add_location: "N",
      can_add_photo_max_count: 0,
      description: "Esim. osoite@maili.fi",
      form_id: 0,
      language_id: 1,
      photo_text: null,
      photo_url: null,
      question_block_id: 999,
      question_code: "",
      question_id: 1,
      question_level: 1,
      question_order_text: "0101",
      technical_id: "F000-L1-B001-Q00001",
      text: "PH: Sähköposti",
      visible_if_question_choice: "80101",
      yes_no_question: "N"
    }
  ];

  const desc = "adadaad";
  return (
    <>
      <div className={styles.mainInfo}>
        <p>{desc ?? null}</p>
        <div className={styles.infoContainer}></div>
      </div>
      <div className={styles.importAddinfoContainer}>
        <QuestionFormImportExistingData />
      </div>
      <QuestionsList
        additionalInfoVisible={false}
        questions={blockQuestions}
        isContactQuestionList={true}
      />
    </>
  );
};

export default ContactInformationQuestionContainer;
