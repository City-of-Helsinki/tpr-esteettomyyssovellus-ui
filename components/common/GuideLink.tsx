import { useI18n } from "next-localization";
import { Link as HdsLink } from "hds-react";
import { GuideLinkProps } from "../../types/general";

// usage: Help guide link
const GuideLink = ({ guideTitle, guideUrl }: GuideLinkProps): JSX.Element => {
  const i18n = useI18n();

  return guideUrl ? (
    <HdsLink
      href={guideUrl}
      size="M"
      openInNewTab
      openInNewTabAriaLabel={i18n.t("common.opensInANewTab")}
      external
      openInExternalDomainAriaLabel={i18n.t("common.opensExternal")}
      disableVisitedStyles
    >
      {guideTitle ?? ""}
    </HdsLink>
  ) : (
    <></>
  );
};

export default GuideLink;
