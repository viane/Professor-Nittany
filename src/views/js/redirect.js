$(()=>{
  initSignInRedirectListener();
})

const initSignInRedirectListener= ()=>{
  // redirct after 3rd party login
  if (window.location.pathname === "/users/signin/callback") {
    const obj = parseQueryFromUrl();
    if (obj.hasOwnProperty('success') && obj.success) {
      localStorage['iaa-userToken'] = JSON.stringify(obj.token);
      window.location.href = '/lite-version.html';
    }
  }
}

const parseQueryFromUrl = ()=>
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}
