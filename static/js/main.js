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
            inside = document.createElement("div"),
            condition = document.createElement("div");
        out.className = "hVisOut";
        inside.className = "hVisIn";
        inside.style.width = (tem[n[i]]/30)*7+"rem";
        inside.id = hVis.id +"_" + n[i] + "_origin";
        condition.className = "conditionVis";
        condition.style.width = (tem[n[i]]/30)*7+"rem";
        condition.id = hVis.id +"_" + n[i] + "_condition";
        if (tem[n[i]] != "0") {
            condition.innerText = tem[n[i]];
        }
        out.appendChild(condition);
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
        hVis.id = tem[i]['name']+"_hVis";
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
            /*
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
            */
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
function clickH(event) {
    if (event.target.classList.contains("activated")) {
        event.target.classList.remove("activated");
        event.target.querySelector(".hName").style.backgroundColor = "transparent";
    } else {
        event.target.className += " activated";
        event.target.querySelector(".hName").style.backgroundColor = conceptColors[event.target.id];
    }
    conceptFiles();
}
function addHListener() {
    var secH = document.getElementsByClassName("secH"),
        firH = document.getElementsByClassName("firH");
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
                document.getElementById(i.name+"_hVis_"+l+"_condition").style.width = (i[l]/30)*7+"rem";
                document.getElementById(i.name+"_hVis_"+l+"_condition").innerText = i[l];
            }
            continue;
        } else if (i.name in conceptFreq) {
            for (var l in conceptFreq[i.name]) {
                document.getElementById(i.name+"_hVis_"+l+"_condition").style.width = (conceptFreq[i.name][l]/30)*7+"rem";
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
            }
        }
    }
}
function conceptFiles() {
    var acrossCol = document.getElementsByClassName("acrossCol"),
        withinCol = document.getElementsByClassName("withinCol");
    var initialSelectionFlag = 0;
    var concepts = document.getElementsByClassName("secH");
    [...concepts].forEach(function(c) {if (c.classList.contains("activated")) {initialSelectionFlag = 1}});
    if (initialSelectionFlag) {
        initialSelection = false;
    } else {
        initialSelection = true;
    };
    if (initialSelection) {
        var codes = document.getElementsByClassName("codeRange");
        [...codes].forEach(function(c) {c.style.display = "block"});
        var codesWithin = document.getElementsByClassName("smallBlock");
        [...codesWithin].forEach(function(c) {c.style.display = "block"});
        [...acrossCol].forEach(function(a) {
            var hlsWthin = a.querySelectorAll(".highlights");
            [...hlsWthin].forEach(function(h) {
                h.style.backgroundColor = initialColors[h.classList[1]];
                h.style.display = "inline-block";
            });
            controlCommonWords(a);
        });
        [...withinCol].forEach(function(w) {
            var hlsWthin = w.querySelectorAll(".highlights");
            [...hlsWthin].forEach(function(h) {
                h.style.backgroundColor = initialColors[h.classList[1]];
                h.style.display = "inline-block";
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
    if (document.getElementById("switch").checked) {
        var withinHighlightDisplay = "inline-block";
        [...acrossCol].forEach(function(a) {
            var hls = a.querySelectorAll(".highlights");
            [...hls].forEach(function(h) {
                h.style.backgroundColor = "#fff";
                h.style.display = withinHighlightDisplay;
            });
            controlCommonWords(a);
        });
        [...withinCol].forEach(function(w) {
            var hlsWthin = w.querySelectorAll(".highlights");
            [...hlsWthin].forEach(function(h) {
                h.style.backgroundColor = "#fff";
                h.style.display = withinHighlightDisplay;
            });
            controlCommonWords(w);
        });
    } else {
        var withinHighlightDisplay = "block";
        [...acrossCol].forEach(function(a) {
            var hls = a.querySelectorAll(".highlights");
            [...hls].forEach(function(h) {
                h.style.backgroundColor = "#fff";
                h.style.display = "none";
            });
            controlCommonWords(a);
        });
        [...withinCol].forEach(function(w) {
            var hlsWthin = w.querySelectorAll(".highlights");
            [...hlsWthin].forEach(function(h) {
                h.style.display = "none";
            });
            controlCommonWords(w);
        });
    }
    var spans = document.getElementsByClassName("markerSpan");
    [...spans].forEach(function(s) {s.style.opacity = "0"});
    var visRange = document.getElementsByClassName("visRange");
    [...visRange].forEach(function(v) {v.style.display = "none";});
    // get all selected concepts
    var conceptArr = new Set(),
        conceptColor = "#5d5f5f";
    var concepts = document.getElementsByClassName("secH");
    [...concepts].forEach(function(c) {
        if (c.classList.contains("activated")) {
            var conceptName = c.id;
            var conceptLevel = conceptName.split("_")[0];
            var conceptColor = conceptColors[conceptName];
            conceptArr.add(conceptName); // cat_preprocessing
            // make all elements related to concepts visable
            // highlights
            [...acrossCol].forEach(function(a) {
                var hls = a.querySelectorAll("."+conceptName);
                [...hls].forEach(function(h) {
                    h.style.display = withinHighlightDisplay;
                    h.style.backgroundColor = conceptColor;
                });
                controlCommonWords(a, conceptName);
            });
            [...withinCol].forEach(function(w) {
                var hlsWthin = w.querySelectorAll("."+conceptName);
                [...hlsWthin].forEach(function(h) {
                    h.style.display = withinHighlightDisplay;
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
    updateHVis(fileMatched);
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