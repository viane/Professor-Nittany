const express = require('express');
const router = express.Router();

router.get("/get-status", (req, res)=> {
  res.json("{status:'good'}");
});

module.exports = router;
