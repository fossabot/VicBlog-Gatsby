import React from "react";
import { useStore } from "simstate";
import { LocationStore } from "@/stores/LocationStore";
import { MetadataStore } from "@/stores/MetadataStore";
import { I18nStore } from "@/stores/I18nStore";
import NavItem from "@/components/Header/NavItem";
import { usePageLink } from "@/stores/usePageLink";

interface Props {
  Icon: React.ComponentType;
  articleId: string;
  onClick?(): void;
  wrapper: "navItem" | "dropdownItem";
  textId: string;
}

export default function ArticleNavItem({ Icon, articleId, onClick, wrapper, textId }: Props) {

  const path = usePageLink(articleId);

  const targetPageUrlParts = path.split("/");
  targetPageUrlParts.pop();

  return (
    <NavItem
      wrapper={wrapper}
      onClick={onClick}
      Icon={Icon}
      match={(pathname) => pathname.startsWith(targetPageUrlParts.join("/"))}
      to={path}
      textId={textId}
    />
  );
}
