# gatsby-source-strapi

This is a fork of [gatsby-source-strapi](https://github.com/strapi/gatsby-source-strapi) with a fix by ungagigd to add support for images embedded in markdown content. I also made some changes on top of ungagigd's changes to fix some bugs against the latest version of gatsby and make it usable easily for me. 

To use:
1. Clone this repo into the plugins directory of your gatsby site or add it as a git submodule under the plugins directory.
2. Add the node packages from this package.json to your site's package.json because the dependencies don't work properly when you don't install from npm. 
3. Add a block that looks like this to your gatsby-config.json file:

```
{
  resolve: 'gatsby-source-strapi',
  options: {
    apiURL: 'http://localhost:1337',
    contentTypes: ['post' ],
    queryLimit: 1000,
    markdownImages: {
      typesToParse: {
        post: ['content']  // here we specify that we only want to parse "content" field on "post" content-type
      }
    }
  }
}
```
