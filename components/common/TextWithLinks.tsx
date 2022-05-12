import React from "react";
import { useI18n } from "next-localization";
import { Link as HdsLink } from "hds-react";
import { splitTextUrls } from "../../utils/utilFunctions";

interface TextWithLinksProps {
  text: string;
}

const TextWithLinks = ({ text }: TextWithLinksProps): JSX.Element => {
  const i18n = useI18n();

  const convertTextUrlsToLinks = () => {
    const splitUrls = splitTextUrls(text);

    return splitUrls.map((textOrLink) => {
      if (textOrLink.startsWith("http")) {
        // Link
        return (
          <HdsLink
            href={textOrLink}
            size="M"
            openInNewTab
            openInNewTabAriaLabel={i18n.t("common.opensInANewTab")}
            external
            openInExternalDomainAriaLabel={i18n.t("common.opensExternal")}
            disableVisitedStyles
          >
            {textOrLink}
          </HdsLink>
        );
      } else {
        // Text
        return textOrLink.trim();
      }
    });
  };

  return <p>{convertTextUrlsToLinks()}</p>;
};

export default TextWithLinks;
