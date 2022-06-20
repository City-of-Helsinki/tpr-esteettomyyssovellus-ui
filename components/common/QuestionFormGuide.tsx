import { useI18n } from "next-localization";
import { IconClock, IconPenLine, IconPersonWheelchair, Link as HdsLink } from "hds-react";
import { LanguageLocales } from "../../types/constants";
import { QuestionFormGuideProps } from "../../types/general";
import styles from "./QuestionFormGuide.module.scss";

// usage: Question form help guide at top of page
const QuestionFormGuide = ({ formGuideData }: QuestionFormGuideProps): JSX.Element => {
  const i18n = useI18n();
  const curLocale: string = i18n.locale();
  const curLocaleId: number = LanguageLocales[curLocale as keyof typeof LanguageLocales];

  const filteredGuide = formGuideData.filter((guide) => guide.language_id === curLocaleId).sort((a, b) => a.guide_id - b.guide_id);

  return (
    <div className={styles.maincontainer}>
      {filteredGuide.map((guide) => {
        const { guide_id, guide_icon, guide_title, guide_url, description } = guide;
        const key = guide_id;

        let icon;
        switch (guide_icon) {
          case "clock": {
            icon = <IconClock />;
            break;
          }
          case "pen": {
            icon = <IconPenLine />;
            break;
          }
          case "wheelchair": {
            icon = <IconPersonWheelchair />;
            break;
          }
        }

        return (
          <div key={key} className={styles.card}>
            {icon}
            <p>{description ?? ""}</p>

            {guide_url && (
              <HdsLink
                href={guide_url}
                size="M"
                openInNewTab
                openInNewTabAriaLabel={i18n.t("common.opensInANewTab")}
                external
                openInExternalDomainAriaLabel={i18n.t("common.opensExternal")}
                disableVisitedStyles
              >
                {guide_title ?? ""}
              </HdsLink>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuestionFormGuide;
