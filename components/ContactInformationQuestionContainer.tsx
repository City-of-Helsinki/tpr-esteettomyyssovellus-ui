import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import styles from "./ContactInformationQuestionContainer.module.scss";
import { useI18n } from "next-localization";
import QuestionContainer from "./QuestionContainer";
import { TextInput } from "hds-react";
import { useAppSelector } from "../state/hooks";
import { ContactInformationProps } from "../types/general";

const ContactInformationQuestionContainer = ({
  blockNumber
}: ContactInformationProps): JSX.Element => {
  const i18n = useI18n();
  const contactQuestions = [
    {
      placeholder: "PH: Esim. vahtimestari tai Etunimi Sukunimi",
      question_block_id: blockNumber,
      question_code: blockNumber + ".1",
      question_id: -1,
      question_level: 1,
      text: "PH: Yhteishenkilö"
    },
    {
      placeholder: "Esim. +358 50 123 4567",
      question_block_id: blockNumber,
      question_code: blockNumber + ".2",
      question_id: -2,
      question_level: 1,
      text: "PH: Puhelinnumero"
    },
    {
      placeholder: "Esim. osoite@maili.fi",
      question_block_id: blockNumber,
      question_code: blockNumber + ".3",
      question_id: -3,
      question_level: 1,
      text: "PH: Sähköposti"
    }
  ];

  const desc =
    "PH: Täytä tähän yhteistiedot toimipisteen esteettömyystietojen lisätietojen kysymystä varten.";
  return (
    <>
      <div className={styles.mainInfo}>
        <p>{desc ?? null}</p>
        <div className={styles.infoContainer}></div>
      </div>
      <div className={styles.importAddinfoContainer}>
        <QuestionFormImportExistingData />
      </div>
      {contactQuestions.map((question, ind: number) => {
        const phoneNumber = useAppSelector(
          (state) => state.formReducer.contacts
        )["phoneNumber"];
        const email = useAppSelector((state) => state.formReducer.contacts)[
          "email"
        ];
        let value = "";
        const backgroundColor: string = ind % 2 === 0 ? "#f2f2fc" : "#ffffff";
        switch (question.question_id) {
          case -2:
            value = phoneNumber;
            break;
          case -3:
            value = email;
            break;
        }

        return (
          <QuestionContainer
            key={question.question_code}
            questionNumber={Number(question.question_code)}
            questionText={question.text}
            backgroundColor={backgroundColor}
            hasAdditionalInfo={false}
          >
            <TextInput
              className={styles.textInput}
              id={question.question_id.toString()}
              placeholder={question.placeholder}
              value={value}
            />
          </QuestionContainer>
        );
      })}
    </>
  );
};

export default ContactInformationQuestionContainer;
