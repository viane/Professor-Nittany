# Questions

## Post a Question in Lite Version

### HTTP Request

`post /questions/ask-lite`

> To get an answer to a question, use this code:

```javascript
fetch("https://localhost:3443/questions/ask-lite", {  
  method: 'post',  
  headers: {  
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
  },
  body: 'question={question}',
  credentials: 'include'
}).then(response=>{return response.json()})
.then(json=> {
  // now json contains answers
});
```

The sign in API requires 1 parameter in the request body

Parameter          | Description
------------------ | --------------------------------------
question           | A question should be in the request body


<aside class="notice">
The response are either success or error due to invalid token.
</aside>

### Example response of successful signin:

```json
// retrieve_and_rank response
{
    "responseHeader": {
        "status": 0,
        "QTime": 45
    },
    "response": {
        "numFound": 518,
        "start": 0,
        "maxScore": 10,
        "docs": [
            {
                "id": "9241ae96-add9-4746-bda1-84960b7a105b",
                "title": "Help me explain the difference between studying Computer Engineering and Electrical Engineering.",
                "body": "An electrical engineer is someone who designs and develops new electrical equipment, solves problems and tests equipment. They work with all kinds of electronic devices, from the smallest pocket devices to large supercomputers. Electrical engineering deals with electricity, electro-magnetism and electronics.[\\n] Computer engineering is the branch of engineering that integrates electronic engineering with computer sciences. Computer engineers design and develop computer systems and other technological devices[\\n] Electrical Engineering encompasses Computer Engineering. An Electrical Engineer can do a Computer Engineers work, but in some cases Computer Engineer can’t work with core electrical stuff. There are even available courses with can help Electrical engineers to get jobs in IT industry but you hardly find any courses which helps Computer Engineers to get jobs in the electrical field.",
                "score": 10,
                "ranker.confidence": 0.5462427822233803
            },
            {
                "id": "25e49575-447b-443d-94a0-3d1cf432842d",
                "title": "Show me the information about the Analog & Digital Electronics Certificate",
                "body": "This 12 credit certificate is designed to provide students with an understanding of the analysis and basic design techniques for digital, logic, and integrated circuits (op amps, amplifiers, filters, rectifiers). Students will also have an understanding of basic programming techniques.[\\n] The following courses are required to obtain the certificate:[\\n] [ul] [li]ENGL 015, Rhetoric and Composition, 3 credits[/li] [li]CMPET 005, Engineering Methods in Engineering Technology, 1 credit[/li] [li]CMPET 117, Digital Electronics, 3 credits[/li] [li]CMPET 120, Digital Electronics Laboratory, 1 credit[/li] [li]EET 212W, Op Amp and Integrated Circuit Electronics, 4 credits[/li] [/ul]",
                "score": 9,
                "ranker.confidence": 0.30980944926542614
            },
            {
                "id": "17f55942-cb55-40f1-abfd-ba89a7e55dd5",
                "title": "What is the career outlook for Electrical Engineering?",
                "body": "Employment of electrical and electronics engineers is projected to show little or no change from 2014 to 2024. Change in employment is expected to be tempered by slow growth or decline in most manufacturing sectors in which electrical and electronics engineers are employed.[\\n] Job growth for electrical and electronics engineers will occur largely in engineering services firms, because more companies are expected to cut costs by contracting their engineering services rather than directly employing engineers. These engineers also will be in demand to develop sophisticated consumer electronics.[\\n] The rapid pace of technological innovation and development will likely drive demand for electrical and electronics engineers in research and development, an area in which engineering expertise will be needed to develop distribution systems related to new technologies. These engineers will play key roles in new developments having to do with solar arrays, semiconductors, and communications technologies.",
                "score": 8,
                "ranker.confidence": 0.28502322414189984
            },
            {
                "id": "fca8eca2-2ed0-4375-b922-9ed9e2911d70",
                "title": "Can you give me some advice on choosing between Computer Science and Electrical Engineering?",
                "body": "Computer science is traditionally more concerned with the theoretical underpinnings of computation and of programming; thus one typically finds in computer science curricula courses in programming, algorithms, numerical analysis (how do you guarantee a number produced by a computer program is accurate), and the theory of computation (what can and cannot in principle be computed).[\\n] Electrical engineering deals with the study and application of electricity, electronics and electromagnetism.The field now covers a wide range of subdisciplines including power, electronics, control systems, electro-optics, signal processing, and telecommunications. Most recently, electrical engineering had expanded to include fields like nanotechnology and mechatronics, and there is significant activity at the interface of electrical engineering and the life sciences.",
                "score": 7,
                "ranker.confidence": 0.18333469568070476
            },
            {
                "id": "c616a88b-0b21-4e86-861f-40f2749c068d",
                "title": "Engineering Job Market",
                "body": "There were 243,200 mechanical engineers in 2010, according to the Bureau of Labor Statistics (BLS); that number is projected to increase 9 percent between 2010 and 2020, slower than the average occupation. Electrical and electronics engineers numbered 294,000, with growth of 6 percent expected for the decade. Civil engineers held 262,800 jobs, and their ranks are projected to increase by 19 percent by 2020.[\\n] Although there are good numbers of open jobs in engineering, the profession is still recovering from the 2007-2009 recession. Some of the stronger niches in engineering employment after the recession are aerospace, biomedical, computer hardware and mechanical engineering. Employers are still coping with a long-term shortage of engineers; fewer students are earning academic credentials now than 25 years ago. For the well-qualified, this tight supply means plentiful work opportunities in engineering.[\\n] Common engineering careers include engineering technician, electrical engineer, mechanical engineer, civil engineer, industrial engineer, biomedical engineer, chemical engineer, materials engineer, environmental engineer, engineering project manager, test engineering manager and director of engineering.",
                "score": 6,
                "ranker.confidence": 0.1296789990923437
            },
            {
                "id": "15a9dfd9-0172-47f6-89fb-d179d7d51d7f",
                "title": "Software Engineering Vs Electrical Engineering",
                "body": "Electrical engineering deals with electricity, electronics, and magnetism. Usually they focus in more on the hardware and circuits of computer components because of this. Software engineering on the other hand, designs software programs to run on computers made by electrical engineers. Software engineers will gain more experience in programming than electrical engineers will.",
                "score": 5,
                "ranker.confidence": 0.08649006833305149
            },
            {
                "id": "a8a8674e-9412-44fc-9703-d690ab4ce331",
                "title": "What can you do with an Electrical Engineering Degree?",
                "body": "A degree in electrical engineering can qualify you to pursue a job in almost any industry you can think of. After all, nearly everyone uses electricity and electrical devices, so industries demand skilled professionals to build, repair, and improve these devices. Electrical engineers work in businesses such as:[\\n] [ul] [li]Scientific research and development firms[/li] [li]Electrical component manufacturing companies[/li] [li]Power generation, distribution, and transmission[/li] [li]Manufacturers of navigation controls, medical equipment, and measurement devices[/li] [li]Architectural firms[/li] [/ul] Although these industries employ the most engineers, they may not be right for everyone. Electrical engineering majors enjoy many options, more than enough for any student to find a job in a field he loves. The following job titles represent only a handful of the choices available:[\\n] Research Engineer[\\n] [extend]Research engineers work in the lab, testing and inventing. This job requires a high level of creativity on the part of the engineer, as well as a great deal of patience. Whether inventing a new optoelectronic device or simply designing a better electric can opener, research engineers are responsible for the discovery-stage technology behind any new electronic product.[/extend][\\n] Design Engineer[\\n] [extend]Once a new technology is invented, it must be applied. The design engineer uses computer simulations and models to turn innovations like wireless technology into the tiny parts that make up an actual cell phone. Design engineers must visualize how the insides of a future product could look, while inventing several possible scenarios for the applications of new technologies.[/extend][\\n] Project Engineer[\\n] [extend]The project engineer oversees many specialist engineers throughout the construction of a working prototype of a new product or technology. The project engineer must have natural leadership ability, as well as a high proficiency in a variety of electrical engineering disciplines.[/extend][\\n] Test Engineer[\\n] [extend]Test engineers design programs to check the functions of electronic devices and to troubleshoot those devices when things go wrong. They keep technology working properly, and understand which elements to test and in what order. Successful test engineers remain sharp, even after long hours on the job.[/extend][\\n] System Engineer[\\n] [extend]Power grids, phone lines, and wireless networks all require the skills of a system engineer for proper installation and maintenance. Keen attention to detail is important for graduates who enter this profession. Experienced system engineers rely on their ability to think holistically about the systems they create.[/extend][\\n] Application Engineer[\\n] [extend]Application engineers work with whatever resources are available, adapting existing equipment and technologies to fulfill the needs of their employers. They need to be resourceful, while counting on their deep understanding of the capabilities and the potential modifications of existing equipment.[/extend]",
                "score": 4,
                "ranker.confidence": 0.08599680689631234
            },
            {
                "id": "23453740-e47d-4437-a388-0dcaa5a8b7c9",
                "title": "What jobs are available for an Electrical Engineer?",
                "body": "Graduates with electrical engineering degrees hold a variety of jobs. Project engineers supervise the production process, while test engineers make sure a device works as intended. Design engineers use software to draw blueprints for new products. Broadcast engineers create, test and install electronic components for communications companies. Computer boards and networks are the focus of circuit engineers. Other positions electrical engineers might hold include network engineer and systems engineer.",
                "score": 3,
                "ranker.confidence": 0.040724275362357606
            },
            {
                "id": "84a0926c-d8e7-470f-b3b3-db57e06c1307",
                "title": "Are Electrical Engineers in high demand?",
                "body": "The U.S. has approximately 1.6 million engineering jobs that pay $42 per hour in median wages. Civil engineers account for the most jobs of any engineering field (274,000 in 2014), followed closely by mechanical engineers (264,000) and industrial engineers (229,000). Those three engineering jobs, plus electrical engineers and electronics engineers, make up two-thirds of the American engineering workforce.",
                "score": 2,
                "ranker.confidence": 0.03743885397306851
            },
            {
                "id": "a327393a-a7cc-4c71-8383-8525b58bbc88",
                "title": "no-title",
                "body": "Computer engineering majors complete several courses to fulfill various categories while pursuing a bachelor’s degree. In addition to general education courses, students also must successfully complete electrical engineering, computer engineering, general computer and mathematical, and computer engineering elective courses.[\\n] [extend]In many programs, the core computer engineering curriculum includes calculus, engineering analysis, and physics. Electrical engineering courses include electronic circuits, signals and systems, electrical engineering design, and logic design. Computer engineering courses often include computer architecture, digital system design, microcomputer systems, and C++. Other computer-based coursework could include probability, random processes, and computer programming with engineering. The range of electives varies greatly by program and institution, but common courses include operating systems, Unix, network security, and software engineering.[\\n][/extend]  ",
                "score": 1,
                "ranker.confidence": 0
            }
        ]
    }
}
```

