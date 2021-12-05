import json

class stats():
    def __init__(self, dir) -> None:
        self.dir = dir
        self.concepts = {}
        self.info = {}
        self.read_dir()
        self.count_concepts()
        self.get_file_info()
    
    def read_dir(self):
        with open(self.dir, "r") as jf:
            content = json.load(jf)
        jf.close()
        self.api_templates = content["api templates"]
        self.all_templates = content["all templates"]
        self.labeled_files = content["labeled files"]

    def count_files(self, content):
        nlines = len(content.splitlines())
        nchara = len(content)
        return nlines, nchara

    def count_concepts(self):
        for _, value in self.api_templates.items():
            for c in value:
                for name, file_list in c.items():
                    for k in file_list["codes"]:
                        if k in self.concepts:
                            self.concepts[k].append(name)
                        else:
                            self.concepts[k] = [name]

    def get_file_info(self):
        for f, f_content in self.labeled_files.items():
            nlines, nchara = self.count_files(f_content)
            self.info[f] = {"nlines": nlines, "nchara": nchara}
    

if __name__ == "__main__":
    dir = "./all_tem.json"
    file_return = stats(dir)
    data = {
        "api templates": file_return.api_templates, 
        "all templates": file_return.all_templates, 
        "labeled files": file_return.labeled_files,
        "file concepts": file_return.concepts,
        "file info": file_return.info
    }

    with open(dir, "w+") as tem:
        json.dump(data, tem)
    tem.close()