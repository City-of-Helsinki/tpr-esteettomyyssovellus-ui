// this files code from marketing project: needs editing or deleting

import React, { ReactElement, ReactNode, useEffect, useRef } from "react";
import { useI18n } from "next-localization";
import styles from "./Notice.module.scss";

interface NoticeProps {
  className?: string;
  icon: ReactNode;
  titleKey?: string;
  messageKey: string;
  button?: ReactNode;
  focusOnTitle?: boolean;
}

// usage: not yet used anywhere, todo: remove if not used
// notes: imported from marketing project
const Notice = ({
  className,
  icon,
  titleKey,
  messageKey,
  button,
  focusOnTitle,
}: NoticeProps): ReactElement => {
  const i18n = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusOnTitle && ref.current) {
      ref.current.scrollIntoView();
      ref.current.focus();
    }
  });

  return (
    <div className={`${styles.notice} ${className}`}>
      <div className={styles.flexText}>
        <div className={styles.icon}>{icon}</div>
        <div className={styles.text}>
          <div
            className={styles.title}
            ref={focusOnTitle ? ref : undefined}
            tabIndex={focusOnTitle ? -1 : undefined}
          >
            {i18n.t(titleKey as string)}
          </div>
          <div className={styles.message}>{i18n.t(messageKey)}</div>
        </div>
      </div>
      <div className={styles.flexButtonContainer}>
        <div className={styles.flexButton}>{button}</div>
      </div>
    </div>
  );
};

Notice.defaultProps = {
  className: undefined,
  titleKey: "",
  button: undefined,
  focusOnTitle: false,
};

export default Notice;
