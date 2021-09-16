var data = {"nlp": {}, "vis": {}},
    libraries = {
        "nlp": ["NLTK", "TextBlob", "SpaCy"],
        "vis": ["D3.js", "Chart.js", "Recharts"]
    },
    doms = {"nlp": "NLP", "vis": "Visualization"},
    cf = {},
    hc = {};
function closeHierarchy() {
    document.getElementById("menu").style.display = 'none';
}
function showHierarchy() {
    document.getElementById("menu").style.display = 'block';
}
function genHVis(hVis, tem) {
    const n = ["fir", "sec", "thr"];
    for (var i=0; i<3; i++) {
        var out = document.createElement("div"),
            inside = document.createElement("div");
        out.className = "hVisOut";
        inside.className = "hVisIn";
        inside.style.width = (tem[n[i]]/30)*9+"rem";
        inside.innerText = tem[n[i]];
        out.appendChild(inside);
        hVis.appendChild(out);
    }
}
function genHier(tem) {
    //Generate hierarchy from json
    var hierDiv = document.getElementById("hierarchy");
    hierDiv.innerHTML = "";
    for (var i=0; i<tem.length; i++) {
        var level = tem[i]['name'].split("_")[0];
        var concept = tem[i]['name'].replace(level+"_", "");
        var hDiv = document.createElement("div"),
            nameDiv = document.createElement("div"),
            hVis = document.createElement("div");
        hDiv.id = tem[i]['name'].replace(level, "h");
        nameDiv.className = "hName";
        hVis.className = "hVis";
        if (level == "cat") {
            hDiv.className = "firH hDiv";
            nameDiv.innerText = concept.replace(/_/g, " ");;
        } else {
            hDiv.className = "secH hDiv";
            nameDiv.innerHTML = "&#8226; "+concept.replace(/_/g, " ");;
        }
        hDiv.appendChild(nameDiv);
        genHVis(hVis, tem[i]);
        hDiv.appendChild(hVis);
        hierDiv.appendChild(hDiv);
    }
}
function genCode(tem) {
    for (var file in tem) {
        var lib = file.split("_")[0];
        var rangeDiv = document.getElementById(lib+"Code");
        var codeBlock = document.createElement("div");
        codeBlock.className = "codeRange";
        codeBlock.innerHTML = tem[file];
        codeBlock.id = file.split(".")[0];
        rangeDiv.appendChild(codeBlock);
    }
}
function getData(domain) {
    genHier(data[domain]['all templates']);
    genCode(data[domain]['labeled files']);
}
function switchDomain(domain) {
    var div = document.getElementById(domain+"Btn");
    var btns = document.getElementsByClassName("domainB");
    [...btns].forEach(function(btn) {
        if (btn.classList.contains("activated")) {
            btn.classList.remove("activated");
        }
    }); 
    div.classList.add("activated");
    document.getElementById("webTitle").innerText = doms[domain]+" Libraries Comparison";
    var libs = document.getElementsByClassName("lib"),
        titles = document.getElementsByClassName("titName");
    for (var i=0; i<3; i++) {
        libs[i].innerText = libraries[domain][i];
        titles[i].innerText = libraries[domain][i];
    }
    var blank = document.getElementsByClassName("codeRange");
    [...blank].forEach(function(b) {b.remove()});
    //Add codes and distributions
    getData(domain);
    addHListener();
}
function genCF(tem) {
    for (var i=0; i<tem["fir"].length; i++) {
        var concept = Object.keys(tem["fir"][i])[0];
        var level = concept.split("_")[0];
        var name = concept.replace(level+"_", "");
        cf[name] = [];
        cf[name] = cf[name].concat(
            tem["fir"][i][concept]["codes"],
            tem["sec"][i][concept]["codes"],
            tem["thr"][i][concept]["codes"]
        );
    }
}
// hierarchy click functions
function clickH(event) {
    var firH = document.getElementsByClassName("firH"),
        secH = document.getElementsByClassName("secH");
    [...firH].forEach(function(f) {f.style.backgroundColor = "#fff"});
    [...secH].forEach(function(f) {f.style.backgroundColor = "#fff"});
    event.target.style.backgroundColor = "#F1F5F9";
    var hId = event.target.id.replace("h_", "");
    var codes = document.getElementsByClassName("codeRange");
    [...codes].forEach(function(c) {c.style.display = "none"});
    for (var i=0; i<cf[hId].length; i++) {
        document.getElementById(cf[hId][i].split(".")[0]).style.display = "block";
    }
};
function addHListener() {
    var firH = document.getElementsByClassName("firH"),
        secH = document.getElementsByClassName("secH");
    [...firH].forEach(function(f) {f.addEventListener('click', clickH, false)});
    [...secH].forEach(function(f) {f.addEventListener('click', clickH, false)});
}
// function call
$.getJSON("static/data/vis_tem.json", function(obj) {
    data["vis"] = obj;
    getData("vis");
    genCF(data["vis"]["api templates"]);
});
$.getJSON("static/data/nlp_tem.json", function(obj) {
    data["nlp"] = obj;
    getData("nlp");
    genCF(data["nlp"]["api templates"]);
    addHListener();
});

