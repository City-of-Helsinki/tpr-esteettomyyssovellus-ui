import { useI18n } from "next-localization";
import { Button, Card, IconCrossCircle, IconQuestionCircle, useAccordion } from "hds-react";
import PathTreeComponent from "./PathTreeComponent";
import QuestionFormGuide from "./QuestionFormGuide";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { setHelpOpen } from "../../state/reducers/generalSlice";
import { PageHelpProps } from "../../types/general";
import styles from "./PageHelp.module.scss";

// usage: display help at top of page
const PageHelp = ({ formGuideData, treeItems }: PageHelpProps): JSX.Element => {
  const i18n = useI18n();
  const dispatch = useAppDispatch();

  const isHelpOpen = useAppSelector((state) => state.generalSlice.isHelpOpen);
  const { isOpen, buttonProps, contentProps } = useAccordion({ initiallyOpen: isHelpOpen });

  const handleToggleContent = () => {
    dispatch(setHelpOpen(!isOpen));
    buttonProps.onClick();
  };

  return (
    <div className={styles.helpcontainer}>
      <div id="help" className={styles.pagehelp}>
        <div>
          <PathTreeComponent treeItems={treeItems} />
        </div>
        <div className={styles.helpbutton}>
          <Button
            variant={isOpen ? "secondary" : "primary"}
            iconLeft={isOpen ? <IconCrossCircle aria-hidden /> : <IconQuestionCircle aria-hidden />}
            {...buttonProps}
            onClick={handleToggleContent}
          >
            {i18n.t("common.generalMainInfoIsClose")}
          </Button>
        </div>
      </div>
      <Card className={styles.contentcontainer} {...contentProps}>
        <QuestionFormGuide formGuideData={formGuideData} />
      </Card>
    </div>
  );
};

export default PageHelp;