Property                    | Description
-------------------------   | --------------------------------
res.response.doc            | An array of answers
res.response.numFound       | Total number of found answers 
res.response.maxScore       | The maximum score of an answer 

## Post a Question in Full Version

### HTTP Request

`post /questions/ask`

> To get answers to a question, use this code:

```javascript
fetch("https://localhost:3443/questions/ask", {  
  method: 'post',  
  headers: {  
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "x-access-token":"{user's token}"
  },
  body: 'question={question}',
  credentials: 'include'
}).then(response=>{return response.json()})
.then(json=> {
  // now json contains answers
});
```
The sign in API requires 1 parameter in the request body

Parameter          | Description
------------------ | --------------------------------------
question           | A question should be in the request body

The sign in API requires 1 parameter in the request header

Parameter          | Description
------------------ | --------------------------------------
x-access-token     | Token gained after successfully signin

<aside class="notice">
The response are either success or error due to invalid token.
</aside>

### Example response of error:

```json
// error due to incorrect token
{
    "message": "You are not authenticated!",
    "error": {
        "status": 302
    }
}
```

Property     | Eesponse                            | Description
------------ | ----------------------------------- | ---------------
message      | You are not authenticated!          | User signin token is invalid
error.status | 302                                 | Indicate user should be redirected to signin page

