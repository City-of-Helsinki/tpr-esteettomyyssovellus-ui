import React from "react";
import { useI18n } from "next-localization";
import { useRouter } from "next/router";
import Button from "./QuestionButton";
import { SummaryModifyButtonProps } from "../types/general";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { getCurrentDate } from "../utils/utilFunctions";

// usage: modify button for ServicepointLandingSummary
const SummaryModifyButton = ({ entranceData, entranceIdToModify, hasData }: SummaryModifyButtonProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  // const { entrance_id: curEntranceId } = entranceData || {};

  const handleEditorModifyPointData = () => {
    const startedAnswering = getCurrentDate();
    dispatch(setStartDate(startedAnswering));
    const url = entranceData ? `/entranceAccessibility/${curServicepointId}/${entranceIdToModify}` : `/entranceAccessibility/${curServicepointId}`;
    router.push(url);
  };

  return (
    <Button variant="primary" onClickHandler={handleEditorModifyPointData}>
      {!hasData ? i18n.t("servicepoint.buttons.createServicepoint") : i18n.t("servicepoint.buttons.editServicepoint")}
    </Button>
  );
};

export default SummaryModifyButton;
