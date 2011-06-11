/*
Document class article
*/
sc_require('classes/stdClass');

TeXSC.Article = TeX.stdClass.extend({
   
   _docClass: 'article',
   
   docType: null, // fed as a parameter to the document class
   
   font: null,
   
   fontSize: null,
   
   _fontEncoding: 'T1',
   
   pageStyle: 'empty',
   
   isSloppy: YES,
   
   _stdPackages: [ 
      TeX.stdClass.prototype._createPackageObj('geometry', 'margin=3cm'),
      TeX.stdClass.prototype._createPackageObj('hyperref'),
      TeX.stdClass.prototype._createPackageObj('graphicx'),
      TeX.stdClass.prototype._createPackageObj('hyphenat', 'none'),
      TeX.stdClass.prototype._createPackageObj('amsmath')
   ]
   
});

