var currentDomain = "nlp",
    data = {"nlp": {}, "vis": {}},
    libraries = {
        "nlp": ["NLTK", "TextBlob", "SpaCy"],
        "vis": ["D3.js", "Chart.js", "Recharts"]
    },
    doms = {"nlp": "NLP", "vis": "Visualization"},
    cf = {},
    hc = {},
    lines = {"nlp": {"fir": [], "sec": [], "thr": []}, "vis": {"fir": [], "sec": [], "thr": []}},
    colorArr = ["#F3B8FF", "#BDE0FE", "#ACDDDE", "#CAF1DE", "#E1F8DC", "#FEF8DD", "#EAF2D7", "#FFE7C7", "#F7D8BA", "#E69E8F", " #FFC8DD", "#FFAFCC"];
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
        hDiv.id = tem[i]['name'];
        nameDiv.className = "hName";
        hVis.className = "hVis";
        if (level == "cat") {
            hDiv.className = "firH hDiv";
            nameDiv.innerText = concept.replace(/_/g, " ");
        } else {
            hDiv.className = "secH hDiv";
            nameDiv.innerHTML = "&#8226; "+concept.replace(/_/g, " ");
        }
        hDiv.appendChild(nameDiv);
        genHVis(hVis, tem[i]);
        hDiv.appendChild(hVis);
        hierDiv.appendChild(hDiv);
    }
}
function genCode(tem) {
    for (var file in tem) {
        var rangeDiv = document.getElementById(file.split("_")[0]+"Code");
        var codeBlock = document.createElement("div");
        codeBlock.className = "codeRange";
        codeBlock.innerHTML = tem[file];
        codeBlock.id = file;
        var codeMarker = document.createElement("div");
        codeMarker.className = "marker";
        codeBlock.appendChild(codeMarker);
        rangeDiv.appendChild(codeBlock);

        var colorfulStuff = codeBlock.querySelectorAll(".highlights");

        var containerHeight = codeMarker.offsetHeight;
        var codeHight = codeBlock.querySelector("code").offsetHeight;
        if (codeHight<containerHeight) {
            codeHight = containerHeight;
        }
        colorfulStuff.forEach(function (h) { // loop to create each marker
            
            var hTop = h.offsetTop;
            var hBottom = hTop + h.offsetHeight;       
            var markerTop = Math.ceil(hTop * containerHeight / codeHight);
            var markerBottom = Math.ceil(hBottom * containerHeight / codeHight);
            
            var markerElement = document.createElement("span"); // create the marker, set color and position and put it there
            markerElement.className = "markerSpan "+h.id.replace(h.id.slice(-1),"marker ");
            markerElement.style.top = markerTop + "px"
            markerElement.style.height = (markerBottom - markerTop) + "px"
            codeMarker.appendChild(markerElement);       
        })
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
    document.getElementById("tags").innerHTML = "";
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
    genLineVis(domain);
    currentDomain = domain;
}
function genCF(tem) {
    // generate two objects: cf and hc (for hierarchy selections)
    for (var i=0; i<tem["fir"].length; i++) {
        var concept = Object.keys(tem["fir"][i])[0];
        var level = concept.split("_")[0];
        var name = concept.replace(level+"_", "");
        if (level == "cat") {
            if (i > 0) {
                hc[currentCat] = catArr;
            }
            var currentCat = concept,
                catArr = [concept];
        } else {
            hc[concept] = [currentCat, concept];
            catArr.push(concept);
        }
        cf[name] = [];
        cf[name] = cf[name].concat(
            tem["fir"][i][concept]["codes"],
            tem["sec"][i][concept]["codes"],
            tem["thr"][i][concept]["codes"]
        );
    }
    // append last cat to hc
    hc[currentCat] = catArr;
}
// tag click functions
function clickT(event) {
    var firH = document.getElementsByClassName("firH"),
        secH = document.getElementsByClassName("secH");
    [...firH].forEach(function(f) {f.style.backgroundColor = "#fff"});
    [...secH].forEach(function(f) {f.style.backgroundColor = "#fff"});
    document.getElementById(event.target.id.replace("tag_", "")).style.backgroundColor = "#F1F5F9";
    // filter the code examples
    var hId = event.target.id.replace("tag_"+event.target.id.split("_")[1]+"_", "");
    var codes = document.getElementsByClassName("codeRange");
    [...codes].forEach(function(c) {c.style.display = "none"});
    for (var i=0; i<cf[hId].length; i++) {
        document.getElementById(cf[hId][i]).style.display = "block";
    }
    // remove original highlights
    var hls = document.getElementsByClassName("highlights");
    [...hls].forEach(function(h) {h.style.backgroundColor = "#fff"});
    var spans = document.getElementsByClassName("markerSpan");
    [...spans].forEach(function(s) {s.style.opacity = "0"});
    // add tags
    var tags = document.getElementsByClassName("tag");
    [...tags].forEach(function(t) {t.remove()});
    for (var t = 0; t<hc[event.target.id.replace("tag_", "")].length; t++) {
        var tag = document.createElement("div");
        tag.id = "tag_"+hc[event.target.id.replace("tag_", "")][t];
        tag.className = "tag";
        tag.innerText = hc[event.target.id.replace("tag_", "")][t].replace(hc[event.target.id.replace("tag_", "")][t].split("_")[0]+"_", "").replace(/_/g, " ");
        tag.style.backgroundColor = colorArr[t];
        document.getElementById("tags").appendChild(tag);
        tag.addEventListener('click', clickT, false);
        var highlights = document.getElementsByClassName(hc[event.target.id.replace("tag_", "")][t]);
        [...highlights].forEach(function(h) {h.style.backgroundColor = colorArr[t]});
        var makers = document.getElementsByClassName(hc[event.target.id.replace("tag_", "")][t].slice(4)+"_marker");
        [...makers].forEach(function(m) {
            m.style.backgroundColor = colorArr[t];
            m.style.opacity = "1.0";
        });
    }
    genConceptVis(event.target.id.replace("tag_", ""));
}
// hierarchy click functions
function clickH(event) {
    // add background to the selected hierarchy
    var firH = document.getElementsByClassName("firH"),
        secH = document.getElementsByClassName("secH");
    [...firH].forEach(function(f) {f.style.backgroundColor = "#fff"});
    [...secH].forEach(function(f) {f.style.backgroundColor = "#fff"});
    event.target.style.backgroundColor = "#F1F5F9";
    // filter the code examples
    var hId = event.target.id.replace(event.target.id.split("_")[0]+"_", "");
    var codes = document.getElementsByClassName("codeRange");
    [...codes].forEach(function(c) {c.style.display = "none"});
    for (var i=0; i<cf[hId].length; i++) {
        document.getElementById(cf[hId][i]).style.display = "block";
    }
    var hls = document.getElementsByClassName("highlights");
    [...hls].forEach(function(h) {h.style.backgroundColor = "#fff"});
    var spans = document.getElementsByClassName("markerSpan");
    [...spans].forEach(function(s) {s.style.opacity = "0"});
    // add tags
    var tags = document.getElementsByClassName("tag");
    [...tags].forEach(function(t) {t.remove()});
    for (var t = 0; t<hc[event.target.id].length; t++) {
        var tag = document.createElement("div");
        tag.id = "tag_"+hc[event.target.id][t];
        tag.className = "tag";
        tag.innerText = hc[event.target.id][t].replace(hc[event.target.id][t].split("_")[0]+"_", "").replace(/_/g, " ");
        tag.style.backgroundColor = colorArr[t];
        document.getElementById("tags").appendChild(tag);
        tag.addEventListener('click', clickT, false);
        var highlights = document.getElementsByClassName(hc[event.target.id][t]);
        [...highlights].forEach(function(h) {h.style.backgroundColor = colorArr[t]});
        var makers = document.getElementsByClassName(hc[event.target.id.replace("tag_", "")][t].slice(4)+"_marker");
        [...makers].forEach(function(m) {
            m.style.backgroundColor = colorArr[t];
            m.style.opacity = "1.0";
        });
    }
    genConceptVis(event.target.id);
};
function addHListener() {
    var firH = document.getElementsByClassName("firH"),
        secH = document.getElementsByClassName("secH");
    [...firH].forEach(function(f) {f.addEventListener('click', clickH, false)});
    [...secH].forEach(function(f) {f.addEventListener('click', clickH, false)});
}
function processLineData(domain) {
    for (var i=1; i<31; i++) {
        for (var o in lines[domain]) {
            var f = o+"_"+i;
            if (f in data[domain]["file info"]) {
                lines[domain][o].push(data[domain]["file info"][f]["nlines"]);
            } else {
                lines[domain][o].push(0);
            }
        }
    }
}
function genConceptVis(concept) {
    const trueFiles = new Set();
    for (var o in data[currentDomain]["api templates"]) {
        for (const a of data[currentDomain]["api templates"][o]) {
            for (var conceptName in a) {
                if (concept == conceptName) {
                    for (const f of a[conceptName]["codes"]) {
                        trueFiles.add(f.replace("_", ""));
                    }
                }
            }
        }
    }
    var visRange = document.getElementsByClassName("visRange");
    [...visRange].forEach(function(v) {
        if (trueFiles.has(v.id.replace("vis", ""))) {
            v.style.display = "flex";
        } else {
            v.style.display = "none";
        }
    });
}
function genLineVis(domain) {
    var vis = document.getElementsByClassName("vis");
    [...vis].forEach(function(v) {v.innerHTML = ""});
    for (var o in lines[domain]) {
        var visDiv = document.getElementById(o+"Vis");
        var maxLine = Math.max(...lines[domain][o]);
        for (var i=0; i<30; i++) {
            var visRange = document.createElement("div");
            visRange.id = o+(i+1)+"vis";
            visRange.className = "visRange "+o+"visRange";
            visRange.style.height = lines[domain][o][i]/maxLine*8+"rem";
            visDiv.appendChild(visRange);
        }
    }
    var viss = document.getElementsByClassName("visRange");
    [...viss].forEach(function(v) {v.addEventListener('click', clickVis, false)});
}
function clickVis(event) {
    var visId = event.target.id.replace("vis", "");
    var targetId = visId.slice(0, 3) + "_" + visId.slice(3);
    document.getElementById(targetId).scrollIntoView({behavior: "smooth"});
    var viss = document.getElementsByClassName(visId.slice(0, 3)+"visRange");
    [...viss].forEach(function(v) {v.style.opacity = "0.3"});
    event.target.style.opacity = "1.0";
}
function scrollElement(event) {
    var viss = document.getElementsByClassName(event.target.id.slice(0, 3)+"visRange");
    [...viss].forEach(function(v) {v.style.opacity = "0.3"});
    var codes = event.target.querySelectorAll('.codeRange');
    var visableTop = event.target.getBoundingClientRect().top, 
        visableBottom = event.target.getBoundingClientRect().bottom;
    [...codes].forEach(function(c) {
        var elementTop = c.getBoundingClientRect().top,
            elementBottom = c.getBoundingClientRect().bottom;
        if ((visableTop <= elementTop && elementTop < visableBottom) || (visableTop < elementBottom && elementBottom < visableBottom)) {
            document.getElementById(c.id.replace("_", "")+"vis").style.opacity = "1.0";
        }
    });
}
// function call
$.getJSON("static/data/vis_tem.json", function(obj) {
    data["vis"] = obj;
    getData("vis");
    genCF(data["vis"]["api templates"]);
    processLineData("vis");
});
// interface will show the NLP domain as default
$.getJSON("static/data/nlp_tem.json", function(obj) {
    data["nlp"] = obj;
    getData("nlp");
    genCF(data["nlp"]["api templates"]);
    switchDomain("nlp");
    addHListener();
    processLineData("nlp");
    genLineVis("nlp");
});

