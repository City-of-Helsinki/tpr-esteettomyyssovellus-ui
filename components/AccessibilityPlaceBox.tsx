import React from "react";
import { useI18n } from "next-localization";
import { Button, IconArrowDown, IconArrowUp, IconCross } from "hds-react";
import { useAppDispatch } from "../state/hooks";
import { changeEntrancePlaceBoxOrder } from "../state/reducers/additionalInfoSlice";
import { AccessibilityPlaceBoxProps } from "../types/general";
// import AccessibilityPlaceLocation from "./AccessibilityPlaceLocation";
import AccessibilityPlacePicture from "./AccessibilityPlacePicture";
import styles from "./AccessibilityPlaceBox.module.scss";

// usage: grouping one set of picture and location in accessibility place form
const AccessibilityPlaceBox = ({ entrancePlaceBox }: AccessibilityPlaceBoxProps): JSX.Element => {
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

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headingcontainer}>
        <div className={styles.headingsection}>
          <div className={`${styles.headertext} ${styles.ordernumber}`}>{order_number}</div>
          <div className={styles.headertext}>{`${i18n.t("additionalInfo.additionalInfoSet")} ${order_number}`}</div>
        </div>

        <div className={`${styles.headingsection} ${styles.rightsection}`}>
          <div>{i18n.t("additionalInfo.order")}</div>
          <Button variant="supplementary" iconLeft={<IconArrowUp />} onClick={() => changeBoxOrder(-1)}>
            {""}
          </Button>
          <Button variant="supplementary" iconLeft={<IconArrowDown />} onClick={() => changeBoxOrder(1)}>
            {""}
          </Button>
          <Button variant="supplementary" iconLeft={<IconCross />}>
            {""}
          </Button>
        </div>
      </div>

      <div className={styles.contentcontainer}>
        <div>
          <div className={styles.contentheader}>{`${i18n.t("additionalInfo.pictureTitle")} ${order_number}`}</div>
          <AccessibilityPlacePicture entrancePlaceBox={entrancePlaceBox} />
        </div>

        <div>
          <div className={styles.contentheader}>{`${i18n.t("additionalInfo.locationTitle")} ${order_number}`}</div>
          {/*<AccessibilityPlaceLocation entrancePlaceBox={entrancePlaceBox} />*/}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPlaceBox;
