"use strict"

const dayjs = require("dayjs");

const path = require("path");

module.exports = {
  siteMetadata: {
    title: 'VicBlog',
    description: 'A personal blog',
    siteUrl: 'https://viccrubs.me',
    author: {
      name: 'Chen Junda',
      url: 'https://viccrubs.me',
      email: 'smallda@outlook.com'
    },
    lastUpdated: dayjs().format(),
  },
  plugins: [
    'gatsby-plugin-typescript',
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        includePaths: [path.join(__dirname, "src/styles")],
      },
    },
    {
      resolve: 'gatsby-plugin-styled-components',
      options: {
        minify: true,
      },
    },
    {
      resolve: 'gatsby-source-apiserver',
      options: {
        // Type prefix of entities from server
        typePrefix: '',

        // The url, this should be the endpoint you are attempting to pull data from
        url: `https://api.github.com/repos/viccrubs/Slides/contents/`,

        method: 'get',

        headers: {
          'Content-Type': 'application/json'
        },

        // Name of the data to be downloaded.  Will show in graphQL or be saved to a file
        // using this name. i.e. posts.json
        name: `slides`,

        // Nested level of entities in response object, example: `data.posts`
        entityLevel: ``,

        // Define schemaType to normalize blank values
        // example:
        // const postType = {
        //   id: 1,
        //   name: 'String',
        //   published: true,
        //   object: {a: 1, b: '2', c: false},
        //   array: [{a: 1, b: '2', c: false}]
        // }
        schemaType: {
          name: 'String',
          path: 'String',
          sha: 'String',
          size: 1,
          url: 'String',
          html_url: 'String',
          git_url: 'String',
          download_url: 'String',
          type: "String",
          _links: {
            self: "String",
            git: "String",
            html: "String",
          }
        },

      }
    },
    "gatsby-plugin-layout",
    {
      resolve: 'gatsby-plugin-root-import',
      options: {
        "@": path.join(__dirname, 'src'),
        "~": path.join(__dirname)
      }
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            query: `
            {
              allMarkdownRemark(
                limit: 1000,
                sort: { order: DESC, fields: [frontmatter___date] },
                filter: { frontmatter: { ignored_in_list: { ne: true } }}
              ) {
                edges {
                  node {
                    excerpt(pruneLength: 250, truncate: true)
                    html
                    frontmatter {
                      title
                      id
                      date
                      tags
                      lang
                    }
                  }
                }
              }
            }
          `,
            serialize: ({ query: { site, allMarkdownRemark } }) => {

              return allMarkdownRemark.edges.map(({ node }) => {
                const path = `${node.frontmatter.absolute_path || `/articles/${node.frontmatter.id}`}/${node.frontmatter.lang}`;
                return {
                  ...node.frontmatter,
                  description: node.excerpt,
                  url: path,
                  guid: path,
                  custom_elements: [{ "content:encoded": node.html }]
                }

              });
            },
            output: "/rss.xml",
            title: "VicBlog RSS",
          },
        ],
      },
    },
    'gatsby-plugin-catch-links',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'contents',
        path: `${__dirname}/contents`
      }
    },
    `gatsby-transformer-json`,
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-responsive-iframe',
            options: {
              wrapperStyle: 'margin-bottom: 1rem'
            }
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              inlineCodeMarker: "±",
            }
          },
          `gatsby-remark-emoji`,
          {
            resolve: 'gatsby-remark-copy-linked-files',
            options: {
              destinationDir: "static",
              // ignoreFileExtensions: [],
            }
          },
          'gatsby-remark-smartypants',
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 1140,
              quality: 90,
              showCaptions: true,
              linkImagesToOriginal: false
            }
          },

        ]
      }
    },
    'gatsby-transformer-json',
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: 'https://viccrubs.me'
      }
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        include: /assets/
      }
    },
    {
      resolve: `gatsby-plugin-nprogress`,
      options: {
        // Setting a color is optional.
        color: `#3498DB`,
        // Disable the loading spinner.
        showSpinner: false,
      }
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: "VicBlog",
        short_name: "VicBlog",
        start_url: "/",
        background_color: "#FFFFFF",
        theme_color: "#3498DB",
        display: "minimal-ui",
        icon: "assets/icon.png", // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-offline`,
    'gatsby-plugin-sitemap'
  ]
}
