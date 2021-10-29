var currentDomain = "nlp",
    data = {"nlp": {}, "vis": {}},
    libraries = {
        "nlp": ["NLTK", "TextBlob", "SpaCy"],
        "vis": ["D3.js", "Chart.js", "Recharts"]
    },
    doms = {"nlp": "NLP", "vis": "Visualization"},
    fo = {"nlp": {"fir": [], "sec": [], "thr": []}, "vis": {"fir": [], "sec": [], "thr": []}},
    hierarchyConcept = {},
    lines = {"nlp": {"fir": [], "sec": [], "thr": []}, "vis": {"fir": [], "sec": [], "thr": []}},
    colorArr = ["#F3B8FF", "#BDE0FE", "#ACDDDE", "#CAF1DE", "#A1E991", "#C5E1A5", "#F8DE7E", "#FFE7C7", "#F7D8BA", "#E69E8F", " #FFC8DD", "#FFAFCC"],
    conceptColors = {},
    initialColors = {},
    initialSelection = true;
function closeHierarchy() {
    document.getElementById("menu").style.display = 'none';
}
function showHierarchy() {
    document.getElementById("menu").style.display = 'block';
}
function sortFiles(domain) {
    var temp = {"fir": [], "sec": [], "thr": []};
    for (var f in data[domain]["file info"]) {
        var obj = {"name": f, "nlines": data[domain]["file info"][f]["nlines"]};
        temp[f.split("_")[0]].push(obj);
    }
    for (var l in temp) {
        temp[l].sort(function(a, b) { 
            return a.nlines - b.nlines;
        })
        for(var i in temp[l]) {
           fo[domain][l].push(temp[l][i].name);
        }   
    }
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
function genCode(domain) {
    for (var l in fo[domain]) {
        var colDiv = document.getElementById(l+"Code"),
            withinCol = document.getElementById(l+"CodeWithin");
        for (var f of fo[domain][l]) {
            var codeRange = document.createElement("div");
            codeRange.className = "codeRange";
            codeRange.innerHTML = data[domain]["labeled files"][f];
            codeRange.id = f;

            var codeMarker = document.createElement("div");
            codeMarker.className = "marker";
            codeRange.appendChild(codeMarker);
            colDiv.appendChild(codeRange);

            var colorfulStuff = codeRange.querySelectorAll(".highlights");
            var containerHeight = codeMarker.offsetHeight;
            var codeHight = codeRange.querySelector("code").offsetHeight;
            if (codeHight < containerHeight) {
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

            // add within codes
            var withinBlock = document.createElement("div");
            withinBlock.className = "smallBlock";
            withinBlock.id = f+"_within_block";
            withinBlock.innerHTML = data[domain]["within files"][f];
            var withinHighlights = withinBlock.querySelectorAll(".highlights");
            var newPre = document.createElement("pre");
            newPre.id = f+"_code_within_pre";
            var newCode = document.createElement("code");
            [...withinHighlights].forEach(function(w) {
                newCode.appendChild(w);
            })
            newCode.className = withinBlock.querySelector("code").className;
            withinBlock.innerHTML = "";
            newPre.appendChild(newCode);
            withinBlock.appendChild(newPre);
            withinCol.appendChild(withinBlock);
        }
    }
}
function getData(domain) {
    genHier(data[domain]['all templates']);
    genCode(domain);
}
function showAllFirstLevelConcepts() {
    var viss = document.getElementsByClassName("visRange");
    [...viss].forEach(function(v) {v.style.backgroundColor = "#5d5f5f"});
    document.getElementById("firTag").innerHTML = "";
    document.getElementById("secTagContainer").innerHTML = "";
    for (var temp of data[currentDomain]["all templates"]) {
        if (temp.name.split("_")[0]=="cat") {
            var tag = document.createElement("div");
            tag.id = "tag_"+temp.name;
            tag.className = "tag";
            tag.innerText = temp.name.replace("cat_", "").replace(/_/g, " ");
            
            tag.style.backgroundColor = conceptColors[temp.name];
            document.getElementById("firTag").appendChild(tag);
            tag.addEventListener('click', clickT, false);

            var secTag = document.createElement("div");
            secTag.id = "sec_"+tag.id;
            secTag.className = "levelTag secTag";
            secTag.style.display = "none";

            for (var t of hierarchyConcept[temp.name]) {
                if (t.split("_")[0] !== "cat") {
                    var feaTag = document.createElement("div");
                    feaTag.id = "tag_"+t;
                    feaTag.innerHTML = t.replace("fea_", "").replace(/_/g, " ");
                    feaTag.className = "tag";
                    feaTag.style.backgroundColor = conceptColors[t];
                    secTag.appendChild(feaTag);
                    secTag.addEventListener('click', clickT, false);
                }
                var acrossCol = document.getElementsByClassName("acrossCol");
                [...acrossCol].forEach(function(a) {
                    var hls = a.querySelectorAll("."+t);
                    [...hls].forEach(function(h) {h.style.backgroundColor = conceptColors[temp.name]});
                });
                var withinCol = document.getElementsByClassName("withinCol");
                [...withinCol].forEach(function(a) {
                    var hls = a.querySelectorAll("."+t);
                    [...hls].forEach(function(h) {h.style.backgroundColor = conceptColors[temp.name]});
                });
                var makers = document.getElementsByClassName(t.slice(4)+"_marker");
                [...makers].forEach(function(m) {
                    m.style.backgroundColor = conceptColors[temp.name];
                    m.style.opacity = "1.0";
                });
            }

            document.getElementById("secTagContainer").appendChild(secTag);
        }
    }
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
    var smallBlock = document.getElementsByClassName("smallBlock");
    [...smallBlock].forEach(function(b) {b.remove()});
    //Add codes and distributions
    initialSelection = true;
    getData(domain);
    addHListener();
    genLineVis(domain);
    currentDomain = domain;
    showAllFirstLevelConcepts(domain);
}
function genData(tem) {
    // generate three objects: conceptColors and hierarchyConcept (for hierarchy selections)
    var colorFlag = 0,
        catFlag = 1;
    for (var i=0; i<tem["fir"].length; i++) {
        var concept = Object.keys(tem["fir"][i])[0];
        var level = concept.split("_")[0];
        if (level == "cat") {
            if (i > 0) {
                hierarchyConcept[currentCat] = catArr;
            }
            var currentCat = concept,
                catArr = [concept];
            colorFlag = 0;
            conceptColors[concept] = colorArr[catFlag];
            catFlag += 1;
        } else {
            hierarchyConcept[concept] = [currentCat, concept];
            catArr.push(concept);
            conceptColors[concept] = colorArr[colorFlag];
            initialColors[concept] = conceptColors[currentCat];
        }
        colorFlag += 1;
    }
    // append last cat to hierarchyConcept
    hierarchyConcept[currentCat] = catArr;
}
// tag or hierarchy click functions
function clickT(event) {
    if (event.target.id.includes("tag_")) {
        var tagConcept = event.target.id.replace("tag_", "");
    } else {
        var tagConcept = event.target.id;
    }
    
    if (tagConcept.split("_")[0] == "cat") {
        var tags = document.querySelectorAll("#firTag > .tag");
        [...tags].forEach(function(t) {t.style.opacity = "0.3"});
        document.getElementById("tag_"+tagConcept).style.opacity = "1.0";
        document.getElementById(tagConcept).style.backgroundColor = "#F1F5F9";
        var secTags = document.getElementsByClassName("secTag");
        [...secTags].forEach(function(t) {t.style.display = "none"});
        document.getElementById("sec_tag_"+tagConcept).style.display = "block";
    } else {
        var tags = document.getElementById("secTagContainer").querySelectorAll(".secTag > .tag");
        if (initialSelection) {
            [...tags].forEach(function(t) {t.style.opacity = "0.3"});
            document.getElementById("tag_"+tagConcept).style.opacity = "0.8";
            document.getElementById(tagConcept).style.backgroundColor = "#F1F5F9";
            initialSelection = false;
        } else {
            if (document.getElementById("tag_"+tagConcept).style.opacity == "0.8") {
                document.getElementById("tag_"+tagConcept).style.opacity = "0.3";
                document.getElementById(tagConcept).style.backgroundColor = "#fff";
                var flag = 0;
                [...tags].forEach(function(t) {
                    if (t.style.opacity == "0.8") {
                        flag = 1;
                    }
                });
                if (flag == 0) {
                    [...tags].forEach(function(t) {t.style.opacity = "0.8"});
                    initialSelection = true;
                }
            } else {
                document.getElementById("tag_"+tagConcept).style.opacity = "0.8";
                document.getElementById(tagConcept).style.backgroundColor = "#F1F5F9";
            }
        }
        conceptFiles();
    }
}
function addHListener() {
    var firH = document.getElementsByClassName("firH"),
        secH = document.getElementsByClassName("secH");
    [...firH].forEach(function(f) {f.addEventListener('click', clickT, false)});
    [...secH].forEach(function(f) {f.addEventListener('click', clickT, false)});
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
function genLineVis(domain) {
    var vis = document.getElementsByClassName("vis");
    [...vis].forEach(function(v) {v.innerHTML = ""});
    var maxLine = 0;
    for (var lib in lines[domain]) {
        var libMax = Math.max(...lines[domain][lib]);
        if (libMax > maxLine) {
            maxLine = libMax;
        }
    }
    for (var o in lines[domain]) {
        var visDiv = document.getElementById(o+"Vis");
        for (var i=0; i<30; i++) {
            if (i<fo[domain][o].length) {
                var visRange = document.createElement("div");
                visRange.id = fo[domain][o][i].replace("_", "")+"vis";
                visRange.className = "visRange "+o+"visRange";
                visRange.style.height = data[domain]["file info"][fo[domain][o][i]]["nlines"]/maxLine*8+"rem";
                visDiv.appendChild(visRange);
            }
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
    [...viss].forEach(function(v) {v.style.opacity = "0.5"});
    event.target.style.opacity = "1.0";
}
function scrollElement(event) {
    var viss = document.getElementsByClassName(event.target.id.slice(0, 3)+"visRange");
    [...viss].forEach(function(v) {v.style.opacity = "0.5"});
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
// within library comparison
function controlCommonWords(w, name="") {
    if (document.getElementById('showSubstr').checked) {
        var udls = w.querySelectorAll("."+name+"_keys");
        [...udls].forEach(function(u) {u.style.fontWeight = "600"});
        var blodFuncs = w.querySelectorAll("."+name+"_funcs");
        [...blodFuncs].forEach(function(b) {b.style.fontWeight = "600"});
    } else {
        var udls = w.querySelectorAll(".udls");
        [...udls].forEach(function(u) {u.style.fontWeight = "normal"});
        var blodFuncs = w.querySelectorAll(".blodFunc");
        [...blodFuncs].forEach(function(b) {b.style.fontWeight = "normal"});
    }
}
function conceptFiles() {
    var acrossCol = document.getElementsByClassName("acrossCol"),
        withinCol = document.getElementsByClassName("withinCol");
    if (initialSelection) {
        var codes = document.getElementsByClassName("codeRange");
        [...codes].forEach(function(c) {c.style.display = "block"});
        var codesWithin = document.getElementsByClassName("smallBlock");
        [...codesWithin].forEach(function(c) {c.style.display = "block"});
        [...acrossCol].forEach(function(a) {
            var hlsWthin = a.querySelectorAll(".highlights");
            [...hlsWthin].forEach(function(h) {
                h.style.backgroundColor = initialColors[h.classList[1]];
                h.style.display = "block";
            });
            controlCommonWords(a);
        });
        [...withinCol].forEach(function(w) {
            var hlsWthin = w.querySelectorAll(".highlights");
            [...hlsWthin].forEach(function(h) {
                h.style.backgroundColor = initialColors[h.classList[1]];
                h.style.display = "block";
            });
            controlCommonWords(w);
        });
        var visRange = document.getElementsByClassName("visRange");
        [...visRange].forEach(function(v) {v.style.display = "flex"});
        return;
    }
    var codes = document.getElementsByClassName("codeRange");
    [...codes].forEach(function(c) {c.style.display = "none"});
    var codesWithin = document.getElementsByClassName("smallBlock");
    [...codesWithin].forEach(function(c) {c.style.display = "none"});
    [...acrossCol].forEach(function(a) {
        var hls = a.querySelectorAll(".highlights");
        [...hls].forEach(function(h) {h.style.backgroundColor = "#fff"});
        controlCommonWords(a);
    });
    [...withinCol].forEach(function(w) {
        var hlsWthin = w.querySelectorAll(".highlights");
        [...hlsWthin].forEach(function(h) {h.style.display = "none"});
        controlCommonWords(w);
    });
    var spans = document.getElementsByClassName("markerSpan");
    [...spans].forEach(function(s) {s.style.opacity = "0"});
    var visRange = document.getElementsByClassName("visRange");
    [...visRange].forEach(function(v) {v.style.display = "none";});
    // get all selected concepts
    var conceptArr = new Set(),
        conceptColor = "#5d5f5f";
    var concepts = document.getElementById("secTagContainer").querySelectorAll(".secTag > .tag");
    [...concepts].forEach(function(c) {
        if (c.style.opacity != "0.3") {
            var conceptName = c.id.replace("tag_", "");
            var conceptLevel = conceptName.split("_")[0];
            var conceptColor = conceptColors[conceptName];
            conceptArr.add(conceptName); // cat_preprocessing
            // make all elements related to concepts visable
            // highlights
            [...acrossCol].forEach(function(a) {
                var hls = a.querySelectorAll("."+conceptName);
                [...hls].forEach(function(h) {h.style.backgroundColor = conceptColor});
                controlCommonWords(a, conceptName);
            });
            [...withinCol].forEach(function(w) {
                var hlsWthin = w.querySelectorAll("."+conceptName);
                [...hlsWthin].forEach(function(h) {
                    h.style.display = "block";
                    h.style.backgroundColor = conceptColor;
                });
                controlCommonWords(w, conceptName);
            });
            // minimaps
            var conceptMarkers = document.getElementsByClassName(conceptName.replace(conceptLevel+"_", "")+"_marker");
            [...conceptMarkers].forEach(function(c) {
                c.style.opacity = "1.0";
                c.style.backgroundColor = conceptColor;
            })
        }
    });
    // filter the files
    var fileMatched = [];
    for (var f in data[currentDomain]["file concepts"]) {
        if ([...conceptArr].every(val => data[currentDomain]["file concepts"][f].includes(val))) {
            fileMatched.push(f);
            // make matched code examples visable
            document.getElementById(f).style.display = "block";
            document.getElementById(f+"_within_block").style.display = "block";
            document.getElementById(f.replace("_", "")+"vis").style.display = "flex";
            if (conceptArr.size == 1) {
                document.getElementById(f.replace("_", "")+"vis").style.backgroundColor = conceptColor;
            } else {
                document.getElementById(f.replace("_", "")+"vis").style.backgroundColor = "#5d5f5f";
            }
        }
    }
}
// function call
$.getJSON("static/data/vis_tem.json", function(obj) {
    data["vis"] = obj;
    getData("vis");
    genData(data["vis"]["api templates"]);
    sortFiles("vis");
    processLineData("vis");
});
// interface will show the NLP domain as default
$.getJSON("static/data/nlp_tem.json", function(obj) {
    data["nlp"] = obj;
    getData("nlp");
    genData(data["nlp"]["api templates"]);
    sortFiles("nlp");
    switchDomain("nlp");
    addHListener();
    processLineData("nlp");
    genLineVis("nlp");
});

const toggleSwitch = document.getElementById('switch');
toggleSwitch.addEventListener('change', switchMode, false);
const substringSwitch = document.getElementById('showSubstr');
substringSwitch.addEventListener('change', switchMode, false);
    
function switchMode(e) {
    var acrossCol = document.getElementsByClassName("acrossCol"),
        withinCol = document.getElementsByClassName("withinCol");
    conceptFiles();
    if (e.target.id == "switch") {
        if (e.target.checked) {
            [...acrossCol].forEach(function(a) {a.style.display = "block";});
            [...withinCol].forEach(function(w) {w.style.display = "none";});
        } else {
            [...acrossCol].forEach(function(a) {a.style.display = "none";});
            [...withinCol].forEach(function(w) {w.style.display = "block";});
        }
    } 
}