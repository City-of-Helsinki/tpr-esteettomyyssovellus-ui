import { IconAngleDown, IconAngleUp } from "hds-react";
import React, { useState } from "react";
import QuestionAdditionalInfoCtrlButton from "./QuestionAdditionalInfoCtrlButton";
import QuestionFormImportExistingData from "./QuestionFormImportExistingData";
import styles from "./QuestionBlock.module.scss"
import QuestionInfo from "./QuestionInfo";
import QuestionsList from "./QuestionsList";

const QuestionBlock = (): JSX.Element => {
    const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
    const handleAdditionalInfoToggle = () => {
      setShowAdditionalInfo(!showAdditionalInfo);
    };
    return (
        <>
            <div className={styles.mainInfo}>
            <p>
            PH: Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown
            main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän
            päädropdown main info. Tähän päädropdown main info.
            </p>
            <QuestionInfo
            openText="PH: näytä lisää pääsisäänkäynnin kulkureiteistä?"
            openIcon={<IconAngleDown aria-hidden />}
            closeText="PH: pienennä ohje"
            closeIcon={<IconAngleUp aria-hidden />}
            >
            PH: tähän LISÄpääinfot jostain tähän LISÄpääinfot jostain tähän
            </QuestionInfo>
        </div>
        <div className={styles.importAddinfoContainer}>
            {/* TODO: maybe add checking if should exist on all headline accs */}
            <QuestionFormImportExistingData />
            <QuestionAdditionalInfoCtrlButton curState={showAdditionalInfo} onClick={handleAdditionalInfoToggle} />
        </div>
        {/* TODO: add questions as params to QuestionsList, from fetch data */}
        <QuestionsList additionalInfoVisible={showAdditionalInfo} />
      </>
    )
}

export default QuestionBlock;