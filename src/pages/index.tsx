import React from "react";

import styled from "styled-components";
import { heights } from "@/styles/variables";
import Contacts from "@/components/Contacts";
import { RootContainer, InnerContainer } from "@/layouts/LayeredLayout";
import Particles from "@/components/Particles";
import bgImg from "~/assets/mainbg.jpg";
import lang from "@/i18n/lang";
import LocalizedString from "@/i18n/LocalizedString";
import { Button } from "reactstrap";
import { FaFile, FaInfo, FaBookOpen, FaGithub, FaMailBulk, FaRegCommentDots } from "react-icons/fa";
import { Link } from "gatsby";
import { I18nStore } from "@/stores/I18nStore";
import { useStore } from "simstate";
import { MetadataStore } from "@/stores/MetadataStore";

interface Props {

}

const titleHeight = 376;

const Title = styled(RootContainer)`
  height: ${titleHeight}px;
`;

const ImgContainer = styled(InnerContainer)`
  height: ${titleHeight}px;
  width: 100%;
  z-index: 1;

  overflow-x: hidden;
  overflow-y: hidden;

  img {
    width: 100%;
  }
`;

const ParticlesContainer = styled(InnerContainer)`

  height: 100%;
  z-index: 2;
`;

const TextContent = styled(InnerContainer)`
  z-index: 3;
  color: white;
  text-align: center;

  margin-top: 100px;
`;

const TitleText = styled.h1`
   padding: 12px 0;

`;

const Slogan = styled.h4`
  padding: 12px 0;
`;

const LinkContainer = styled.div`
   padding: 12px 0;

  & > * {
    margin-right: 4px;  
  }
`;

const root = lang.homepage;

export default function HomePage(props: Props) {

  const i18nStore = useStore(I18nStore);
  const metadataStore = useStore(MetadataStore);

  return (
    <div>
      <Title>
        <ImgContainer>
          <img src={bgImg}/>
        </ImgContainer>
        {/*<ParticlesContainer>*/}
        {/*  <Particles marginTop={heights.header}*/}
        {/*             height={titleHeight}*/}
        {/*  />*/}
        {/*</ParticlesContainer>*/}
        <TextContent>
          <TitleText><LocalizedString id={selectDate()}/></TitleText>
          <Slogan><LocalizedString id={root.from}/></Slogan>
          <LinkContainer>
            <Link className={"btn btn-info"} to={"/articles"}>
              <FaBookOpen/><LocalizedString id={root.links.articles}/>
            </Link>
            <Link className={"btn btn-info"} to={metadataStore.getArticleOfLang("resume", i18nStore.language).path}>
              <FaFile/><LocalizedString id={root.links.resume}/>
            </Link>
            <Link className={"btn btn-info"} to={metadataStore.getArticleOfLang("feedback", i18nStore.language).path}>
              <FaRegCommentDots />
              <LocalizedString id={root.links.feedback}/>
            </Link>
          </LinkContainer>
        </TextContent>
      </Title>
    </div>
  );
}

function selectDate(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 11) {
    return root.morning;
  } else if (hour >= 12 && hour <= 17) {
    return root.afternoon;
  } else {
    return root.evening;
  }
}