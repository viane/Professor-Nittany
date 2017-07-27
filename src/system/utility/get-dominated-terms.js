'use strict'
var config = require('../../config.js');
var DominatedTerms = require('../../models/dominated-term');
var Questions = require('../../models/question');
var fs  = require('fs');
var path = require('path');
var processQuestion = require('./process-question');
//var schedule = require('node-schedule');


function readFiles(dirname) {
  return new Promise(function(fresolve, freject){
  	  var promisesArray = [];
	  fs.readdir(dirname, function(err, filenames) {
	    if (err) {
	      console.log(err);
	      return;
	    }
	    for(let i=0; i<filenames.length; i++){
	    	promisesArray.push(new Promise(function(resolve, reject){
		    	fs.readFile(dirname + filenames[i], function(err, content) {
			        	if (err) {
			          		return reject(err);
			        	}
			        	fs.unlink(dirname + filenames[i], (uerr) => {
			        		if(uerr){
			        			return reject(uerr);
			        		}
			        		resolve (content.toString().split('\n'));
			        	});
			        //console.log(questionsArray);
			    });
	    	}));
	    }
	    
	    Promise.all(promisesArray)
	    .then((data)=>{
	    	fresolve(data);
	    })
	    .catch((err)=>{
	    	freject(err);
	    })
	  });
  })

}

function getDominated(questionsArray,length){
	return new Promise(function(finalResolve, finalReject){
		//console.log('here');
		// if(checkFirst){
		// 	var newDomTerms = new DominatedTerms();
		// }
		DominatedTerms.findById("5978f6b724e65c86144167b0", function (err, newDomTerms) { 
			//var newDomTerms = new DominatedTerms();
			var promisesArray = [];
			//const questionsPath= path.join(__dirname, '../word-file-temp-folder');

			//fs.readFile(questionsPath, function(err, f){
			//	if(err) return console.log(err);
			//	var questionsArray;
			//	readFiles(questionsPath, questionsArray);
				console.log(questionsArray);
				for(let i=0; i<length; i++){
					promisesArray.push(new Promise(function(resolve,reject){
						Questions.count({'body': questionsArray[i], 'trained': true}, function (err, count){
							if(err) return reject({
								err: err,
								errorQuestion: questionsArray[i]
							});
							if(questionsArray[i] && questionsArray[i]!="\\r" && count<=0){
								processQuestion.NLUAnalysis(questionsArray[i])
								.then((analysis) =>{
									questionsArray[i]=questionsArray[i].replace('\\r','');
									console.log("Analysis: " + questionsArray[i]);
									var newQuestion = new Questions();
	        						newQuestion.body = questionsArray[i];
	        						newQuestion.feature.concepts = analysis.concepts;
	          						newQuestion.feature.keywords = analysis.keywords;
	          						newQuestion.feature.entities = analysis.entities;
	          						newQuestion.trained = true;
									if(analysis.keywords.length>0){
										let Text = analysis.keywords.map(function(a){return a.text});
										for(let j=0; j<Text.length; j++){
											if(newDomTerms.termsText.includes(Text[j])){
												console.log(newDomTerms);
												var target=newDomTerms.terms.findIndex(function(term){
													return term.text==Text[j];
												});
												newDomTerms.terms[target].count++;
											}else{
												var tObject = {
													text:Text[j],
													count: 1
												}
												newDomTerms.terms.push(tObject);
												newDomTerms.termsText.push(Text[j]);
											}
										}
									}
									if(analysis.entities.length>0){
										let Text = analysis.entities.map(function(a){return a.text});
										for(let j=0; j<Text.length; j++){
											if(newDomTerms.termsText.includes(Text[j])){
												var target=newDomTerms.terms.findIndex(function(term){
													return term.text==Text[j];
												});
												newDomTerms.terms[target].count++;
											}else{
												var tObject = {
													text:Text[j],
													count: 1
												}
												newDomTerms.terms.push(tObject);
												newDomTerms.termsText.push(Text[j]);
											}
										}
									}
									if(analysis.concepts.length>0){
										let Text = analysis.concepts.map(function(a){return a.text});
										for(let j=0; j<Text.length; j++){
											if(newDomTerms.termsText.includes(Text[j])){
												var target=newDomTerms.terms.findIndex(function(term){
													return term.text==Text[j];
												});
												newDomTerms.terms[target].count++;
											}else{
												var tObject = {
													text:Text[j],
													count: 1
												}
												newDomTerms.terms.push(tObject);
												newDomTerms.termsText.push(Text[j]);
											}
										}
									}
							        //console.log(newQuestion);
									newQuestion.save(function(err,resp){
										if(err) return reject({
											err:err,
											errorQuestion: questionsArray[i]
										});
										resolve(i);
									});
									
								})
								.catch((err)=>{
									reject({
										err:err,
										errorQuestion:questionsArray[i]
									});
								});
							}
							else{
								resolve(i);
							}
						});

					}));
				}
			    //console.log("data");
				Promise.all(promisesArray)
				.then((data) =>{
					//console.log(newDomTerms);
					newDomTerms.save(function(err,resp){
						if(err) return console.log(err);
						finalResolve(resp);
					});
				})
				.catch((err) => {
					finalReject(err);
				});
			//});
		});

	});
};



exports.getDominatedTerms=function(){
	return new Promise(function(resolve,reject){
		const questionsPath= path.join(__dirname, '../word-file-temp-folder/');
		var questionsArray = [];
		readFiles(questionsPath)
		.then((data)=>{
			//console.log(data);
			questionsArray = [].concat.apply([], data);
			//console.log(questionsArray);
			var count = 1;
			var timer = setInterval( function() { 
					getDominated(questionsArray,1)
					.then((data)=>{
						//console.log(data);
						questionsArray.shift();
						console.log(count);
						//console.log("hah"+questionsArray);
						if(questionsArray.length<=0){
							clearInterval(timer);

							return resolve("done");
						}
						count++;
					})
					.catch((err)=>{
						console.log({
							err:err,
							qArray: questionsArray
						});
						reject({
							err:err,
							qArray: questionsArray
						});
						clearInterval(timer);
					});	
			}, 2000);
			
		})
		.catch((err)=>{
			console.log({
				err: err,
				qArray: questionsArray
			});
			clearInterval(timer);
			reject({
				err: err,
				qArray: questionsArray
			});
		});
	});
	//setTimeout(function(){console.log(questionsArray)}, 2000);
	// var timer = setInterval( function() { 
	// 	getDominated(questionsArray,1)
	// 	.then((data)=>{
	// 		if(data=="stop"){
	// 			clearInterval(timer);
	// 			return new Promise (function(solve, reject){solve("done")});
	// 		}
	// 		questionsArray.shift();
	// 	})
	// 	.catch((err)=>{
	// 		if(err) return console.log(err);
	// 	});

	// }
	// ,1500 );

};

