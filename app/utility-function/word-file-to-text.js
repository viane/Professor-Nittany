// For combine document converion result

module.exports.combineResult = (response) => {
    let fullDoc = ""; // will store all content in the word file as plain text

    // fill up the fullDoc
    for (const docIndex in response.answer_units) {
        if (response.answer_units[docIndex].hasOwnProperty("title")) {
            fullDoc += response.answer_units[docIndex].title + ". ";
        }
        for (const textIndex in response.answer_units[docIndex].content) {
            if (response.answer_units[docIndex].content[textIndex].hasOwnProperty("text")) {
                fullDoc += response.answer_units[docIndex].content[textIndex].text;
            }
        }
    }

    if (fullDoc.length == 0) {
        fullDoc = "Document not acceptable, try a different document.";
    }

    return fullDoc;
}
