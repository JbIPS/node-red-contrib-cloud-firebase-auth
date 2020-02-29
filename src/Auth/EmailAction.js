function validateNodeConfig(n) {
	if (!n.admin) {
		throw "No admin specified";
	}
}

module.exports = function(RED) {
	"use strict";

	function FirebaseAuthEmailAction(n) {
		validateNodeConfig(n)

		RED.nodes.createNode(this, n);
		var node = this;

		node.linkType = n.linkType;
		node.email = n.email;
		node.settings = JSON.parse(n.settings);
		node.admin = RED.nodes.getNode(n.admin).app;

		node.on('input', async msg => {
			let type = node.linkType;
			if(msg.firebase && msg.firebase.type)
				type = msg.firebase.type;

			const email = msg.payload || node.email;
			node.status({ fill: "blue", shape: "dot", text: "Generating link..." });

			let link;
			try {
				switch (type) {
					case "signin":
						link = await node.admin.auth().generateSignInWithEmailLink(email, node.settings);
						break;
					case "reset":
						link = await node.admin.auth().generatePasswordResetLink(email, node.settings);
						break;
					case "verify":
						link = await node.admin.auth().generateEmailVerificationLink(email, node.settings);
						break;
					default:
						node.error("Unknown action type");
						node.status({ fill: "red", shape: "ring", text: "Unknown action type" });
						return;
				}
				msg.payload = link;
				node.send(msg);
				node.status({});
			} catch (error) {
				node.error(error);
				node.status({ fill: "red", shape: "ring", text: "Error while generating link" });
			}

		})
	}

	RED.nodes.registerType("firebase-auth-email-action", FirebaseAuthEmailAction);
}
