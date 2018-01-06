
var qman = require('../integrations/qman');
var moment = require('moment');

var KpiEscalationPoint = require('../models').KpiEscalationPoint;
var KpiEscalationContact = require('../models').KpiEscalationContact;

// Twilio Credentials 
var smsAccountSid = 'AC4bbfb2ea2f5ec74a907120abe9baf993'; 
var smsAuthToken = '3cbd906839bf548be156416329efcc16';
var smsSenderId = "+14158493922"; 

var twilio = require('twilio')(smsAccountSid, smsAuthToken);
 

module.exports.run = function(){
    setInterval(function(){
        var thisDate = new Date();

        qman.findTicketsForEscalation({
            start: moment.unix(moment().unix() - 60).format('YYYY-MM-DDTHH:mm:00'),
            //start: '2017-12-01T00:00:00',
            end: moment(new Date()).format('YYYY-MM-DDTHH:mm:00'),
            limit: 1000000
        }, function(ticketsData, response){
            if(ticketsData.length == 0){
                console.log('No new tickets for the last minute!');
                return;
            }

            if(ticketsData.forEach == undefined){
                console.log(ticketsData);
                return;
            }

            KpiEscalationPoint.findAll({
                where: {
                    status: 'ACTIVE'
                }
            }).then(function(escalationPoints){
                var escalationPointsLocationIds = [];
                var validTickets = [];

                escalationPoints.forEach(function(escalationPoint){
                    escalationPointsLocationIds.push(escalationPoint.qman_location_id);
                });

                validTickets = ticketsData.filter(function(ticketData){
                    var foundLocationId = false;

                    escalationPointsLocationIds.forEach(function(activeLocationId){
                        if(activeLocationId == ticketData.location_id){
                            foundLocationId = true;
                        }
                    });

                    if(foundLocationId){
                        return true;
                    }

                    return false;
                });
                
                validTickets.forEach(function(ticket){
                    
                    if(ticket.start != null || ticket.start != undefined){
                        return;
                    }
                    
                    var localDate = moment().unix();
                    var ticketTimestamp = moment(ticket.ticket_timestamp).unix();
                    var delay = Number.parseInt((localDate - ticketTimestamp) / 60);

                    escalationPoints.forEach(function(escalationPoint){
                        if(escalationPoint.qman_location_id != ticket.location_id){
                            return;
                        }

                        if(Number.parseInt(delay) >= Number.parseInt(escalationPoint.escalation_threshold)  
                            && Number.parseInt(delay) <= Number.parseInt(escalationPoint.escalation_threshold) + 2
                        ){
                        //if(Number.parseInt(delay) >= Number.parseInt(escalationPoint.escalation_threshold)){
                            escalationPoint.getContacts()
                            .then(function(contacts){
                                contacts.forEach(function(contact){
                                    var smsText = 'Ticket number ' + ticket.ticket_num + ' for location ' + escalationPoint.qman_location_name + 
                                        ' is still delayed by ' + Number.parseInt(delay) + ' minutes. Please attend.';

                                    twilio.messages.create({ 
                                        to: '+' + contact.mobile, 
                                        from: smsSenderId, 
                                        body: smsText, 
                                    }, function(err, message) { 
                                        if(err){
                                            console.log('Twilio Error: ' + err);
                                            return;
                                        }
                                
                                        console.log(message.sid); 
                                    });

                                });
                            });

                        }else {
                            console.log('DIFF: ' + (moment().unix() - moment(ticket.ticket_timestamp).unix()) + ' [' + delay + ']');return;
                        }
                    });
                });
            });

            
        }).on('error', function(error){
            console.log('Error connection to QMAN!');
        });
    }, (1000 * 60));
};
