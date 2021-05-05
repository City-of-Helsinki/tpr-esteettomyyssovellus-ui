// this files code from marketing project: needs editing or deleting

import React, { ReactElement } from "react";
import { useI18n } from "next-localization";
import { Button } from "hds-react";
// import { Dialog } from "@material-ui/core";
import styles from "./ModalConfirmation.module.scss";

interface ModalConfirmationProps {
  open: boolean;
  titleKey?: string;
  messageKey: string;
  cancelKey: string;
  confirmKey: string;
  closeCallback: () => void;
  confirmCallback: () => void;
}

const ModalConfirmation = ({
  open,
  closeCallback,
  titleKey,
  messageKey,
  cancelKey,
  confirmKey,
  confirmCallback,
}: ModalConfirmationProps): ReactElement => {
  const i18n = useI18n();

  return (
    <>
      <h2>Modal confirmation dialog</h2>
    </>
    // <Dialog open={open} onClose={closeCallback}>
    //   <div className={styles.dialog}>
    //     <div className={styles.title}>{i18n.t(titleKey as string)}</div>
    //     <div>{i18n.t(messageKey)}</div>
    //     <div className={styles.buttons}>
    //       <Button variant="secondary" onClick={closeCallback}>
    //         {i18n.t(cancelKey)}
    //       </Button>
    //       <div className="flexSpace" />
    //       <Button onClick={confirmCallback}>{i18n.t(confirmKey)}</Button>
    //     </div>
    //   </div>
    // </Dialog>
  );
};

ModalConfirmation.defaultProps = {
  titleKey: "",
};

export default ModalConfirmation;
