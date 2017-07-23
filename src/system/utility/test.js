//var formatter=require('formatter.js');

function removeTagsAndRelateInfoFromSMSAnswer(answerText){
  let answer = answerText;
  // use RegExp remove targeted tags and content between tags
  // rules:
  // 1. remove [a][/a],[extend][/extend],[email][/email] tags
  // 2. remove tags and whats in between of following tags: [link][/link],[email-addr][/email-addr],[img][/img]
  answer = answer.replace(/\[a\]/g,'').replace(/\[\/a\]/g,'').replace(/\[email\]/g,'').replace(/\[\/email\]/g,'').replace(/\[extend\]/g,'').replace(/\[\/extend\]/g,'');
  answer = answer.replace(/\[link\][\s\S]*?\[\/link\]/g,'').replace(/\[email-addr\][\s\S]*?\[\/email-addr\]/g,'').replace(/\[img\][\s\S]*?\[\/img\]/g,'');

  return answer;
};

var answer ="Answer: Undergraduate degrees in computer science include several categories of courses. Many in the first years of an undergraduate degree prepare students for advanced course work in the computer science major. These courses often include basic computer applications, discrete mathematics, calculus, and algorithms in addition to basic computer science courses such as introduction to computer science. [\n] [extend] Major course work includes several types of classes in computer science. Students complete computer science courses in programming, information technology, applications and web development, operating systems, and data communications. Examples of specific courses include java programming, data structures, management information systems, business data communication, and web development. Specialized courses might also include security, forensics, and health informatics. [\n] See [a]recommend course schedule[/a] from Penn State Behrend to find out more about your question. [\n][/extend] [link]http://rap.psu.edu/computer-science-cmpbd[/link]";

answer =removeTagsAndRelateInfoFromSMSAnswer(answer);

console.log(answer);