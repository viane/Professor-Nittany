//////////////////////////////////////////
// remove duplicate in array
//////////////////////////////////////////

module.exports.arrayUnique = (array) => {
    let a = array.concat();
    for (let i = 0; i < a.length; ++i) {
        for (let j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
            }
        }
    return a;
}

//////////////////////////////////////////
// return index of element from Object array
//////////////////////////////////////////

module.exports.findIndexByKeyValue = (arraytosearch, key, valuetosearch) => {
    for (let i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i][key] == valuetosearch) {
            return i;
        }
    }
    return null;
}
