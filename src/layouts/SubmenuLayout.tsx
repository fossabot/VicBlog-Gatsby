import React from "react";
import HeaderFooterLayout from "@/layouts/HeaderFooterLayout";
import Page from "@/layouts/Page";
import { Row, Col, Nav as BSNav, NavItem, NavLink } from "reactstrap";
import { Link as GatsbyLink } from "gatsby";
import LocalizedString from "@/i18n/LocalizedString";
import styled from "styled-components";
import { colors } from "@/styles/variables";
import BannerLayout from "@/layouts/BannerLayout";
import { useStore } from "simstate";
import { LocationStore } from "@/stores/LocationStore";

interface NavPoint {
  textId: string;
  Icon: React.ComponentType;
  to: string;

}

interface Props {
  baseUrl: string;
  menuTextId: string;
  navPoints: NavPoint[];
  children: React.ReactNode;
}

export default function SubmenuLayout(props: Props) {

  const { pathname } = useStore(LocationStore);

  return (
    <HeaderFooterLayout transparentHeader={false}>
      <Page>
        <Row>

          <Col md={9}>
            {props.children}
          </Col>
          <Col md={3}>
            <Nav vertical={true}>
              {/* <MenuTitle><LocalizedString id={props.menuTextId} /></MenuTitle> */}
              {props.navPoints.map((link) => (
                <NavItem key={link.to} active={pathname.startsWith(props.baseUrl + link.to)}>
                  <Link className="nav-link" to={props.baseUrl + link.to}>
                    <link.Icon />
                    <LocalizedString id={link.textId} />
                  </Link>
                </NavItem>
              ))}
            </Nav>
          </Col>
        </Row>
      </Page>
    </HeaderFooterLayout>
  );

}

SubmenuLayout.Title = styled(BannerLayout.Title)`
  font-size: 40px;

`;

const Link = styled(GatsbyLink)`

  color: black;

  &:hover {
    cursor: pointer;
  }
`;

const MenuTitle = styled.h2`

  font-size: 20px;
  padding: 8px 16px;

`;

const Nav = styled(BSNav)`
  padding: 4px 8px;
  margin: 8px 0px;
  background-color: ${colors.extremelyLightGray};
`;
