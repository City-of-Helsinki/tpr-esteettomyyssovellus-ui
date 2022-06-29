import React, { useState } from "react";
import { useRouter } from "next/router";
import { useI18n } from "next-localization";
import { Select } from "hds-react";
import Button from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { addEntrancePlaceBox, deleteEntrancePlace, setEntranceLocationPhoto } from "../state/reducers/additionalInfoSlice";
import { setAnswer, setExtraAnswer } from "../state/reducers/formSlice";
import { BackendEntranceAnswer, BackendEntranceField, BackendEntrancePlace } from "../types/backendModels";
import { InputOption, QuestionBlockImportProps } from "../types/general";
import { API_FETCH_BACKEND_ENTRANCE_ANSWERS, API_FETCH_BACKEND_ENTRANCE_FIELD, API_FETCH_BACKEND_ENTRANCE_PLACES } from "../types/constants";
import getOrigin from "../utils/request";
import { getTokenHash } from "../utils/utilFunctions";
import styles from "./QuestionBlockImportExistingData.module.scss";

// usage: button for copying data from existing servicepoint
const QuestionBlockImportExistingData = ({ block, copyableEntrances }: QuestionBlockImportProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);

  const [selectedOption, setSelectedOption] = useState<InputOption>();

  const copyOptions = copyableEntrances
    .map((copy) => {
      const { copyable_entrance_id, copyable_servicepoint_name } = copy;
      return { value: copyable_entrance_id, label: copyable_servicepoint_name };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const handleCopy = async () => {
    if (selectedOption) {
      const { value: entranceId } = selectedOption;
      const { question_block_id } = block;

      // Get the question answer data for the entrance
      const questionAnswersResp = await fetch(
        `${getOrigin(
          router
        )}/${API_FETCH_BACKEND_ENTRANCE_ANSWERS}?entrance_id=${entranceId}&question_block_id=${question_block_id}&form_submitted=Y&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const questionAnswerData = await (questionAnswersResp.json() as Promise<BackendEntranceAnswer[]>);

      // Get the extra field data for the entrance
      const questionExtraAnswersResp = await fetch(
        `${getOrigin(
          router
        )}/${API_FETCH_BACKEND_ENTRANCE_FIELD}?entrance_id=${entranceId}&question_block_id=${question_block_id}&form_submitted=Y&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const questionExtraAnswerData = await (questionExtraAnswersResp.json() as Promise<BackendEntranceField[]>);

      // Get the entrance place data for pictures and maps
      const allEntrancePlaceDataResp = await fetch(
        `${getOrigin(
          router
        )}/${API_FETCH_BACKEND_ENTRANCE_PLACES}?entrance_id=${entranceId}&question_block_id=${question_block_id}&form_submitted=Y&format=json`,
        {
          headers: new Headers({ Authorization: getTokenHash() }),
        }
      );
      const entrancePlaceData = await (allEntrancePlaceDataResp.json() as Promise<BackendEntrancePlace[]>);

      if (questionAnswerData && questionAnswerData.length > 0) {
        // Put copied answers into redux state
        questionAnswerData.forEach((copiedAnswer) => {
          const { question_id: questionId, question_choice_id: answer } = copiedAnswer;

          if (questionId === undefined || questionId === null) {
            // Copy the location and/or photo
            dispatch(
              setEntranceLocationPhoto({
                entrance_id: curEntranceId,
                question_block_id: question_block_id,
                existingAnswer: copiedAnswer,
                modifiedAnswer: copiedAnswer,
                termsAccepted: true,
                invalidValues: [],
                canAddLocation: false,
                canAddPhoto: false,
              })
            );
          } else if (questionId !== undefined && answer !== undefined) {
            // Copy the question answer
            dispatch(setAnswer({ questionId, answer }));
          }
        });
      }

      if (questionExtraAnswerData && questionExtraAnswerData.length > 0) {
        // Put copied extra field answers into redux state
        questionExtraAnswerData.forEach((copiedExtraAnswer) => {
          const { question_block_field_id: questionBlockFieldId, entry: answer } = copiedExtraAnswer;

          if (questionBlockFieldId !== undefined && answer !== undefined) {
            dispatch(setExtraAnswer({ questionBlockFieldId, answer }));
          }
        });
      }

      if (entrancePlaceData && entrancePlaceData.length > 0) {
        // Put copied entrance places into redux state
        entrancePlaceData.forEach((copiedPlace) => {
          const { place_id, order_number } = copiedPlace;

          // Remove any existing entrance places
          dispatch(
            deleteEntrancePlace({
              entrance_id: curEntranceId,
              place_id: place_id,
            })
          );

          // Try to make sure the order number is 1 or higher
          dispatch(
            addEntrancePlaceBox({
              entrance_id: curEntranceId,
              place_id: place_id,
              order_number: order_number && order_number > 0 ? order_number : 1,
              existingBox: copiedPlace,
              modifiedBox: copiedPlace,
              isDeleted: false,
              termsAccepted: true,
              invalidValues: [],
            })
          );
        });
      }
    }
  };

  return (
    <div className={styles.mainContainer}>
      <p>{i18n.t("common.copyDataFromSameAddress")}</p>
      <div className={styles.inputContainer}>
        <Select
          className={styles.selectDropdown}
          label=""
          placeholder={i18n.t("QuestionFormImportExistingData.chooseServicepoint")}
          options={copyOptions}
          onChange={(selected: InputOption) => setSelectedOption(selected)}
        />
        <Button variant="secondary" onClickHandler={handleCopy}>
          {i18n.t("QuestionFormImportExistingData.bringInformation")}
        </Button>
      </div>
    </div>
  );
};

export default QuestionBlockImportExistingData;
