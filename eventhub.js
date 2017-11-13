module.exports = function(RED) {

    function EventHubConfigNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.config = Object.assign({}, config, node.credentials);
    }

    RED.nodes.registerType('predix-eventhub-config', EventHubConfigNode, {
      credentials: {
        clientId: { type: 'text' },
        clientSecret: { type: 'password' },
      }
    });

    function EventHubSubscribeNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.server = RED.nodes.getNode(config.server);
        const options = Object.assign({}, node.server.config, config);

        // Subscribe to eventhub
        const Subscriber = require('predix-eventhub-client').Subscriber;
        const sub = new Subscriber(options);

        console.log('Subscribing...');

        sub.registerCallback((err, body, data) => {
          if (err) {
            console.log('Got Error', err);
            return;
          }
          node.send({ payload: body, tags: data.tags, raw: data });
        });
    }

    RED.nodes.registerType('predix-eventhub-subscriber', EventHubSubscribeNode);

    function EventHubPublishNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        node.server = RED.nodes.getNode(config.server);

        // Publish to eventhub
        const Publisher = require('predix-eventhub-client').Publisher;
        const pub = new Publisher(node.server.config);
        node.on('input', msg => {
          console.log('Input:', msg);
          pub.postEvent(msg.payload, msg.tags);
        });
    }

    RED.nodes.registerType('predix-eventhub-publisher', EventHubPublishNode);
}
