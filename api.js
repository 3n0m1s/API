var express = require('express');
var https = require('https');
var ejs = require('ejs');
var fs = require('fs');
var request = require('request');
var trycatch = require('trycatch');
var DB = require('./API/dbConn');
keccak256 = require('js-sha3').keccak256
var metaget = require("metaget");
var sqlite3 = require('sqlite3').verbose();  
var onDB = new sqlite3.Database('./db/blockchain.db');  
var Web3 = require('web3');
var web3 = new Web3();
web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/KWdoko3z2LEwyjnvEAoW"));

var ABI = [{"constant":false,"inputs":[{"name":"inWebAddr","type":"address"}],"name":"unCertifyDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"delegate","type":"address"}],"name":"getEpmBalance","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"smarthash","type":"bytes32"},{"name":"addr","type":"address[]"},{"name":"visits","type":"uint256[]"}],"name":"pay","outputs":[{"name":"status","type":"bool"},{"name":"costForVisit","type":"uint256"},{"name":"fee","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_dLink","type":"string"}],"name":"getProposalHash","outputs":[{"name":"smartHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"webservice","type":"string"}],"name":"addDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_smartHash","type":"bytes32"},{"name":"_dLink","type":"string"}],"name":"Accept","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nodes","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"checkDelegation","outputs":[{"name":"inProgress","type":"bool"},{"name":"cert","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isAlreadyDelegate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"id","type":"uint256"}],"name":"getProposalByID","outputs":[{"name":"smartOwner","type":"address"},{"name":"smartHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"},{"name":"y","type":"uint256"}],"name":"getAcceptance","outputs":[{"name":"dLink","type":"string"},{"name":"smartHash","type":"bytes32"},{"name":"others","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"inWebAddr","type":"address"}],"name":"CertifyDelegate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getProposalByHash","outputs":[{"name":"smartOwner","type":"address"},{"name":"smartWebsite","type":"string"},{"name":"smartHash","type":"bytes32"},{"name":"target","type":"uint256"},{"name":"duration","type":"uint256"},{"name":"tags","type":"string"},{"name":"ipfs","type":"string"},{"name":"numAcc","type":"uint256"},{"name":"others","type":"string"},{"name":"amount","type":"uint256"},{"name":"finalized","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"smarthash","type":"bytes32"}],"name":"isProposalEnded","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"epm","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isActiveDelegate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getNumAcceptance","outputs":[{"name":"num","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"epocum","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"},{"name":"x","type":"uint256"}],"name":"getAdvertisers","outputs":[{"name":"adv","type":"address"},{"name":"dLink","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"countAllProposals","outputs":[{"name":"count","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"proposal_n","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"d","type":"uint256"}],"name":"getDelegate","outputs":[{"name":"webservice","type":"string"},{"name":"wallet","type":"address"},{"name":"amount","type":"uint256"},{"name":"cert","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_website","type":"string"},{"name":"_target","type":"uint256"},{"name":"duration","type":"uint256"},{"name":"tags","type":"string"},{"name":"others","type":"string"}],"name":"New","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];

var contract = web3.eth.contract(ABI);
// initiate contract for an address
var epocumInstance = contract.at('0xb150345B69190B038e267053ff9ee9645a36bFd2');

var api = express();


var options = {
  key: fs.readFileSync('./SSL/privkey.pem'),
  cert: fs.readFileSync('./SSL/cert.pem'),
  ca: fs.readFileSync('./SSL/chain.pem')
};


api.use(require('body-parser').urlencoded({ extended: true }));
api.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true,
                            cookie: { maxAge : 200000000 }
					 }));

api.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods","GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});


api.all('/', function(request, response) {

	request.session.user_id;

	var content = fs.readFileSync('.' +'/API/index.html', 'utf-8');
	var compiled = ejs.compile(content);

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(compiled({
    	//id: id,
    	//name: name,
	//codice: ''

    }));


	});
	
api.all('/connectivity/:connectivity', function(req, resp) {

		var conn =  req.params.connectivity;

		var ipAdd = req.connection.remoteAddress.replace('::ffff:','');
		
		//console.log(conn);
		
		trycatch(function() {    
				    
			var website = conn.split('epocumunder')[0];
			var ipfs = conn.split('epocumunder')[1];
			var id = conn.split('epocumunder')[2];

			webOk = website.replace(/[+]/g, '/');

				    DB.addConn(ipAdd,webOk,ipfs,id);
				    console.log('Get Conn from: ' + ipAdd + '  for website: ' + webOk + ' derived from ipfs hash: ' + ipfs + ' retrieved from browser id: ' + id);
				    // call constant function
				    var proposalHash = epocumInstance.getProposalHash(ipfs);
				    console.log('Updated target on smart sharing contract root = ' + proposalHash) // '0x25434534534'
					DB.onTarget(smartHash,ipAdd,id);

		  // do something error-prone 
		}, function(err) {
		  console.log(err);
		})

	});
	
api.all('/onSiteDelegate/:wallet/website/:website/browserId/:browser', function(req, resp) {

		var ipAdd = req.connection.remoteAddress.replace('::ffff:','');
		var webOk = req.params.website.replace(/[+]/g, '/');
		var id = req.params.browser;
		var wallet = req.params.wallet;

		trycatch(function() {    
				    
				    DB.onDelegation(wallet,ipAdd,webOk,id);

				    //console.log(ipAdd,webOk,id);

		}, function(err) {
		  console.log(err);
		})


	resp.end('');

	});


api.get('/getMeta/:w', function(req, res, next) {

webOld = req.params.w;
web = webOld.replace(/[+]/g, '/')
console.log(web);

		
				metaget.fetch(web, function (err, meta_response) {
				
					try {
				
							console.log(meta_response);
							var desc = meta_response["og:description"];
							var img = meta_response["og:image"];
							var url = meta_response["og:url"];
							console.log(desc,img,url);
							res.write(desc+'#!#'+img+'#!#'+url);
							res.end('');
								
					}catch(err) {
								
							res.write('undefined#!#undefined#!#undefined');
							res.end('');
				
					}
		
				});
				
		

});

api.get('/get_acceptances', function(req, res, next) {
	
	 onDB.all("SELECT * from Acceptances",function(err,rows){  
        if(err)  
                             {  
            console.log(err);  
        }  
        else{  
            res.send(rows);  
        }  
    });  
	
});

api.get('/get_proposals', function(req, res, next) {
	
	 onDB.all("SELECT * from Proposals",function(err,rows){  
        if(err)  
                             {  
            console.log(err);  
        }  
        else{  
            res.send(rows);  
        }  
    });  

  	
});

api.get('/get_ListConnectionsFromAcceptance/:acceptance_hash', function(req, res, next) {
		acceptance_hash = req.params.ipfs;
		onDB.all('SELECT * FROM Acceptances WHERE ipfs = "'+acceptance_hash+'"',function(err,rows){
			//console.log(rows[0].postCount);  
        	res.json(rows);
    	});  
});

api.get('/get_NumConnectionsFromAcceptance/:acceptance_hash', function(req, res, next) {
		acceptance_hash = req.params.acceptance_hash;
		onDB.all('SELECT COUNT(*) AS postCount FROM Acceptances WHERE ipfs = "'+acceptance_hash+'"',function(err,rows){
			//console.log(rows[0].postCount);  
        	res.json(rows[0].postCount);
    	});  

});

api.get('/get_ProposalCurrentTarget/:proposal_hash', function(req, res, next) {

		proposal_hash = req.params.proposal_hash;
		onDB.all('SELECT COUNT(*) AS targetCount FROM Proposals WHERE proposal_hash = "'+proposal_hash+'"',function(err,rows){
			//console.log(rows[0].postCount);  
        	res.json(rows[0].targetCount);
    	});  
});

api.get('/get_DelegatesConnectionsList', function(req, res, next) {
		acceptance_hash = req.params.acceptance_hash;
		onDB.all('SELECT * FROM Delegates',function(err,rows){
			//console.log(rows[0].postCount);  
        	res.json(rows);
    	});  
});


api.use(express.static('.' + '/'));
https.createServer(options,api).listen(88);



















