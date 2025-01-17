import React from "react";
import { heights } from "@/styles/variables";

interface Props extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  targetAnchor: string;
}

function absoluteTopPosition(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const scrollTop = window.pageYOffset;
  return rect.top + scrollTop;
}

export default class ScrollLinkToAnchor extends React.PureComponent<Props> {

  smoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const element = document.getElementById(this.props.targetAnchor);

    if (element) {
      window.scroll({
        top: absoluteTopPosition(element) - heights.header,
        behavior: "smooth",
      });

    }

    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }
  render() {
    const { targetAnchor, ...rest } = this.props;
    return (
      <a {...rest} onClick={this.smoothScroll} />
    );
  }
}
