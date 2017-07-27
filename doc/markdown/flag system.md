#Intelligent Academic Planer source document common notaion and description


|Example   	|Description   	|
|---	|---	|
|[tip] The tip that appear in the answer [/tip]   |Directly shows in the answer, might apply different style than normal text	|
|[ </br>[a] Linked keyword [/a],</br>[a] Linked keyword [/a], </br>... </br>]   	|Highlighted keyword array in context, use to link to external page   	|
|[ </br>[link] url [/link], </br>[link] url [/link], </br>... </br>]   	|Actual external link array, same order as keyword array  	|
|[ </br>[email] Email keyword [/email],</br>[email] Email keyword [/email], </br>... </br>]   	|Highlighted keyword array in context, use to invoke sending email  	|
|[ </br>[email-addr] Email address [/email-addr], </br>[email-addr] Email address [/email-addr], </br>... </br>]   	|Actual email address array, same order as keyword array  	|
|[\n]	|New line indicator, equivlent to \</br>	|
|[extend] More... [/extend]	|Further details that can be toggled to display	|
|[html] DOM element [/html]	|Can be directly render into html DOM tree, usually are \<iframe> of embeded video	|
|[file][/file]|Not planned|
|[img] url [/img]|Regular URL image|
|[progress]<br>[step]...[/step]</br>...<br>[step]...[/step]</br>[/progress]|A block of showing step by step content<br>Step tag should be in order<br>You can nest other tags in the [step] tag|