/////////////////////////////////////////////////////////////////////////////
// Use for format alchemyAPI result in system.js update domain terms func
/////////////////////////////////////////////////////////////////////////////

module.exports.retrieveTermsFromAlchemyAPI = (_result, _opt) => {
    let termArray = [];

    if (!_opt) {
        // default threshold for each categorie terms to be considered add into knowledge domain
        _opt = {
            "threshold": {
                "concept": 0.4,
                "entity": 0.8,
                "taxonomy": 0.3,
                "keyword": 0.5
            }
        }
    }

    _result.concepts.map((concept) => {
        if (concept.relevance >= _opt.threshold.concept) {
            termArray.unshift(concept.text.trim().toLowerCase());
        }
    })

    _result.entities.map((entity) => {
        if (entity.relevance >= _opt.threshold.entity) {
            termArray.unshift(entity.text.trim().toLowerCase());
        }
    })

    _result.taxonomy.map((taxonomy) => {
        if (taxonomy.score >= _opt.threshold.taxonomy) {
            termArray.unshift(taxonomy.label.split("/").pop().trim().toLowerCase());
        }
    })

    _result.keywords.map((keyword) => {
        if (keyword.relevance >= _opt.threshold.keyword) {
            termArray.unshift(keyword.text.replace("no-title.","").trim().toLowerCase());
        }
    })

    return termArray;
}
