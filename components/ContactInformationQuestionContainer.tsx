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
  setWwwAddress,
  setContactPerson,
  changeContactPersonStatus,
  changePhoneNumberStatus,
  changeEmailStatus,
  setFinished,
  unsetFinished,
  changeWwwStatus
} from "../state/reducers/formSlice";
import { EMAIL_REGEX, PHONE_REGEX } from "../types/constants";

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
    },
    {
      placeholder: i18n.t("ContactInformation.wwwPlaceholder"),
      question_block_id: blockNumber,
      question_code: blockNumber + ".4",
      question_id: -4,
      question_level: 1,
      text: i18n.t("ContactInformation.www")
    }
  ];

  const handleChange = (event: any) => {
    // REGEXES FOR VALIDATING
    var phonePattern = new RegExp(PHONE_REGEX);
    var emailPattern = new RegExp(EMAIL_REGEX);

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
      case "-4":
        dispatch(setWwwAddress(event.target.value));
        if (event.target.value.length > 0) {
          dispatch(changeWwwStatus(true));
        } else {
          dispatch(changeWwwStatus(false));
        }
    }
  };

  // CHECK IF THE BLOCK IS FINISHED
  const contacts = useAppSelector((state) => state.formReducer.contacts);
  if (Object.values(contacts).every((e) => e[1] == true)) {
    dispatch(setFinished(99));
  } else {
    dispatch(unsetFinished(99));
  }

  const invalidBlocks = useAppSelector(
    (state) => state.formReducer.invalidBlocks
  );
  const isInvalid = invalidBlocks.includes(99);

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
        const www = contacts["www"];
        let value = "";
        let error = "";
        let isAnswered = false;
        const backgroundColor: string = ind % 2 === 0 ? "#f2f2fc" : "#ffffff";

        switch (question.question_id) {
          case -1:
            value = contactPerson[0];
            isAnswered = contactPerson[1];
            error = contactPerson[1] ? "" : "PH: Please input contactperson";
            break;
          case -2:
            value = phoneNumber[0];
            isAnswered = phoneNumber[1];
            // phoneNumber[1] is a boolean value indicating whether the phone number
            // is valid. If the phone number is invalid displays an error text
            error = phoneNumber[1] ? "" : "PH: Please input valid phonenumber";
            break;
          case -3:
            value = email[0];
            isAnswered = email[1];
            // email[1] is a boolean value indicating whether the email
            // is valid. If the email is invalid displays an error text
            error = email[1] ? "" : "PH: Please input valid email";
            break;
          case -4:
            value = www[0];
            isAnswered = www[1];
            // email[1] is a boolean value indicating whether the email
            // is valid. If the email is invalid displays an error text
            error = www[1] ? "" : "PH: Please input valid www-page";
            break;
        }

        const questionStyle =
          isInvalid && !isAnswered
            ? {
                backgroundColor,
                marginBottom: "0.1rem",
                borderStyle: "solid",
                borderColor: "#b01038"
              }
            : {
                backgroundColor
              };

        return (
          <div style={questionStyle}>
            <QuestionContainer
              key={question.question_code}
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
          </div>
        );
      })}
    </>
  );
};

export default ContactInformationQuestionContainer;