### Example response of successful signin:

```json
// retrieve_and_rank response
{
    "responseHeader": {
        "status": 0,
        "QTime": 70
    },
    "response": {
        "numFound": 358,
        "start": 0,
        "maxScore": 10,
        "docs": [
            {
                "id": "1ffc75ca-b123-4b0f-9d70-8a3104302320",
                "title": "no-title",
                "body": "Undergraduate degrees in computer science include several categories of courses. Many in the first years of an undergraduate degree prepare students for advanced course work in the computer science major. These courses often include basic computer applications, discrete mathematics, calculus, and algorithms in addition to basic computer science courses such as introduction to computer science. [\\n] [extend] Major course work includes several types of classes in computer science. Students complete computer science courses in programming, information technology, applications and web development, operating systems, and data communications. Examples of specific courses include java programming, data structures, management information systems, business data communication, and web development. Specialized courses might also include security, forensics, and health informatics. [\\n] See [a]recommend course schedule[/a] from Penn State Behrend to find out more about your question. [\\n][/extend] [link]http://rap.psu.edu/computer-science-cmpbd[/link]",
                "score": 10,
                "ranker.confidence": 0.5415041751929232
            },
            {
                "id": "af37e9f9-9222-4849-8514-9897520025ec",
                "title": "no-title",
                "body": "Programming and programming languages are tools of computer science, but they are not its primary subject matter. There is a reason the major is called Computer Science and not \"Computer Programming\" since the emphasis is on the best methods for tackling problems whose solutions are not immediately apparent. Complex and abstract problem solving plays a key role in the application of computer technology to practical problems. [\\n] [extend] Many students are attracted to the Computer Science major because they either like using computers or have enjoyed some prior programming experiences. Computer programming is a broad term covering a range of software development activities, ranging from writing small programs in order to perform simple tasks, to the creation of large user applications and systems software consisting of millions of lines of complex code. [\\n] However, Computer Science goes far beyond merely programming. A bachelor’s degree in computer science qualifies students for jobs as “software engineers,” the most common job title for graduates with computer science degrees. A bachelor’s degree in computer science also teaches students critical time management, problem solving, software engineering, networking, and security skills. [\\n][/extend]  ",
                "score": 9,
                "ranker.confidence": 0.38902336251321495
            },
            {
                "id": "4e139de0-6f9b-4d5d-abf0-247ae0be0dd0",
                "title": "Which needs more logic: computer science or computer engineering?",
                "body": "It’s hard to determine whether Computer Science or Computer Engineering has more logic. It’s really a toss up between the two but I’d have to say computer science. Computer science works with algorithms on a daily basis, so logic is a key focus. Computer engineering works with hardware, which also requires logic, but you may not be looking at logic all the time when making the hardware.",
                "score": 8,
                "ranker.confidence": 0.21981501516933585
            },
            {
                "id": "6c52cf6d-edb1-46bf-a6bf-b08d46d85c02",
                "title": "Is computer science related to game development?",
                "body": "Computer science focuses a lot on algorithms and theory as well as programming. Game development also deals with programming and algorithms so having some computer science background is handy, but it isn’t necessary to work in game development. There are other key things that you have to keep in mind for game development that computer science will not teach you, such as user experience, mechanics, and data mining.",
                "score": 7,
                "ranker.confidence": 0.16599068418124832
            },
            {
                "id": "b1727c97-ba95-42b0-aea0-8bde7bbcddc7",
                "title": "what is the outcome of learning computer science?",
                "body": "The purpose of computer science is to investigate algorithms, design efficiency, and implementation and application of computer systems to the problems of businesses and government. The goal of a computer scientist is to maintain and create the most effective computer systems possible using the most current technology available. The field of computer sciences is one of the fastest growing industries today. As people rely more on computers, the development and maintenance of computer systems is critical. Computer science graduates will find numerous career opportunities in a variety of business, government, and academic organizations. The curriculum at Penn State Behrend also prepares students for further study in computer science at the master’s and doctoral levels.",
                "score": 6,
                "ranker.confidence": 0.1563570997405952
            },
            {
                "id": "fca8eca2-2ed0-4375-b922-9ed9e2911d70",
                "title": "Can you give me some advice on choosing between Computer Science and Electrical Engineering?",
                "body": "Computer science is traditionally more concerned with the theoretical underpinnings of computation and of programming; thus one typically finds in computer science curricula courses in programming, algorithms, numerical analysis (how do you guarantee a number produced by a computer program is accurate), and the theory of computation (what can and cannot in principle be computed).[\\n] Electrical engineering deals with the study and application of electricity, electronics and electromagnetism.The field now covers a wide range of subdisciplines including power, electronics, control systems, electro-optics, signal processing, and telecommunications. Most recently, electrical engineering had expanded to include fields like nanotechnology and mechatronics, and there is significant activity at the interface of electrical engineering and the life sciences.",
                "score": 5,
                "ranker.confidence": 0.15519781828285537
            },
            {
                "id": "1c12a57e-056e-4dfe-9fd6-5b7e75396175",
                "title": "Do I have to be good at math to study Computer Science",
                "body": "There are many problems in Computer Science, and not all of them are strictly mathematical. Many of the problems are architectural and require solutions that involve a type of thinking that is not what you find in in a university mathematics department.[\\n] If you enjoy Computer Science, do Computer Science.",
                "score": 4,
                "ranker.confidence": 0.12278541619862988
            },
            {
                "id": "02fe21a7-048e-4db4-aee0-9c5c9d00a595",
                "title": "no-title",
                "body": "What is the purpose of studying Natural Sciences? The Natural Sciences reveal the order, diversity, and beauty of nature and in so doing enable students to develop a greater appreciation of the world around them. These courses help students to understand the nature of science through exposure to the broad divisions of science--physical science, biological science, earth science, and applied natural science. [\\n] [extend] In these courses the students will be taught how to acquire scientific factual information, to use scientific methodology and to develop an appreciation of the natural world. Students should gain an understanding of how scientists reason and how they draw conclusions and think critically. [\\n] [/extend]",
                "score": 3,
                "ranker.confidence": 0.12029282398288725
            },
            {
                "id": "d8e81ef5-4ebe-4470-ae7a-61630e9501e4",
                "title": "no-title",
                "body": "Many skills are helpful when beginning an education as a computer science major. To begin a degree program, students will complete numerous courses that require aptitude in various topics in logic and mathematics. A large portion of the processes for coding, for instance, require high levels of mathematical ability. Prior experience with computer programming is also beneficial, as computer science majors will be required to complete a number of courses in different programming languages including C++, java, and assembler. [\\n] [extend] Additional skills include those that are often categorized as soft skills. Two of the most important of these skills include creativity and critical thinking. Many of the projects and processes in the computer science field involve finding the answer to a complicated problem. Like a puzzle, creative thinking enables a student to find the key to solving the puzzle. Critical thinking helps students to analyze and identify possibilities and strategies to solve the same puzzle. [\\n] In addition, other skills beneficial to computer science majors include decision making, written and verbal communication, and working well under pressure. [\\n] The skills beneficial for students are expanded and developed for after graduation as well. Additional skills that are beneficial for computer science students can be found at the [a]IEEE website [/a]. [\\n] [link]https://www.computer.org/portal/web/guest/home[/link] [/extend]",
                "score": 2,
                "ranker.confidence": 0.019012324120568337
            },
            {
                "id": "06071de8-8e3b-4a03-9d5f-f13ff26d106f",
                "title": "no-title",
                "body": "Computer forensic specialists must have a knowledge base in networking, programming, encryption and computer science. They need to be able to take the data and evidence they obtain from technological systems and use it to compile strong evidence to present in court and other official capacities. Thus, getting a job in forensics with a computer science degree is absolutely possible. [extend] The level of degree required to work in computer forensics varies with the type of job, work setting and responsibility involved. Some entry level positions with law enforcement agencies require only an associate’s degree in computer forensics, computer science or other comprehensive computer area of study. Other kinds of jobs often ask for a bachelor’s degree in computer science, information technology or similar subject matter. Educational experience in computer engineering may be required for upper level jobs, such as those in the federal government. [/extend]  ",
                "score": 1,
                "ranker.confidence": 0
            }
        ]
    }
}
```
Property                    | Description
-------------------------   | --------------------------------
res.response.docs           | An array of answers
res.response.numFound       | Total number of found answers 
res.response.maxScore       | The maximum score of an answer 