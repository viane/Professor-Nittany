const express = require('express')
const router = express.Router()
import Question from '../models/question'
import Developer from '../models/developer'
const adminCode = "defaultAdinCode"


router.get("/get-status", (req, res) => {
  const trainedQuestionCount = new Promise((resolve, reject) => {
    Question.find({trained: true}).exec((err, results) => {
      if (err) {
        console.error(err)
        return resolve(0)
      }
      return resolve(results.length)
    })
  })

  //const totalQuestionCount

  Promise.all([trainedQuestionCount]).then(values => {
    res.status(200).json({status: 'good', trainedQuestionCount: values[0]})
  }).catch(err => {
    console.error(err)
    res.status(300).json(err)
  })

})

router.get('/team-member', async (req, res) => {
  try {
    const result = await Developer.find({})
    return res.status(200).json(result : result)
  } catch (err) {
    console.error(err);
    return res.status(200).json(status : err)
  }
})

router.post('/team-member', async (req, res) => {
  if (req.body.adminCode != adminCode) {
    return res.status(200).json({status: 'Unauthorized operation'})
  }
  
  const checkRequiredFields = ['name', 'description', 'main-title']

  checkRequiredFields.map((field) => {
    if (!req.body[field] || (Array.isArray(req.body[field]) && req.body[field].length === 0)) {
      return res.status(200).json({status: 'One of the required field is empty'})
    }
    if(typeof req.body[field] === 'string' && req.body[field].trim().length === 0){
      return res.status(200).json({status: 'One of the required field is empty'})
    }
  })

  const developer = new Developer()

  developer.name = req.body.name.toLowerCase()
  developer.avatar = req.body.avatar || '/images/default-user.png'
  developer.description = req.body.description.toLowerCase()
  developer.skill = req.body.skill || []
  developer.link = req.body.link || ''
  developer["main-title"] = req.body["main-title"]
  try {
    const result = await developer.save()
    return res.status(200).json(result)
  } catch (err) {
    console.error(err)
    return res.status(400).json(err)
  }
})

router.delete('/team-member', async (req, res) => {
  if (req.body.adminCode != adminCode) {
    return res.status(200).json({status: 'Unauthorized operation'})
  }
  try {
    const result = await Developer.remove({name: req.body.name}).exec()
    return res.status(200).json({status: 'Successfully delete record'})
  } catch (err) {
    console.error(err);
    return res.status(200).json({status: err})
  }

})

module.exports = router
