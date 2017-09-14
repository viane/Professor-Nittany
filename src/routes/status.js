const express = require('express');
const router = express.Router();
import Question from '../models/question';

router.get("/get-status", (req, res) => {
  const trainedQuestionCountPromise = new Promise((resolve, reject)=> {
    Question.find({trained: true}).exec((err, results) => {
        if (err) {
          console.error(err);
          return resolve(0);
        }
        return resolve(results.length)
    })
  });
  
  Promise.all([trainedQuestionCountPromise]).then(values => {
    res.status(200).json({status: 'good', trainedQuestionCount: values[0]});
  }).catch(err => {
    console.error(err);
    res.status(300).json(err);
  })

});

module.exports = router;
