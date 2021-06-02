import React from "react";
import { IconArrowLeft } from "hds-react";
import styles from "./AdditionalInfoCtrlButtons.module.scss"
import QuestionButton from "./QuestionButton";
import { useI18n } from "next-localization";

const AdditionalInfoCtrlButtons = (): JSX.Element => {
    const i18n = useI18n();
    return (
        <div className={styles.maincontainer}>
            <QuestionButton variant="secondary" iconLeft={<IconArrowLeft/>}>{i18n.t("common.buttons.saveAndReturn")}</QuestionButton>
            <span className={styles.noborderbutton}>
                <QuestionButton variant="secondary">{i18n.t("common.buttons.returnNoSave")}</QuestionButton>
            </span>
        </div>
    )

}

export default AdditionalInfoCtrlButtons;