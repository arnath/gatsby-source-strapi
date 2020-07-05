const createNodeHelpers = require('gatsby-node-helpers').default

const { createNodeFactory } = createNodeHelpers({
  typePrefix: 'Strapi',
})

exports.Node = (type, node) =>
  createNodeFactory(type, node => {
    node.id = `${type}_${node.strapiId}`
    return node
  })(node)
