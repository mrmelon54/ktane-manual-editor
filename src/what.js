const safecoderegex = [
  [/src\=\"((?!data\:)(?!https\:).+?)\"/gi, 'src="https://ktane.timwi.de/HTML/$1"'],
  [/xlink\:href\=\"((?!data\:).+?)\"/gi, 'xlink:href="https://ktane.timwi.de/HTML/$1"'],
  [/<link (.+?) href\=\"(.+?)\">/gi, '<link $1 href="https://ktane.timwi.de/HTML/$2">'],
];

class App {
  constructor(appcontainer, buttonsrow) {
    var that = this;
    var codeeditorwrapper = $('<div data-role="code-editor-wrapper"></div>');
    var codeeditortextarea = $('<textarea data-role="code-editor"></textarea>').appendTo(codeeditorwrapper);
    var gitdiffwrapper = $('<div data-role="git-diff-wrapper"></div>');
    var gitdifftextarea = $('<textarea data-role="git-diff"></textarea>').appendTo(gitdiffwrapper);
    var viewframewrapper = $('<div data-role="view-frame-wrapper"></div>');
    var viewframepage = $('<iframe data-role="view-frame-page"></iframe>').appendTo(viewframewrapper);
    var layoutoptions = $('<div data-role="layout-options"></div>');
    var layoutoptionslist = $('<div data-role="layout-options-list"></div>').appendTo(layoutoptions);
    var layoutoption_ce_gd = $('<li data-action="layout-ce-gd">Code Editor and Git Diff</div>').appendTo(layoutoptionslist);
    var layoutoption_ce_vf = $('<li data-action="layout-ce-vf">Code Editor and Preview Manual</div>').appendTo(layoutoptionslist);
    var layoutoption_gd_vf = $('<li data-action="layout-gd-vf">Git Diff and Preview Manual</div>').appendTo(layoutoptionslist);
    layoutoption_ce_gd.click(function () {
      $("body").attr("layout", "ce-gd");
      that.update();
    });
    layoutoption_ce_vf.click(function () {
      $("body").attr("layout", "ce-vf");
      that.update();
    });
    layoutoption_gd_vf.click(function () {
      $("body").attr("layout", "gd-vf");
      that.update();
    });
    appcontainer.append(codeeditorwrapper);
    appcontainer.append(gitdiffwrapper);
    appcontainer.append(viewframewrapper);
    appcontainer.append(layoutoptions);
    this.loadedManual = "";
    this.editor = new LiveManualEditor(this, codeeditortextarea[0], gitdifftextarea[0]);
    this.viewer = new LiveManualViewer(viewframepage[0]);
    this.modulenamelabel = $("<label>Module filename (click for help):</label>");
    this.modulenameinput = $('<input id="module-filename">');
    this.modulenamebtn = $('<button data-action="load">Load Manual</button>');
    this.renamebtn = $('<button data-action="rename">Rename Manual</button>');
    this.downloadbtn = $('<button data-action="download" manual="">Download Manual</button>');
    this.helpbtn = $('<button data-action="help">Ask for help or report bugs</button>');
    this.buttonsrow = buttonsrow;
    this.buttonsrow.append(this.modulenamelabel);
    this.buttonsrow.append(this.modulenameinput);
    this.buttonsrow.append(this.modulenamebtn);
    this.buttonsrow.append(this.helpbtn);

    this.modulenamelabel.click(function () {
      alert('Enter the name of a manual without ".html" (e.g. "Remote Math") or enter the manual\'s URL (e.g. "https://ktane.timwi.de/HTML/Remote Math.html")');
    });
    this.modulenamebtn.click(function () {
      var reg = /^(https\:\/\/ktane\.timwi\.de\/html\/)?([^\/]+)?(\.html)?$/i.exec(that.modulenameinput.val());
      if (reg !== null) {
        var modulename = reg[2];
        that.editor.loadPage(modulename);
      }
    });
    this.renamebtn.click(function () {
      var result = prompt();
      if (result === null || result === "") alert("Invalid manual name");
      else {
        alert('Renamed the manual to "' + result + '"');
        that.editor.newManualName = result;
        that.update();
      }
    });
    this.downloadbtn.click(function () {
      that.downloadEditedManual();
    });
    this.helpbtn.click(function () {
      alert("For help with this program or to report bugs please contact Melon in the KTaNE Discord server");
    });
    this.editor.codeeditor.on("change", function () {
      that.update();
    });
  }

  getDownloadName() {
    return this.editor.newManualName === null ? this.editor.loadedManual : this.editor.newManualName;
  }

  downloadEditedManual() {
    var that = this;
    let j = document.createElement("a");
    j.download = that.getDownloadName() + ".html";
    j.href = URL.createObjectURL(new Blob([that.editor.codeeditor.getValue()]));
    j.click();
  }

  updateLiveView() {
    this.viewer.loadView(this.editor.getCode());
  }
  updateGitDiff() {
    this.editor.loadDiff();
  }
  update() {
    var layout = $("body").attr("layout");
    if (layout.includes("vf")) this.updateLiveView();
    if (layout.includes("gd")) this.updateGitDiff();
    this.downloadbtn.attr("manual", this.getDownloadName() + ".html");
    if (this.getDownloadName() !== null) {
      this.renamebtn.appendTo(this.buttonsrow);
      this.downloadbtn.appendTo(this.buttonsrow);
    } else {
      this.renamebtn.detach();
      this.downloadbtn.detach();
    }
  }
}

class LiveManualEditor {
  constructor(parent, codeeditor, gitdiffviewer) {
    this.updateParent = function () {
      parent.update();
    };
    this.loadedManual = null;
    this.newManualName = null;
    this.codeeditor = CodeMirror.fromTextArea(codeeditor, {
      lineNumbers: true,
      mode: "htmlmixed",
    });
    this.gitdiff = CodeMirror.fromTextArea(gitdiffviewer, {
      lineNumbers: true,
      mode: "diff",
      readOnly: true,
    });
    this.originalContent = "";
    this.changedContent = "";
    this.mappedchanges = [];
    this.scrollingElement = "none";
    this.lastCodeEditorScrollPosition = 0;
    this.lastGitDiffScrollPosition = 0;
    var that = this;
    this.codeeditor.getWrapperElement().addEventListener("keydown", function () {
      that.scrollingElement = "codeeditor";
    });
    this.codeeditor.getScrollerElement().addEventListener("scroll", function () {
      that.scrollingElement = "codeeditor";
    });
    this.gitdiff.getWrapperElement().addEventListener("keydown", function () {
      that.scrollingElement = "gitdiff";
    });
    this.gitdiff.getScrollerElement().addEventListener("scroll", function () {
      that.scrollingElement = "gitdiff";
    });
    setInterval(function () {
      if (that.scrollingElement == "codeeditor") {
        that.scrollingElement = "none";
        that.onCodeEditorScroll();
      } else if (that.scrollingElement == "gitdiff") {
        that.scrollingElement = "none";
        that.onGitDiffScroll();
      }
    });
  }

  loadPage(name) {
    var that = this;
    $.ajax({
      url: "/live-manual-editor/proxy.php?manual=" + name,
      success: function (data) {
        that.codeeditor.setValue(data);
        that.originalContent = data;
        that.changedContent = "";
        that.mappedchanges = [];
        that.gitdiff.setValue("");
        that.loadedManual = name;
        that.newManualName = null;
        that.updateParent();
      },
      error: function (err) {
        console.error(err);
        alert("There was an error downloading the manual");
      },
    });
  }

  getCodeEditorTopLine() {
    var rect = this.codeeditor.getWrapperElement().getBoundingClientRect();
    return this.codeeditor.lineAtHeight(rect.top, "window");
  }

  getGitDiffTopLine() {
    var rect = this.gitdiff.getWrapperElement().getBoundingClientRect();
    return this.gitdiff.lineAtHeight(rect.top, "window");
  }

  onCodeEditorScroll() {
    if (this.disableCodeEditorScrollEvent) return;
    var that = this;
    var scroll = that.codeeditor.getScrollInfo();
    var topline = that.getCodeEditorTopLine();
    var lineheight = that.gitdiff.getLineHandle(0).height;
    var changes = that.mappedchanges;
    var originalPosition = 0;
    var extraDistance = 0;
    for (var i = 0; i < changes.length; i++) {
      if (originalPosition == topline) break;
      switch (changes[i]) {
        case "+":
        case " ":
          originalPosition++;
          break;
        default:
          extraDistance++;
      }
    }
    var newscrollpos = scroll.top + lineheight * extraDistance;
    that.gitdiff.scrollTo(scroll.left, newscrollpos);
  }

  onGitDiffScroll() {
    if (this.disableGitDiffScrollEvent) return;
    var that = this;
    var scroll = that.gitdiff.getScrollInfo();
    var topline = that.getGitDiffTopLine();
    var lineheight = that.codeeditor.getLineHandle(0).height;
    var changes = that.mappedchanges;
    var originalPosition = 0;
    var extraDistance = 0;
    for (var i = 0; i < changes.length; i++) {
      if (originalPosition == topline) break;
      switch (changes[i]) {
        case "+":
        case " ":
          originalPosition++;
          break;
        default:
          extraDistance++;
      }
    }
    var newscrollpos = scroll.top - lineheight * extraDistance;
    that.codeeditor.scrollTo(scroll.left, newscrollpos);
  }

  getCode() {
    this.changedContent = this.codeeditor.getValue();
    return this.changedContent;
  }

  loadDiff() {
    this.changedContent = this.codeeditor.getValue();
    var diffvalue = this.getDiff(this.originalContent.replace(/\r/g, ""), this.changedContent.replace(/\r/g, ""));
    this.mappedchanges = [...diffvalue.split("\n").map((x) => (x + " ")[0])];
    this.gitdiff.setValue(diffvalue);
    this.onCodeEditorScroll();
  }

  getDiff(text1, text2) {
    var diff_symbols = ["-", " ", "+"];
    return this.diff_lineMode(text1, text2)
      .map((x) =>
        x[1]
          .split("\n")
          .slice(0, -1)
          .map((y) => diff_symbols[x[0] + 1] + " " + y)
          .join("\n")
      )
      .join("\n");
  }

  diff_lineMode(text1, text2) {
    var dmp = new diff_match_patch();
    var a = dmp.diff_linesToChars_(text1, text2);
    var lineText1 = a.chars1;
    var lineText2 = a.chars2;
    var lineArray = a.lineArray;
    var diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return diffs;
  }
}

class LiveManualViewer {
  constructor(page) {
    var that = this;
    this.viewframe = page;
    this.viewframe.sandbox = "allow-scripts";
    this.viewframe.src = "/live-manual-editor/cdn/HTML/EmbeddedFrame.html";
  }

  loadView(code) {
    for (var i = 0; i < safecoderegex.length; i++) {
      code = code.replace(safecoderegex[i][0], safecoderegex[i][1]);
    }
    this.viewframe.contentWindow.postMessage("update-document::" + code, "*");
  }
}
