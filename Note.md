#Allen's note

##Consider...

- All nlp libraries in npm
>
- Recommendation: MonkeyLearn API, Alchmy API
>
- sentiment

##Current Objective

- √ Host demo on heroku, for public access, and static url for getting 3rd-pty login api authentication.

##Implementation Notes

- Concept bank: should keep a file that track all core terminalogies that in our knowledge domain

- Whenever user is asking a terminology question, display related question such like "what is the difference between A and B", where A is the most recent term was asked and B is the current term, if user havent ask A, find most correlated term to B in our term bank, assign as A.

- use string distance to measure a question with keywords, algorithm  are offered in <b>natural</b> library from npm.

- Keyword and link template:

> If you are interested in this topic, [a]click here[/a]</br>...</br>[link]http://www.computersciencedegreehub.com/faq/professional-changing-technology/[/link]- For extended context, should be trate differently on PC and mobile end. On PC, directly display the extend content, on mobile end, display on a new slide with go back button.

> Purpose of using [extend][/extend]: contain similar or related concept and defination embeded in the extended section. For example, when user ask the concept of B, we can show the answer that has concept A as main answer, but concept B and C in the extended section, if user do want to look more and hope to find the exact answer, we offer a expand button to display extended section. By doing this, we are able to make compostive answer that can handle question with more variances, also, we have more flexibility on asking same thing but wording/structuring differently.

- Each question should have an attribute that contains related questions with corrlation. Then attach the related question at the bottom of the answer that has the highest correlation to the current question.

> The correlation can be measured by string distance method.

- Source document checking criteria: 

> space between everytag and keyword (In case the training model can't recognize keyword attached with [any flag]

> any link and video should be warp in [extend][/extend]

- [Cheatsheet](https://github.com/viane/Intelligent-Academic-Planner/blob/master/Common%20notation.md) for common notation and flag that is used in formatting answers.

- When user ask a question like will I do good in [major], analysis his personality and interests to determine what major is more suitable