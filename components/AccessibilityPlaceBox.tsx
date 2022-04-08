import React from "react";
import { useI18n } from "next-localization";
import { AccessibilityPlaceBoxProps } from "../types/general";
// import AccessibilityPlaceLocation from "./AccessibilityPlaceLocation";
import AccessibilityPlacePicture from "./AccessibilityPlacePicture";
import styles from "./AccessibilityPlaceBox.module.scss";
import { Button, IconArrowDown, IconArrowUp, IconCross } from "hds-react";

// usage: grouping one set of picture and location in accessibility place form
const AccessibilityPlaceBox = ({ entrancePlaceBox }: AccessibilityPlaceBoxProps): JSX.Element => {
  const i18n = useI18n();

  const { order_number } = entrancePlaceBox;

  return (
    <div className={styles.maincontainer}>
      <div className={styles.headingcontainer}>
        <div className={styles.headingsection}>
          <div className={`${styles.headertext} ${styles.ordernumber}`}>{order_number}</div>
          <div className={styles.headertext}>{`${i18n.t("additionalInfo.additionalInfoSet")} ${order_number}`}</div>
        </div>

        <div className={`${styles.headingsection} ${styles.rightsection}`}>
          <div>{i18n.t("additionalInfo.order")}</div>
          <Button variant="supplementary" iconLeft={<IconArrowUp />}>
            {""}
          </Button>
          <Button variant="supplementary" iconLeft={<IconArrowDown />}>
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
