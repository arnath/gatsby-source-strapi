const axios = require('axios')
const { capitalize } = require('lodash')
const fetchData = require('./fetch')
const { Node } = require('./nodes')
const normalize = require('./normalize')
const authentication = require('./authentication')

exports.sourceNodes = async (
  { store, actions, cache, reporter, getNode, getNodes, createNodeId },
  {
    apiURL = 'http://localhost:1337',
    contentTypes = [],
    singleTypes = [],
    loginData = {},
    queryLimit = 100,
    markdownImages = {},
  }
) => {
  const { createNode, deleteNode, touchNode } = actions

  // Authentication function
  let jwtToken = await authentication({ loginData, reporter, apiURL })

  // Start activity, Strapi data fetching
  const fetchActivity = reporter.activityTimer(`Fetched Strapi Data`)
  fetchActivity.start()

  // Generate a list of promises based on the `contentTypes` option.
  const contentTypePromises = contentTypes.map(contentType =>
    fetchData({
      apiURL,
      contentType,
      jwtToken,
      queryLimit,
      reporter,
    })
  )

  // Generate a list of promises based on the `singleTypes` option.
  const singleTypePromises = singleTypes.map(singleType =>
    fetchData({
      apiURL,
      singleType,
      jwtToken,
      queryLimit,
      reporter,
    })
  )

  // Execute the promises
  let entities = await Promise.all([
    ...contentTypePromises,
    ...singleTypePromises,
  ])

  // Creating files
  entities = await normalize.downloadMediaFiles({
    entities,
    apiURL,
    store,
    cache,
    createNode,
    createNodeId,
    touchNode,
    jwtToken,
    options: {
      allTypes: contentTypes.concat(singleTypes),
      markdownImages,
    },
  })

  // new created nodes
  let newNodes = []

  // Fetch existing strapi nodes
  const existingNodes = getNodes().filter(
    n => n.internal.owner === `gatsby-source-strapi`
  )

  // Touch each one of them
  existingNodes.forEach(n => {
    touchNode({ nodeId: n.id })
  })

  // Merge single and content types and retrieve create nodes
  contentTypes.concat(singleTypes).forEach((contentType, i) => {
    const items = entities[i]
    items.forEach((item, i) => {
      const node = Node(capitalize(contentType), item)
      // Adding new created nodes in an Array
      newNodes.push(node)

      // Create nodes
      createNode(node)
    })
  })

  // Make a diff array between existing nodes and new ones
  const diff = existingNodes.filter(
    ({ id: id1 }) => !newNodes.some(({ id: id2 }) => id2 === id1)
  )

  // Delete diff nodes
  diff.forEach(data => {
    deleteNode({ node: getNode(data.id) })
  })

  fetchActivity.end()
}