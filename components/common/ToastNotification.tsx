import React, { Dispatch, ReactElement, SetStateAction } from "react";
import { useI18n } from "next-localization";
import { Notification as HdsNotification } from "hds-react";
import { Toast } from "../../types/constants";

interface NoticeProps {
  prefix: string;
  toast: Toast;
  setToast: Dispatch<SetStateAction<Toast | undefined>>;
}

const ToastNotification = ({
  prefix,
  toast,
  setToast,
}: NoticeProps): ReactElement => {
  const i18n = useI18n();

  const cleanupToast = () => {
    setToast(undefined);
  };

  return toast ? (
    <HdsNotification
      position="top-right"
      label={i18n.t(`${prefix}.message.${toast}.title`)}
      type={toast === Toast.SaveSucceeded ? "success" : "error"}
      closeButtonLabelText={i18n.t(`${prefix}.message.close`)}
      onClose={cleanupToast}
      autoClose
      dismissible
    >
      {i18n.t(`${prefix}.message.${toast}.message`)}
    </HdsNotification>
  ) : (
    <></>
  );
};

export default ToastNotification;
