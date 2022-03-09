import React from "react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import Button from "./QuestionButton";
import { ServicepointLandingSummaryModifyButtonProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { getCurrentDate } from "../utils/utilFunctions";

// usage: modify button for ServicepointLandingSummary
const ServicepointLandingSummaryModifyButton = ({ entranceData, hasData }: ServicepointLandingSummaryModifyButtonProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const { entrance_id: curEntranceId } = entranceData || {};

  const handleEditorAddPointData = () => {
    const startedAnswering = getCurrentDate();
    dispatch(setStartDate(startedAnswering));
    const url = entranceData ? `/entranceAccessibility/${curServicepointId}/${curEntranceId}` : `/entranceAccessibility/${curServicepointId}`;
    router.push(url);
  };

  return (
    <Button variant="primary" onClickHandler={handleEditorAddPointData}>
      {!hasData ? i18n.t("servicepoint.buttons.createServicepoint") : i18n.t("servicepoint.buttons.editServicepoint")}
    </Button>
  );
};

export default ServicepointLandingSummaryModifyButton;
