import * as React from "react";
import { navigate } from "gatsby";
import ArticleItem from "@/components/ArticleItem";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";
import styled from "styled-components";
import { ArticleNode } from "@/models/ArticleNode";
import { range } from "@/utils/Array";
import BlogIntroCard from "@/components/cards/BlogIntroCard";
import SelfIntroCard from "@/components/cards/SelfIntroCard";
import withStores, { WithStoresProps } from "@/stores/withStores";
import { I18nStore } from "@/stores/I18nStore";
import { ArticleStore } from "@/stores/ArticleStore";
import Page from "@/layouts/components/Page";
import { Row, Col } from "reactstrap";
import StatisticsCard from "@/components/cards/StatisticsCard";
import Helmet from "react-helmet";


interface Props extends WithStoresProps {
  pageContext: {
    index: number;
    pageCount: number;
    ids: string[];
  };
}

const Sidebar = styled.div`
  & > * {
    margin-bottom: 8px;
  }

`;

function toPage(pageIndex: number) {
  const path = "/" + (pageIndex === 1 ? "" : pageIndex);
  return () => navigate(path);
}

function PageIndicator(props: { pageCount: number, current: number }) {
  const { pageCount, current } = props;

  return (
    <Pagination aria-label="Page">
      <PaginationItem>
        <PaginationLink disabled={current === 1} previous={true} onClick={toPage(current - 1)} />
      </PaginationItem>
      {range(1, pageCount + 1).map((x) =>
        <PaginationItem active={current === x} key={x}>
          <PaginationLink onClick={toPage(x)}>
            {x}
          </PaginationLink>
        </PaginationItem>
      )}
      <PaginationItem>
        <PaginationLink disabled={current === pageCount} next={true} onClick={toPage(current + 1)} />
      </PaginationItem>
    </Pagination>
  );
}

export default withStores(I18nStore, ArticleStore)(function Index(props: Props) {
  const { pageCount, index, ids } = props.pageContext;
  const { language, allLanguages } = props.useStore(I18nStore);
  const articleStore = props.useStore(ArticleStore);

  const items = ids.map((id) => {
    return articleStore.state.articleGroups[id];
  });

  return (
    <Page>
      <Helmet meta={[
        { name: "og:title", content: "VicBlog" },
        { name: "og:url", content: articleStore.state.baseUrl },
        { name: "og:site_name", content: "VicBlog" },
        { name: "og:locale", content: language.detailedId },
        ...allLanguages
          .filter((x) => x !== language)
          .map((x) => ({
            name: "og:locale:alternate",
            content: x.detailedId
          }))
      ]} />
      <Row>
        <Col md={8} xs={12}>
          <div className="blog-posts">
            {items
              .map((nodes) => {
                const node = articleStore.getNodeFromLang(nodes[0].frontmatter.id, language);
                return (
                  <ArticleItem article={node} key={node.frontmatter.id}/>
                );

              })
            }
            <PageIndicator pageCount={pageCount} current={index} />
          </div>
        </Col>
        <Col md={4} xs={12}>
          <Sidebar>
            <BlogIntroCard />
            <SelfIntroCard />
            <StatisticsCard />
          </Sidebar>
        </Col>
      </Row>
    </Page>
  );
});
