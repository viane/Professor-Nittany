#Intelligent Academic Planer source document common notaion and description


|Example   	|Description   	|
|---	|---	|
|[tip] The tip that appear in the answer [/tip]   |Directly shows in the answer, might apply different style than normal text	|
|[ </br>[a] Linked keyword [/a],</br>[a] Linked keyword [/a], </br>... </br>]   	|Highlighted keyword array in context, use to link to external page   	|
|[ </br>[link] url [/link], </br>[link] url [/link], </br>... </br>]   	|Actual external link array, same order as keyword array  	|
|[\n]	|New line indicator, equivlent to \</br>	|
|[extend] More... [/extend]	|Further details that can be toggled to display	|
|[html]DOM element[/html]	|Can be directly render into html DOM tree, usually are \<iframe> of embeded video	|
|[file][/file]|Not planned|
|[img][/img]|Regular URL image|
|[GPS]Building Name, Room Number, Time[/GPS]| Information in between will parsed by campus map tool, show GPS direction to destination. (Not implementing in current objective)|
|[show-pdf]URL[/show-pdf]| Parse a online PDF into a div DOM and display on the main page|
|[download-pdf]URL[/download-pdf]| Directlty download to user client|
|[ </br>[question-placeholder]Sample question placeholder[/question-placeholder],</br>[question-placeholder]Sample question placeholder[/question-placeholder], </br>... </br>]| Sample string of related questions, if user click it, submit the question that is correspond in the [question] array. |
|[ </br>[question]Formatted question[/question],</br>[question]Formatted question[/question], </br>... </br>]| Store the approved question that in order of [question-placeholder] array. |
