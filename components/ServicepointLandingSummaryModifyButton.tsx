import React from "react";
import { useI18n } from "next-localization";
import router from "next/router";
import Button from "./QuestionButton";
import { ServicepointLandingSummaryModifyButtonProps } from "../types/general";
import { useAppDispatch } from "../state/hooks";
import { setStartDate } from "../state/reducers/formSlice";
import { FRONT_URL_BASE } from "../types/constants";
import { getCurrentDate } from "../utils/utilFunctions";

// usage: modify button for ServicepointLandingSummary
const ServicepointLandingSummaryModifyButton = ({
  servicepointData,
  entranceData,
  hasData,
}: ServicepointLandingSummaryModifyButtonProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  // const curServicepointId = useAppSelector((state) => state.formReducer.currentServicepointId);
  const { servicepoint_id: curServicepointId } = servicepointData;
  // const curEntranceId = useAppSelector((state) => state.formReducer.currentEntranceId);
  const { entrance_id: curEntranceId } = entranceData || {};

  const handleEditorAddPointData = () => {
    if (entranceData) {
      const startedAnswering = getCurrentDate();
      dispatch(setStartDate(startedAnswering));
      const url = `${FRONT_URL_BASE}entranceAccessibility/${curServicepointId}/${curEntranceId}`;
      router.push(url);
    } else {
      // todo: todo (?)
      console.log("create servicepoint data clicked, todo create logic");
    }
  };

  return (
    <Button variant="primary" onClickHandler={handleEditorAddPointData}>
      {!hasData ? i18n.t("servicepoint.buttons.createServicepoint") : i18n.t("servicepoint.buttons.editServicepoint")}
    </Button>
  );
};

export default ServicepointLandingSummaryModifyButton;
