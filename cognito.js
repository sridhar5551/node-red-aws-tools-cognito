module.exports = function(RED) {
    "use strict";

    function AmazonCognitoQueryNode(n) {
        RED.nodes.createNode(this,n);
        this.awsConfig = RED.nodes.getNode(n.aws);
        this.region = this.awsConfig.region;
        this.accessKey = this.awsConfig.accessKey;
        this.secretKey = this.awsConfig.secretKey;
        this.userPoolId = this.awsConfig.userPoolId;
        this.operation = n.operation;
        this.name= n.name;
        var node = this;
        var AWS = require("aws-sdk");

        AWS.config.update({
            accessKeyId: this.accessKey,
            secretAccessKey: this.secretKey,
            region: this.region
        });

        var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
        
        node.on("input", function(msg) {

            node.sendMsg = function (err, data) {
              if (err) {
                node.status({fill:"red",shape:"ring",text:"error"});
                node.error("failed: " + err.toString() ,msg);
                console.log(err);
                return;
              } else {
                node.status({});
                console.log(data);
              }
              msg.payload = data;
              node.send(msg);
            };

            switch (node.operation) {

              case 'listUsers':

                node.status({fill:"blue",shape:"dot",text:"listUsers"});
                var params = {
                    UserPoolId: '' + this.userPoolId,
                    AttributesToGet: ["family_name", "email"],
                    Limit: 60
                };
                cognitoidentityserviceprovider.listUsers(params, node.sendMsg);

                break;
            
              case 'adminGetUser':

                node.status({fill:"blue",shape:"dot",text:"adminGetUser"});

                var params = {
                    UserPoolId: '' + this.userPoolId,
                    Username: '' + msg.topic
                };
                cognitoidentityserviceprovider.adminGetUser(params, node.sendMsg);

                break;

              case 'adminListGroupsForUser':

                node.status({fill:"blue",shape:"dot",text:"adminListGroupsForUser"});

                var params = {
                    UserPoolId: '' + this.userPoolId,
                    Username: '' + msg.topic
                };
                cognitoidentityserviceprovider.adminListGroupsForUser(params, node.sendMsg);

                break;

            }
        });
    }
    RED.nodes.registerType("amazon cognito", AmazonCognitoQueryNode);
};