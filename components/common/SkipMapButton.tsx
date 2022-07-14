import React from "react";
import { useI18n } from "next-localization";
import { Button, IconPlaybackNext } from "hds-react";
import { SkipMapButtonProps } from "../../types/general";
import styles from "./SkipMapButton.module.scss";

// usage: accessibility component to allow keyboard users to skip over a map
const SkipMapButton = ({ idToSkipTo }: SkipMapButtonProps): JSX.Element => {
  const i18n = useI18n();

  const skipMap = () => {
    window.location.href = idToSkipTo;
  };

  return (
    <Button
      variant="supplementary"
      size="small"
      className={`${styles.skipMapButton} visibleOnFocusOnly`}
      iconRight={<IconPlaybackNext aria-hidden />}
      onClick={skipMap}
    >
      {i18n.t("common.map.skipMap")}
    </Button>
  );
};

export default SkipMapButton;
