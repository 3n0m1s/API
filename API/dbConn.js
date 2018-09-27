var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();  
var db = new sqlite3.Database('./db/blockchain.db');  

db.serialize(function() {  
    db.run("CREATE TABLE IF NOT EXISTS Acceptances (ipfs TEXT, website TEXT, ip TEXT, browser TEXT)");  
    db.run("CREATE TABLE IF NOT EXISTS Proposals (proposal_hash TEXT, ip TEXT, browser TEXT)");  
    db.run("CREATE TABLE IF NOT EXISTS Delegates (wallet TEXT, ip TEXT,website TEXT, browser TEXT)");  
});  


var addConn = function(ip,website,ipfs,browser) {

	db.get('SELECT * FROM Acceptances WHERE browser ="'+browser+'" OR ip="'+ip+'"', function(error, row) {
		if (row !== undefined) {
			//console.log('record already know')
			var a = 0;
		}
		else {
			db.run('INSERT into Acceptances(ipfs,website,ip,browser) VALUES ("'+ipfs+'","'+website+'","'+ip+'","'+browser+'")');  
		}
	})
}
exports.addConn = addConn;

var onTarget = function(proposal_hash,ip,browser) {

	db.get('SELECT * FROM Proposals WHERE browser="'+browser+'" OR ip="'+ip+'"', function(error, row) {
		if (row !== undefined) {
			//console.log('record already know')
			var a = 0;
		}
		else {
			db.run('INSERT into Proposals(proposal_hash,ip,browser) VALUES ("'+proposal_hash+'","'+ip+'","'+browser+'")');  
		}
	})
}
exports.onTarget= onTarget;


var onDelegation = function(wallet,ip,website,browser) {

	db.get('SELECT * FROM Delegates WHERE browser="'+browser+'" OR ip="'+ip+'"', function(error, row) {
		if (row !== undefined) {
			//console.log('record already know')
			var a = 0;
		}
		else {
			db.run('INSERT into Delegates(wallet,ip,website,browser) VALUES ("'+wallet+'","'+ip+'","'+website+'","'+browser+'")');  
		}
	})
}
exports.onDelegation = onDelegation;