var config = require('../../config/qman');
var RestClient = require('node-rest-client').Client;
var queryString = require('query-string');

var restClientOptions = { 
    user: config.authUsername, 
    password: config.authPassword
  };
  
var restClient = new RestClient(restClientOptions);


module.exports.findLocations = function(callback){
    return restClient.get(config.baseURL + "/location", callback);
}

module.exports.findAllTickets = function(callback){
    return restClient.get(config.baseURL + "/ticket", callback);
}

module.exports.findTickets = function(params, callback){
    return restClient.get(config.baseURL + "/ticket/?" + queryString.stringify(params), callback);
}

module.exports.findTicketsByTime = function(params, callback){
    return restClient.get(config.baseURL + "/ticket/time?" + queryString.stringify(params), callback);
}

module.exports.findLocationById = function(id, callback){
    return restClient.get(config.baseURL + "/location/" + id, callback);
}

module.exports.findTicketsForEscalation = function(params, callback){
    return restClient.get(config.baseURL + "/ticket/time?" + queryString.stringify(params), callback);
}

module.exports.findServices = function(callback){
    return restClient.get(config.baseURL + "/service", callback);
}

module.exports.findServiceById = function(serviceId, callback){
    return restClient.get(config.baseURL + "/service/" + serviceId, callback);
}

module.exports.findInteractions = function(callback){
    return restClient.get(config.baseURL + "/interaction", callback);
}

module.exports.findInteractionById = function(interactionId, callback){
    return restClient.get(config.baseURL + "/interaction/" + interactionId, callback);
}

module.exports.findQueues = function(callback){
    return restClient.get(config.baseURL + "/queue", callback);
}

module.exports.findQueueById = function(queueId, callback){
    return restClient.get(config.baseURL + "/queue/" + queueId, callback);
}