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
    colorArr = [
        "#ced065",
        "#e7c9ff",
        "#b8ef8c",
        "#dfbaeb",
        "#e4fb8f",
        "#d8e3ff",
        "#fcfc8e",
        "#33fffb",
        "#ffc385",
        "#46f3c6",
        "#ffd3cf",
        "#74fabc",
        "#d6c1ca",
        "#abd46f",
        "#daaec5",
        "#a1d67b",
        "#9af8ff",
        "#d1c97c",
        "#4ddade",
        "#ffd8ac",
        "#6fffdf",
        "#ffedb7",
        "#73daaf",
        "#f0ffe8",
        "#82d99b",
        "#b4ccc0",
        "#a8ffbf",
        "#c3cc8f",
        "#f2ffc5",
        "#b2d09b"
    ],
    conceptColors = {},
    initialColors = {},
    initialSelection = true;
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
            inside = document.createElement("div"),
            condition = document.createElement("div");
        out.className = "hVisOut";
        inside.className = "hVisIn";
        inside.style.width = (tem[n[i]]/30)*6.5+"rem";
        inside.id = hVis.id +"_" + n[i] + "_origin";
        condition.className = "conditionVis";
        condition.style.width = (tem[n[i]]/30)*6.5+"rem";
        condition.id = hVis.id +"_" + n[i] + "_condition";
        if (tem[n[i]] != "0") {
            condition.innerText = tem[n[i]];
        }
        out.appendChild(condition);
        out.appendChild(inside);
        hVis.appendChild(out);
    }
}
function clickBox(event) {
    $('#'+event.target.id.replace("_box", "")).trigger('click');
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
        nameDiv.style.backgroundColor = conceptColors[tem[i]['name']];
        hVis.id = tem[i]['name']+"_hVis";
        hVis.className = "hVis";
        var box = document.createElement("INPUT");
        box.setAttribute("type", "checkbox");
        box.className = "conceptBox";
        box.id = hDiv.id+"_box";
        if (level == "cat") {
            hDiv.className = "firH hDiv";
            nameDiv.innerText = concept.replace(/_/g, " ");
        } else {
            hDiv.className = "secH hDiv";
            nameDiv.innerHTML = "&#8226; "+concept.replace(/_/g, " ");
        }
        hDiv.appendChild(box);
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
    for (var temp of data[currentDomain]["all templates"]) {
        if (temp.name.split("_")[0]=="cat") {

            for (var t of hierarchyConcept[temp.name]) {
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
    var colorFlag = 0;
    for (var i=0; i<tem["fir"].length; i++) {
        var concept = Object.keys(tem["fir"][i])[0];
        var level = concept.split("_")[0];
        if (level == "cat") {
            if (i > 0) {
                hierarchyConcept[currentCat] = catArr;
            }
            var currentCat = concept,
                catArr = [concept];
            conceptColors[concept] = colorArr[colorFlag];
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
function removeAll(flag) {
    var hDiv = document.getElementsByClassName("hDiv");
    [...hDiv].forEach(function(f) {
        if (f.classList.contains("activated")) {
            f.classList.remove("activated");
        }
    });
    var hNames = document.getElementsByClassName("hName");
    [...hNames].forEach(function(h) {h.style.opacity = "1.0"});
    initialSelection = true;
    if (flag) {conceptFiles()};
}
function clickH(event) {
    if (event.target.classList.contains("hDiv")) {
        var t = event.target;
    } else {
        var t = event.target.parentNode;
    }
    if (t.classList.contains("activated")) {
        t.classList.remove("activated");
        var initialSelectionFlag = 0;
        var concepts = document.getElementsByClassName("secH");
        [...concepts].forEach(function(c) {if (c.classList.contains("activated")) {initialSelectionFlag = 1}});
        if (initialSelectionFlag) {
            initialSelection = false;
            t.querySelector(".conceptBox").checked = false;
        } else {
            initialSelection = true;
            removeAll(false);
        };
    } else {
        if (initialSelection) {
            initialSelection = false;
            var hDiv = document.getElementsByClassName("hDiv");
            [...hDiv].forEach(function(h) {h.classList.remove("activated")});
            //var hNames = document.getElementsByClassName("hName");
            //[...hNames].forEach(function(h) {h.style.opacity = "0.3"});
        }
        t.querySelector(".conceptBox").checked = true;
        t.className += " activated";
    }
    conceptFiles();
}
function addHListener() {
    var hDiv = document.getElementsByClassName("hDiv");
    [...hDiv].forEach(function(f) {f.addEventListener('click', clickH, false)});
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
        if ((visableTop <= elementTop && elementTop < visableBottom) || (visableTop < elementBottom && elementBottom < visableBottom) || (elementTop < visableTop && visableBottom < elementBottom)) {
            document.getElementById(c.id.replace("_", "")+"vis").style.opacity = "1.0";
        }
    });
}
// within library comparison
function controlCommonWords(w, name="") {
    if (name != "") {
        var acrossName = "."+name+"_keys",
            withinName = "."+name+"_funcs";
    } else {
        var acrossName = ".udls",
            withinName = ".blodFunc";
    }
    if (initialSelection || name == "") {
        var udls = w.querySelectorAll(acrossName);
        [...udls].forEach(function(u) {u.style.fontWeight = "normal"});
        var blodFuncs = w.querySelectorAll(withinName);
        [...blodFuncs].forEach(function(b) {b.style.fontWeight = "normal"});
        return
    }
    if (document.getElementById('showSubstr').checked) {
        var udls = w.querySelectorAll(acrossName);
        [...udls].forEach(function(u) {u.style.fontWeight = "600"});
        var blodFuncs = w.querySelectorAll(withinName);
        [...blodFuncs].forEach(function(b) {b.style.fontWeight = "normal"});
    } else {
        var udls = w.querySelectorAll(acrossName);
        [...udls].forEach(function(u) {u.style.fontWeight = "normal"});
        var blodFuncs = w.querySelectorAll(withinName);
        [...blodFuncs].forEach(function(b) {b.style.fontWeight = "600"});
    }
}
function updateHVis(fileMatched) {    
    var conceptFreq = {};
    for (var f of fileMatched) {
        var lib = f.slice(0,3);
        for (var c of data[currentDomain]["file concepts"][f]) {
            if (!(c in conceptFreq)) {
                conceptFreq[c] = {"fir": 0, "sec": 0, "thr": 0};
            }
            conceptFreq[c][lib] += 1;
        }
    }
    var n = ["fir", "sec", "thr"];
    for (var i of data[currentDomain]["all templates"]) {
        if (initialSelection) {
            for (var l of n) {
                document.getElementById(i.name+"_hVis_"+l+"_condition").style.width = (i[l]/30)*6.5+"rem";
                document.getElementById(i.name+"_hVis_"+l+"_condition").innerText = i[l];
            }
            continue;
        } else if (i.name in conceptFreq) {
            for (var l in conceptFreq[i.name]) {
                document.getElementById(i.name+"_hVis_"+l+"_condition").style.width = (conceptFreq[i.name][l]/30)*6.5+"rem";
                if (conceptFreq[i.name][l] != "0") {
                   document.getElementById(i.name+"_hVis_"+l+"_condition").innerText = conceptFreq[i.name][l];
                } else {
                    document.getElementById(i.name+"_hVis_"+l+"_condition").innerText = "";
                }
            }
        } else {
            for (var l of n) {
                document.getElementById(i.name+"_hVis_"+l+"_condition").style.width = "0rem";
                document.getElementById(i.name+"_hVis_"+l+"_condition").innerText = "";
                document.getElementById(i.name).querySelector(".hName").style.opacity = "0.3";
            }
        }
    }
}
function resetHighlights(w, withinHighlightDisplay, conceptName="highlights", conceptColor="none") {
    var hlsWthin = w.querySelectorAll("."+conceptName);
    [...hlsWthin].forEach(function(h) {
        if (conceptColor=="none") {
            h.style.backgroundColor = initialColors[h.classList[1]];
        } else {
            h.style.backgroundColor = conceptColor;
        }
        h.style.display = withinHighlightDisplay;
    });
    if (conceptName == "highlights") {
        controlCommonWords(w);
    } else {
        controlCommonWords(w, conceptName);
    }
}
function changeColors(conceptName,  acrossCol, withinCol, withinHighlightDisplay, assignedColor) {
    var conceptLevel = conceptName.split("_")[0];
    if (assignedColor) {
        var conceptColor = assignedColor;
    } else {
        var conceptColor = conceptColors[conceptName];
    }
    // make all elements related to concepts visable
    // highlights
    [...acrossCol].forEach(function(a) {resetHighlights(a, withinHighlightDisplay, conceptName, conceptColor)});
    [...withinCol].forEach(function(w) {resetHighlights(w, withinHighlightDisplay, conceptName, conceptColor)});
    // minimaps
    var conceptMarkers = document.getElementsByClassName(conceptName.replace(conceptLevel+"_", "")+"_marker");
    [...conceptMarkers].forEach(function(c) {
        c.style.opacity = "1.0";
        c.style.backgroundColor = conceptColor;
    })
}
function updateConceptRelated(conceptArr, hLevel, acrossCol, withinCol, withinHighlightDisplay) {
    if (hLevel == 'secH') {
        var concepts = document.getElementsByClassName("secH");
        [...concepts].forEach(function(c) {
            if (c.classList.contains("activated")) {
                conceptArr.add(c.id);
                changeColors(c.id, acrossCol, withinCol, withinHighlightDisplay); 
            }
        });
    } else {
        var firConcepts = document.getElementsByClassName("firH"),
            concepts = [];
        [...firConcepts].forEach(function(f) {
            if (f.classList.contains("activated")) {
                conceptArr.add(f.id);
                hierarchyConcept[f.id].forEach(function(c) {
                    changeColors(c, acrossCol, withinCol, withinHighlightDisplay, conceptColors[f.id]);
                })
            }
        })       
    } 
    return conceptArr;
}
function conceptFiles() {
    var acrossCol = document.getElementsByClassName("acrossCol"),
        withinCol = document.getElementsByClassName("withinCol");
    
    if (initialSelection) {
        var conceptBoxs = document.getElementsByClassName("conceptBox");
        [...conceptBoxs].forEach(function(c) {c.checked = false});
        var codes = document.getElementsByClassName("codeRange");
        [...codes].forEach(function(c) {c.style.display = "block"});
        var codesWithin = document.getElementsByClassName("smallBlock");
        [...codesWithin].forEach(function(c) {c.style.display = "block"});
        [...acrossCol].forEach(function(a) {resetHighlights(a, "inline-block")});
        [...withinCol].forEach(function(w) {resetHighlights(w, "block")});
        var visRange = document.getElementsByClassName("visRange");
        [...visRange].forEach(function(v) {v.style.display = "flex"});
        removeAll(false);
        updateHVis([]);
        return;
    }
    var codes = document.getElementsByClassName("codeRange");
    [...codes].forEach(function(c) {c.style.display = "none"});
    var codesWithin = document.getElementsByClassName("smallBlock");
    [...codesWithin].forEach(function(c) {c.style.display = "none"});
    if (document.getElementById("switch").checked) {
        var withinHighlightDisplay = "inline-block";
        [...acrossCol].forEach(function(a) {resetHighlights(a, withinHighlightDisplay)});
        [...withinCol].forEach(function(w) {resetHighlights(w, withinHighlightDisplay)});
    } else {
        var withinHighlightDisplay = "block";
        [...acrossCol].forEach(function(a) {resetHighlights(a, withinHighlightDisplay)});
        [...withinCol].forEach(function(w) {resetHighlights(w, withinHighlightDisplay)});
        var markers = document.getElementsByClassName("marker");
        [...markers].forEach(function(m) {m.style.opacity = "0"});
    }
    var spans = document.getElementsByClassName("markerSpan");
    [...spans].forEach(function(s) {s.style.opacity = "0"});
    var visRange = document.getElementsByClassName("visRange");
    [...visRange].forEach(function(v) {v.style.display = "none";});
    // get all selected concepts
    var conceptArr = new Set();
    conceptArr = updateConceptRelated(conceptArr, "firH", acrossCol, withinCol, withinHighlightDisplay);   
    conceptArr = updateConceptRelated(conceptArr, "secH", acrossCol, withinCol, withinHighlightDisplay);
    // filter the files
    var fileMatched = [];
    for (var f in data[currentDomain]["file concepts"]) {
        if ([...conceptArr].every(val => data[currentDomain]["file concepts"][f].includes(val))) {
            fileMatched.push(f);
            // make matched code examples visable
            document.getElementById(f).style.display = "block";
            document.getElementById(f+"_within_block").style.display = "block";
            document.getElementById(f.replace("_", "")+"vis").style.display = "flex";
        }
    }
    updateHVis(fileMatched);
}    
function switchMode(e) {
    var acrossCol = document.getElementsByClassName("acrossCol"),
        withinCol = document.getElementsByClassName("withinCol");
    conceptFiles();
    if (document.getElementById("showSubstr").checked) {
        [...acrossCol].forEach(function(a) {a.style.display = "block";});
        [...withinCol].forEach(function(w) {w.style.display = "none";});
    } else {
        [...acrossCol].forEach(function(a) {a.style.display = "none";});
        [...withinCol].forEach(function(w) {w.style.display = "block";});
    }
    var showFlag = document.getElementById("switch").checked,
        smallBlocks = document.querySelectorAll(".smallBlock"),
        codeBlocks = document.querySelectorAll(".codeBlock");
    if (showFlag) {
        [...smallBlocks].forEach(function(s) {
            var codes = s.querySelectorAll("code");
            [...codes].forEach(function(c) {
                c.style.fontSize = "initial";
            })
        });
        [...codeBlocks].forEach(function(s) {
            var codes = s.querySelectorAll("code");
            [...codes].forEach(function(c) {
                c.style.fontSize = "initial";
            })
        });
    } else {
        [...smallBlocks].forEach(function(s) {
            var codes = s.querySelectorAll("code");
            [...codes].forEach(function(c) {
                c.style.fontSize = "0rem";
            })
        });
        [...codeBlocks].forEach(function(s) {
            var codes = s.querySelectorAll("code");
            [...codes].forEach(function(c) {
                c.style.fontSize = "0rem";
            })
        });
    }
}
// function call
$.getJSON("static/data/vis_tem.json", function(obj) {
    data["vis"] = obj;
    getData("vis");
    genData(data["vis"]["api templates"]);
    sortFiles("vis");
    processLineData("vis");
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
        const toggleSwitch = document.getElementById('switch');
        toggleSwitch.addEventListener('change', switchMode, false);
        const substringSwitch = document.getElementById('showSubstr');
        substringSwitch.addEventListener('change', switchMode, false);
    });
});