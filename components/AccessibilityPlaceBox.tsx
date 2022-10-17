import React from "react";
import { useI18n } from "next-localization";
import { Button, IconArrowDown, IconArrowUp, IconCross } from "hds-react";
import SkipMapButton from "./common/SkipMapButton";
import { useAppDispatch } from "../state/hooks";
import { changeEntrancePlaceBoxOrder, deleteEntrancePlaceBox } from "../state/reducers/additionalInfoSlice";
import { AccessibilityPlaceBoxProps } from "../types/general";
import AccessibilityPlaceLocation from "./AccessibilityPlaceLocation";
import AccessibilityPlacePicture from "./AccessibilityPlacePicture";
import styles from "./AccessibilityPlaceBox.module.scss";

// usage: grouping one set of picture and location in accessibility place form
const AccessibilityPlaceBox = ({ entrancePlaceBox, entrancePlaceName, canAddLocation, isFirst, isLast }: AccessibilityPlaceBoxProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const { entrance_id, place_id, order_number } = entrancePlaceBox;

  const changeBoxOrder = (difference: number) => {
    dispatch(
      changeEntrancePlaceBoxOrder({
        entrance_id,
        place_id,
        order_number,
        difference,
      })
    );
  };

  const deleteBox = () => {
    dispatch(
      deleteEntrancePlaceBox({
        entrance_id,
        place_id,
        order_number,
      })
    );
  };

  return (
    <div className={styles.maincontainer}>
      <div id={`placebox-${order_number}`} className={styles.headingcontainer}>
        <div className={styles.headingsection}>
          <div className={`${styles.headertext} ${styles.ordernumber}`}>{`${order_number}. ${i18n.t("additionalInfo.additionalInfoSet")}`}</div>
          {/*<div className={styles.headertext}>{`${i18n.t("additionalInfo.additionalInfoSet")} ${order_number}`}</div>*/}
        </div>

        <div className={`${styles.headingsection} ${styles.rightsection}`}>
          <div>{i18n.t("additionalInfo.order")}</div>
          <Button
            variant="supplementary"
            iconLeft={<IconArrowUp aria-hidden />}
            aria-label={i18n.t("additionalInfo.orderButtons.moveUp")}
            onClick={() => changeBoxOrder(-1)}
            disabled={isFirst}
          >
            {""}
          </Button>
          <Button
            variant="supplementary"
            iconLeft={<IconArrowDown aria-hidden />}
            aria-label={i18n.t("additionalInfo.orderButtons.moveDown")}
            onClick={() => changeBoxOrder(1)}
            disabled={isLast}
          >
            {""}
          </Button>
          <Button
            variant="supplementary"
            iconLeft={<IconCross aria-hidden />}
            aria-label={i18n.t("additionalInfo.orderButtons.remove")}
            onClick={deleteBox}
          >
            {""}
          </Button>
        </div>
      </div>

      <div className={styles.contentcontainer}>
        <div role="group" aria-label={`${i18n.t("additionalInfo.pictureTitle")} ${order_number} - '${entrancePlaceName}'`}>
          <div className={styles.contentheader}>{`${i18n.t("additionalInfo.pictureTitle")} ${order_number} - '${entrancePlaceName}'`}</div>
          <AccessibilityPlacePicture entrancePlaceBox={entrancePlaceBox} />
        </div>

        {canAddLocation && (
          <div role="group" aria-label={`${i18n.t("additionalInfo.locationTitle")} ${order_number} - '${entrancePlaceName}'`}>
            <div className={styles.contentheader}>{`${i18n.t("additionalInfo.locationTitle")} ${order_number} - '${entrancePlaceName}'`}</div>
            <SkipMapButton idToSkipTo={`#placeinputcontainer-${order_number}`} />
            <AccessibilityPlaceLocation entrancePlaceBox={entrancePlaceBox} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityPlaceBox;
