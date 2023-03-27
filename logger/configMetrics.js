// Set up Metrics client using StatsD
const StatsD = require("node-statsd");

const metricsClient = new StatsD();

module.exports = metricsClient;