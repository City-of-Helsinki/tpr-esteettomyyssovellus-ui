import React from "react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import Button from "./QuestionButton";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { getCurrentDate } from "../utils/utilFunctions";

// usage: add new button for ServicepointLandingSummary
const ServicepointLandingSummaryNewButton = (): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);

  const handleEditorAddPointData = () => {
    const startedAnswering = getCurrentDate();
    dispatch(setStartDate(startedAnswering));
    const url = `/entranceAccessibility/${curServicepointId}`;
    router.push(url);
  };

  return (
    <Button variant="primary" onClickHandler={handleEditorAddPointData}>
      {i18n.t("servicepoint.buttons.addNewEntrance")}
    </Button>
  );
};

export default ServicepointLandingSummaryNewButton;
