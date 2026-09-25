import React from "react";
import { useAccordion, Button, ButtonVariant, IconMinus, IconPlus, IconCheckCircleFill, Card, IconAlertCircle } from "hds-react";
import { useI18n } from "next-localization";
import { HeadlineQuestionContainerProps } from "../types/general";
import styles from "./HeadlineQuestionContainer.module.scss";
import { useAppSelector } from "../state/hooks";

// usage: used for mainlevel (blue) accordions in form
function HeadlineQuestionContainer({ text, questionBlockId, initOpen = false, children, isValid }: HeadlineQuestionContainerProps): JSX.Element {
  const i18n = useI18n();
  const headlineText = text ?? "";

  // Handle accordion state with useAccordion hook
  const { isOpen, buttonProps, contentProps, toggleAccordion } = useAccordion({
    initiallyOpen: initOpen,
  });
  const curFinishedBlocks = useAppSelector((state) => state.formReducer.finishedBlocks);
  // const isContinueClicked = useAppSelector((state) => state.formReducer.isContinueClicked);
  const curInvalidBlocks = useAppSelector((state) => state.formReducer.invalidBlocks);

  // Change icon based on accordion open state
  const accordionIcon = isOpen ? <IconMinus aria-hidden /> : <IconPlus aria-hidden />;
  let statusIcon = curFinishedBlocks.includes(Number(questionBlockId)) ? <IconCheckCircleFill aria-label={i18n.t("common.message.valid")} /> : null;
  statusIcon = !isValid ? <IconAlertCircle className={styles.invalidIcon} aria-label={i18n.t("common.message.invalid")} /> : statusIcon;
  let buttonVariant: ButtonVariant.Primary | ButtonVariant.Secondary | ButtonVariant.Danger = isOpen
    ? ButtonVariant.Primary
    : ButtonVariant.Secondary;
  buttonVariant = questionBlockId !== undefined && curInvalidBlocks.includes(questionBlockId) && isOpen ? ButtonVariant.Danger : buttonVariant;
  const iconEnd = (
    <>
      {statusIcon}
      {accordionIcon}
    </>
  );

  // for custom toggle and firing event resize for the leaflet maps to render properly
  // if they are hidden and no rerender/window event is triggered they will render poorly
  const handleOnClickAccordions = () => {
    toggleAccordion();
    window.dispatchEvent(new Event("resize"));
  };

  return (
    <section className={`${styles.headline} accordion-headline`} id={`questionblockid-${questionBlockId}`} aria-label={headlineText}>
      <Button
        id={`headlinebutton-${questionBlockId}`}
        {...buttonProps}
        iconEnd={iconEnd}
        variant={buttonVariant}
        fullWidth
        className={styles.headlineButton}
        onClick={() => handleOnClickAccordions()}
      >
        {headlineText}
      </Button>

      <Card {...contentProps} className={styles.card}>
        {children}
      </Card>
    </section>
  );
}

export default HeadlineQuestionContainer;
