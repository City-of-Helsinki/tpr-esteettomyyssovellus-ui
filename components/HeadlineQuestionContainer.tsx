import React from "react";
import { useAccordion, Button, IconMinus, IconPlus, IconCheckCircleFill, Card, IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import { HeadlineQuestionContainerProps } from "../types/general";
import styles from "./HeadlineQuestionContainer.module.scss";
import { useAppSelector } from "../state/hooks";

// usage: used for mainlevel (blue) accordions in form
const HeadlineQuestionContainer = ({ text, number, initOpen = false, children, isValid, id = "" }: HeadlineQuestionContainerProps): JSX.Element => {
  const i18n = useI18n();

  // Handle accordion state with useAccordion hook
  const { isOpen, buttonProps, contentProps, toggleAccordion } = useAccordion({
    initiallyOpen: initOpen,
  });
  const curFinishedBlocks = useAppSelector((state) => state.formReducer.finishedBlocks);
  // const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  const curInvalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);

  // Change icon based on accordion open state
  const iconRight = isOpen ? <IconMinus aria-hidden /> : <IconPlus aria-hidden />;
  let iconLeft = curFinishedBlocks.includes(Number(number)) ? <IconCheckCircleFill aria-label={i18n.t("common.message.valid")} /> : null;
  iconLeft = !isValid ? <IconAlertCircle className={styles.invalidIcon} aria-label={i18n.t("common.message.invalid")} /> : iconLeft;
  let buttonVariant: "primary" | "secondary" | "danger" = isOpen ? "primary" : "secondary";
  buttonVariant = number !== undefined && curInvalidBlocks.includes(number) && isOpen ? "danger" : buttonVariant;

  // for custom toggle and firing event resize for the leaflet maps to render properly
  // if they are hidden and no rerender/window event is triggered they will render poorly
  const handleOnClickAccordions = () => {
    toggleAccordion();
    window.dispatchEvent(new Event("resize"));
  };

  return (
    <section className={styles.headline} id={id} aria-label={text}>
      <Button
        id={`headlineButton-${number}`}
        {...buttonProps}
        iconRight={iconRight}
        variant={buttonVariant}
        fullWidth
        className={styles.headlineButton}
        onClick={() => handleOnClickAccordions()}
      >
        <div className={styles.blockHeadline}>
          <div className={styles.heading}>{text}</div>
          <div>{iconLeft}</div>
        </div>
      </Button>

      <Card {...contentProps} className={styles.card}>
        {children}
      </Card>
    </section>
  );
};

export default HeadlineQuestionContainer;
