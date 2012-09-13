/*globals TeXSC*/
/*
Document class article
*/

TeXSC.stdClass = SC.Object.extend({

  _docClass: null,

  docType: null, // fed as a parameter to the document class

  _defaultPackages: [
  { packageName: 'ucs'},
  { packageName: 'inputenc', params: 'utf8,utf8x'}
  ], 
  // a set of packages to include in all documents, 
  //hardcode as the create function is not yet available

  _stdPackages: null, // a set of standard packages to include for a specific document class
  
  // an array with objects { packageName: '', params: ''}
  _userPackages: null, // a set of packages the user wants to include too                   

  preamble: null, // user defined additions to the preamble

  content: null, // actual document content, array of elements

  font: null, // document font

  fontSize: null, // document font size

  fontFamily: null, // Roman, Sans Serif or Typewriter

  _fontEncoding: null, // encoding 

  paperSize: null, // document paper size

  pageStyle: null, // page style

  isSloppy: null,

  generateDocument: function(){
    // function to generate a tex document from the content
    var preamble = this.generatePreamble();
    var content = this.get('content');
    return [preamble,"\\begin{document}\n",content,"\\end{document}\n"].join("");
  },

  _createPackageObj: function(packageName, params){
    return { packageName: packageName, params: params };
  },

  // future idea: create mixins with package functions
  // now the graphic functions are on the stdClass, but it is easy to mixin the stuff at runtime
  addPackage: function(packageName, params){
    var package;
    if(!this._userPackages) this._userPackages = [];
    if(this.hasPackage(packageName)){
      package = this._userPackages.findProperty('packageName',packageName);
      if(package) package.params = params;
      else this._stdPackages.findProperty('packageName',packageName).params = params;
    }
    else this._userPackages.push(this._createPackageObj(packageName,params));
    return this;
  },
  
  hasUserPackage: function(packageName){
    if(!this._userPackages) return false;
    else return !!this._userPackages.findProperty('packageName',packageName);
  },
  
  hasStdPackage: function(packageName){
    return !!this._stdPackages.findProperty('packageName',packageName);
  },
  
  hasPackage: function(packageName){
    return this.hasUserPackage(packageName) || this.hasStdPackage(packageName);
  },

  _generateDocumentClass: function(){
    var docClass = this._docClass;
    var docType = this.get('docType');
    var docFontSize = this.get('fontSize');
    var docFont = this.get('font');      
    //      var docPaperSize = this.get('paperSize');
    var ret = '\\documentclass';
    ret += this._parsePackageParams([docType,docFontSize,docFont]);
    ret += this._parsePackageName(docClass);
    return ret + "\n";
  },

  _parsePackageName: function(packageName){
    return "{" + packageName + "}";
  },

  _parsePackageParams: function(paramArray){
    // function to generate a set of package parameters 
    if((paramArray instanceof Array) && (paramArray.length > 0)){
      var filterFunc = function(val){ return val? YES: NO;};
      var list = paramArray.filter(filterFunc).join(","); // only keep true values, and join them by comma
      if(list) return "[" + list + "]";   
    }
    return "";
  },

  _parsePackages: function(packageArray){
    var ret = "", curPack, curPackName, curPackParams;
    for(var i=0,len=packageArray.length;i<len;i++){
      ret += "\\usepackage";
      curPack = packageArray[i];
      curPackName = curPack.packageName;
      curPackParams = curPack.params;

      // if array, create string
      if(curPackParams instanceof Array) ret += this._parsePackageParams(curPackParams);
      else ret = curPackParams? ret + "[" + curPackParams + "]": ret;
      ret += this._parsePackageName(curPackName);
      ret += "\n";
    }
    return ret;
  },

  generateDefaultFontFamily: function(){
    var fontFam = this.get('fontFamily');
    if(SC.typeOf(fontFam) === 'string'){
      var ret = "\\renewcommand{\\familydefault}";
      switch(fontFam.toLowerCase()){
        case 'roman': return ret + "{\\rmdefault}\n"; 
        case 'sansserif': return ret + "{\\sfdefault}\n"; 
        case 'sans serif': return ret + "{\\sfdefault}\n"; 
        case 'typewriter': return ret + "{\\ttdefault}\n"; 
        default: return NO;
      }
    }
    else return NO;
  },

  generatePreamble: function(){
    // function to generate the preamble based on the information in this object
    var ret = this._generateDocumentClass();
    var isSloppy = this.get('isSloppy');
    var stdPackages = this._stdPackages;
    var userPackages = ((this._userPackages instanceof Array) && (this._userPackages.length > 0))? this._userPackages: NO;
    var preamble = this.get('preamble');
    var pageStyle = this.get('pageStyle');

    var defaultFontFamily = this.generateDefaultFontFamily();

    if(ret){
      ret += this._parsePackages(this._defaultPackages); // always include the default
      ret = this._fontEncoding? ret + "\\fontencoding{" + this._fontEncoding + "}\n": ret;
      ret += this._parsePackages(stdPackages) + '\n';
      ret = userPackages? ret + this._parsePackages(userPackages) + '\n': ret; // add userPackages if exists
      ret = defaultFontFamily? ret + defaultFontFamily + '\n': ret;
      ret = preamble? ret + preamble + '\n': ret;
      ret = pageStyle? ret + "\\pagestyle{" + pageStyle + "}\n": ret;
      ret = isSloppy? ret + "\\sloppy \n": ret;
      return ret;
    }
    else return NO;
  },

  _fontSizes: {
    '-4': '\\tiny', // \tiny
    '-3': '\\scriptsize',
    '-2': '\\footnotesize', // \footnotesize
    '-1': '\\small', // \small
    '0': '', // 
    '1': '\\large', // \large
    '2': '\\Large', // \Large
    '3': '\\LARGE', // \LARGE
    '4': '\\huge', // \huge
    '5': '\\Huge' // \Huge
  },

  _fontFamilies: {
    'sansserif': "\\textsf",
    'sans serif': "\\textsf",
    'roman': "\\textrm",
    'typewriter': "\\texttt"
  },

  _fontFaces: {
    'bold': '\\textbf',
    'italic': '\\textit',
    'slanted': '\\textsl',
    'smallcaps': '\\textsc',
    'emphasis': '\\emph'
  },

  createFontInfo: function(size,fontfaces,fontfamily){
    // function to create a font info object:
    // size 0 means same as document definition (or neutral in case no def set)
    // size 1 means one step larger, size -1 means one step smaller
    // fontfamily can be one of the following strings:
    // 'sansserif', 'roman', 'typewriter'
    // fontface can be one of the following strings:
    //,'bold','italic','slanted','smallcaps', 'emphasis' or an array of a series of these terms
    var me = this;
    var styles;
    if(fontfaces && fontfaces instanceof Array){
      styles = fontfaces.map(function(val){
        return me._fontFaces[val];
      });      
    }
    else styles = [ this._fontFaces[fontfaces] ];

    return {
      size: this._fontSizes[size],
      fontFaces: styles,
      fontFamily: fontfamily? this._fontFamilies[fontfamily]: null
    };
  },

  /*
  addline and add paragraph are two variations on the same theme: adding text
  both accept text, a fontInfo object and an aligment parameter
  the alignment parameter can be one of the following strings: justified, left, center or right
  justified is the standard setting
  */

  _alignmentInfo: {
    'left': 'flushleft',
    'center': 'center',
    'right': 'flushright'
  },

  _specialChars: {
    '&': '\\&',
    '%': '\\%'
  },

  _replaceSpecialChars: function(text){
    var ret = text;
    var reg;
    if(!ret.replace){
      SC.Logger.log("ret doesn't have replace? ret is: " + SC.inspect(text));
    }
    var specChars = this._specialChars;
    for(var i in specChars){
      reg = new RegExp(i,'g');
      ret = ret.replace(reg,specChars[i]);
    }
    return ret;     
  },

  _applyCmd: function(cmd,content,params){
    var ret = content;
    if(cmd){
      if(params){
        if(params instanceof Array) ret = cmd + '[' + params.join(",") + ']{' + content + '}';
        else ret = cmd + '[' + params + ']{' + content + '}';
        
      } 
      else ret = cmd + '{' + content + '}';
    }
    return ret;
  },

  _applyFontInfo: function(text,fontInfo){
    var ret = text;
    if(fontInfo){
      if(fontInfo.size){
        ret = this._applyCmd(fontInfo.size,ret);
      }
      if(fontInfo.fontFaces){
        var faces = fontInfo.fontFaces;
        for(var i=0,len=faces.length;i<len;i++){
          ret = this._applyCmd(faces[i],ret);   
        }
      }
      if(fontInfo.fontFamily){
        ret = this._applyCmd(fontInfo.fontFamily,ret);
      }
    }
    return ret;
  },

  _applyAlignment: function(text,alignment){
    var align = this._alignmentInfo[alignment];
    if(align) return "\\begin{" + align + "}" + text + " \\end{" + align + "}";
    else return text;
  },

  _applyNoIndent: function(text){
    // apply noindent to the text
    return "\\noindent " + text;
  },

  _applyTextInfo: function(text,fontInfo,shouldIndent){
    var ret = (SC.typeOf(text) !== 'string')? text.toString(): text;
    ret = this._replaceSpecialChars(ret);
    ret = this._applyFontInfo(ret,fontInfo);

    if(shouldIndent){
      ret = this._applyNoIndent(ret);
    }
    return ret;
  },
  
  begin: function(tagname){
    var ret = this._applyCmd("\\begin",tagname);
    return this.add(ret);
  },
  
  end: function(tagname){
    var ret = this._applyCmd("\\end",tagname);
    return this.add(ret);
  },
  
  add: function(texCode){
    var content = this.get('content'),ret;
    if(texCode){
      ret = content? content + texCode + "\n": texCode + "\n";
      this.set('content',ret);
    }
    return this;
  },
  
  startCommand: function(cmd,options){
    var opts,ret;
    ret = "\\" + cmd;
    if(options){
      if(options instanceof Array) ret += "[" + options.join(",") + "]";
      else ret += "[" + options + "]";
    }
    return this.add(ret + "{");
  },
  
  endCommand: function(cmd){
    return this.add("}");
  },
  
  wrapWith: function(tagname,wrappedContent){
    return this.begin(tagname).add(wrappedContent).end(tagname);
  },
  
  addText: function(text,fontInfo,alignment,shouldIndent){
    var ret = (SC.typeOf(text) !== 'string')? text.toString(): text;
    if(text !== ""){
      ret = this._applyTextInfo(ret,fontInfo,shouldIndent);
      ret = this._applyAlignment(ret,alignment);
    }
    return this.add(ret);
  },

  addLine: function(text,fontInfo,alignment,shouldIndent){
    //work from inner to outer layers
    // so parse the text on special characters 
    var ret = (SC.typeOf(text) !== 'string')? text.toString(): text;
    if(text !== ""){
      ret = this._applyTextInfo(text,fontInfo,shouldIndent);
      ret += "\\\\"; //add a line break
      ret = this._applyAlignment(ret,alignment);   
    }
    ret += "\n"; // if text === "", just do a newline
    return this.add(ret);
  },

  addParagraph: function(text,fontInfo,alignment,shouldIndent){
    // add a piece of text as a paragraph
    var ret = this._applyTextInfo(text,fontInfo,shouldIndent);
    ret += "\\\\";
    ret = this._applyAlignment(ret,alignment);      
    ret += "\n\\\\\n";
    return this.add(ret);
  },

  addVSpaceMm: function(distanceInMM){
    // adds a vspace of dist mm
    var ret = this._applyCmd("\\vspace",distanceInMM + "mm") + "\n";
    return this.add(ret);
  },

  addVSpaceCm: function(distanceInCM){
    // adds a vspace of dist cm
    var ret = this._applyCmd("\\vspace",distanceInCM + "cm") + "\n";
    return this.add(ret);
  },

  addVSpaceText: function(text){
    // adds a vspace of dist text
    var ret = this._applyCmd("\\vspace",text) + "\n";
    return this.add(ret);
  },

  // opts is an object with the following recognized options
  //{
  //  viewport: [lowerleft_x,lowerleft_y,upperright_x,upperright_y],
  //  isClipping: true/false,
  //  scale: number,
  //  width: number,
  //  height: number,
  //  angle: number
  //}
  includeGraphics: function(path,opts){
    if(!this.hasPackage('graphicx')) this.addPackage('graphicx');
    var command = (opts && opts.isClipping)? '\\includegraphics*': '\\includegraphics';
    var curContent = this.get('content');
    var params = [], ret;
    if(opts.scale) params.push("scale=" + opts.scale);
    if(opts.width) params.push("width=" + opts.width);
    if(opts.height) params.push("height=" + opts.height);
    if(opts.angle) params.push("angle=" + opts.angle);
    if(opts.viewport) params.push("viewport=" + opts.viewport.join(" "));
    ret = this._applyCmd(command,path,params);
    return this.add(ret);
  },
  
  insertScaleBox: function(scale,scaleBoxContent){
    var params = scale? ["scale=" + scale]: null;
    var content = this.get('content');
    var ret;
    
    if(!this.hasPackage('graphicx')) this.addPackage('graphicx');
    if(scaleBoxContent) ret = this._applyCmd("\\scalebox", scaleBoxContent, params);
    return this.add(ret);
  },
  
  insertRotateBox: function(angle,rotateBoxContent){
    var params = angle? ["angle=" + angle]: null;
    var ret, content = this.get('content');
    
    if(!this.hasPackage('graphicx')) this.addPackage('graphicx');
    if(rotateBoxContent) ret = this._applyCmd("\\rotatebox", rotateBoxContent, params);
    return this.add(ret);
  },
  
  insertReflectBox: function(reflectBoxContent){
    var ret, content = this.get('content');
    
    if(!this.hasPackage('graphicx')) this.addPackage('graphicx');
    if(reflectBoxContent) ret = this.applyCmd("\\reflectbox",reflectBoxContent);
    return this.add(ret);
  },
  
  insertNewPage: function(){
    var content = this.get('content');
    if(!content) console.log('weird... setting a new page without previous content?');
    return this.add(this._applyCmd("\\newpage"));
  }

});