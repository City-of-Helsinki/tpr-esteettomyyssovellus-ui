import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import styles from "./ContactInformationQuestionContainer.module.scss";
import { useI18n } from "next-localization";
import QuestionContainer from "./QuestionContainer";
import { TextInput } from "hds-react";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { ContactInformationProps } from "../types/general";
import {
  setEmail,
  setPhoneNumber,
  setContactPerson,
  changeContactPersonStatus,
  changePhoneNumberStatus,
  changeEmailStatus,
  setFinished,
  unsetFinished
} from "../state/reducers/formSlice";

const ContactInformationQuestionContainer = ({
  blockNumber
}: ContactInformationProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const contactQuestions = [
    {
      placeholder: i18n.t("ContactInformation.personPlaceholder"),
      question_block_id: blockNumber,
      question_code: blockNumber + ".1",
      question_id: -1,
      question_level: 1,
      text: i18n.t("ContactInformation.contactPerson")
    },
    {
      placeholder: i18n.t("ContactInformation.phonePlaceholder"),
      question_block_id: blockNumber,
      question_code: blockNumber + ".2",
      question_id: -2,
      question_level: 1,
      text: i18n.t("ContactInformation.phoneNumber")
    },
    {
      placeholder: i18n.t("ContactInformation.emailPlaceholder"),
      question_block_id: blockNumber,
      question_code: blockNumber + ".3",
      question_id: -3,
      question_level: 1,
      text: i18n.t("ContactInformation.email")
    }
  ];

  const handleChange = (event: any) => {
    // REGEXES FOR VALIDATING
    var phonePattern = new RegExp(/^[^a-zA-Z]+$/);
    var emailPattern = new RegExp(
      /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
    );

    switch (event.target.id) {
      case "-1":
        dispatch(setContactPerson(event.target.value));
        // VALIDATE CONTACTPERSON
        if (event.target.value.length > 0) {
          dispatch(changeContactPersonStatus(true));
        } else {
          dispatch(changeContactPersonStatus(false));
        }
        break;
      case "-2":
        dispatch(setPhoneNumber(event.target.value));
        // VALIDATE PHONE
        if (!phonePattern.test(event.target.value)) {
          dispatch(changePhoneNumberStatus(false));
        } else {
          dispatch(changePhoneNumberStatus(true));
        }
        break;
      case "-3":
        dispatch(setEmail(event.target.value));
        // VALIDATE EMAIL
        if (!emailPattern.test(event.target.value)) {
          dispatch(changeEmailStatus(false));
        } else {
          dispatch(changeEmailStatus(true));
        }
        break;
    }
  };

  // CHECK IF THE BLOCK IS FINISHED
  const contacts = useAppSelector((state) => state.formReducer.contacts);
  if (Object.values(contacts).every((e) => e[1] == true)) {
    dispatch(setFinished(99));
  } else {
    dispatch(unsetFinished(99));
  }

  return (
    <>
      <div className={styles.mainInfo}>
        <p>{i18n.t("ContactInformation.contactInformationText")}</p>
        <div className={styles.infoContainer}></div>
      </div>
      <div className={styles.importAddinfoContainer}>
        <QuestionFormImportExistingData />
      </div>
      {contactQuestions.map((question, ind: number) => {
        const contacts = useAppSelector((state) => state.formReducer.contacts);
        const phoneNumber = contacts["phoneNumber"];
        const email = contacts["email"];
        const contactPerson = contacts["contactPerson"];
        let value = "";
        let error = "";
        let mode = undefined;
        const backgroundColor: string = ind % 2 === 0 ? "#f2f2fc" : "#ffffff";
        switch (question.question_id) {
          case -1:
            value = contactPerson[0];
            error = contactPerson[1] ? "" : "Please input contactperson";
            break;
          case -2:
            value = phoneNumber[0];
            // phoneNumber[1] is a boolean value indicating whether the phone number
            // is valid. If the phone number is invalid displays an error text
            error = phoneNumber[1] ? "" : "Please input valid phonenumber";
            break;
          case -3:
            value = email[0];
            // email[1] is a boolean value indicating whether the email
            // is valid. If the email is invalid displays an error text
            error = email[1] ? "" : "Please input valid email";
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
              onChange={handleChange}
              value={value ? value : undefined}
              errorText={error}
            />
          </QuestionContainer>
        );
      })}
    </>
  );
};

export default ContactInformationQuestionContainer;
