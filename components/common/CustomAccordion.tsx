import React from "react";
import { Button, Card, IconAngleDown, IconAngleUp, useAccordion } from "hds-react";
import styles from "./CustomAccordion.module.scss";

interface CustomAccordionProps {
  className?: string;
  heading: string;
  children: JSX.Element;
}

const CustomAccordion = ({ className, heading, children }: CustomAccordionProps) => {
  const { isOpen, buttonProps, contentProps, toggleAccordion } = useAccordion({ initiallyOpen: false });

  // Change icon based on accordion open state
  const icon = isOpen ? <IconAngleUp aria-hidden /> : <IconAngleDown aria-hidden />;

  // For custom toggle and firing event resize for the leaflet maps to render properly
  // if they are hidden and no rerender/window event is triggered they will render poorly
  const handleOnClickAccordions = () => {
    toggleAccordion();
    window.dispatchEvent(new Event("resize"));
  };

  return (
    <div className={`${styles.maincontainer} ${className}`}>
      <Button {...buttonProps} iconRight={icon} fullWidth onClick={() => handleOnClickAccordions()}>
        {heading}
      </Button>
      <Card className={styles.contentcontainer} {...contentProps}>
        {children}
      </Card>
    </div>
  );
};

export default CustomAccordion;
