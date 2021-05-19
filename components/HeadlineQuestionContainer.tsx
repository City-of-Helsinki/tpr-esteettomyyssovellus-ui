import React, { useState } from "react";
import { useAccordion, Button, IconAngleUp, IconAngleDown, IconMinus, IconPlus, Card } from "hds-react";
import { HeadlineQuestionContainerProps } from "../types/general";
import styles from "./HeadlineQuestionContainer.module.scss";

import QuestionsList from "./QuestionsList";
import QuestionInfo from "./QuestionInfo";
import QuestionFormImportExistingData from "./QuestionFormImportExistingData";

// used for mainlevel blue accordions
const HeadlineQuestionContainer = ({ headline }: HeadlineQuestionContainerProps): JSX.Element => {
  // Handle accordion state with useAccordion hook
  const { isOpen, buttonProps, contentProps } = useAccordion({ initiallyOpen: false });
  // Change icon based on accordion open state
  const icon = isOpen ? <IconMinus aria-hidden /> : <IconPlus aria-hidden />;
  const buttonVariant = isOpen ? "primary" : "secondary";
  const [showMainInfo, setShotMainInfo] = useState(false);
  const handleToggleMainInfo = () => {
    setShotMainInfo(!showMainInfo);
  };
  return (
    // TODO: define unique id (?)
    <div className={styles.headline}>
      <Button id="headlineButton" {...buttonProps} iconRight={icon} variant={buttonVariant} fullWidth className={styles.headlineButton}>
        <p>{headline}</p>
      </Button>
      <Card aria-label="Advanced filters" {...contentProps} className={styles.card}>
        <div className={styles.mainInfo}>
          <p>
            PH: Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown
            main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän päädropdown main info. Tähän
            päädropdown main info. Tähän päädropdown main info.
          </p>
          <QuestionInfo
            questionInfo="PH: tähän LISÄpääinfot jostain  tähän LISÄpääinfot jostain  tähän"
            showInfoText={showMainInfo}
            clickHandler={handleToggleMainInfo}
            openText="PH: näytä lisää pääsisäänkäynnin kulkureiteistä?"
            openIcon={<IconAngleDown aria-hidden />}
            closeText="PH: pienennä ohje"
            closeIcon={<IconAngleUp aria-hidden />}
          />
        </div>
        <div>
          {/* TODO: maybe add checking if should exist on all headline accs */}
          <QuestionFormImportExistingData />
        </div>
        {/* TODO: add questions as params to QuestionsList, from fetch data */}
        <QuestionsList />
      </Card>
    </div>
  );
};

export default HeadlineQuestionContainer;
