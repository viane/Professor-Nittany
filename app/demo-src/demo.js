const appRoot = require('app-root-path');
const frontEndRoot = appRoot + '/views/FrontEnd/';

module.exports = (app)=>{
  // demo se course schedule route
  app.get('/world-campus-software-engineering-schedule', function(req, res) {
    res.render(frontEndRoot + '/demo-src/Penn State Online _ Courses - Software Engineering Bachelor of Science.ejs');
  });

  app.get('/course/*', function(req, res) {
    res.sendFile(frontEndRoot + '/demo-src'+req.url+'.htm');
  });

  app.get('/views/FrontEnd/demo-src/course/style/style.css', function(req, res) {
    res.sendFile(frontEndRoot+ '/demo-src/course/style/style.css');
  });

  app.get('/world-campus-se-logo', function(req, res) {
    res.sendFile(frontEndRoot+ '/demo-src/image/SE_logo.png');
  });

};
