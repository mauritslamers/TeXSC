/*globals TeXSC*/

/*
Document class article
*/
sc_require('classes/stdClass');

TeXSC.Article = TeXSC.stdClass.extend({
   
   _docClass: 'article',
   
   docType: null, // fed as a parameter to the document class
   
   font: null,
   
   fontSize: null,
   
   _fontEncoding: 'T1',
   
   pageStyle: 'empty',
   
   isSloppy: YES,
   
   _stdPackages: [ 
      TeXSC.stdClass.prototype._createPackageObj('geometry', 'margin=3cm'),
      TeXSC.stdClass.prototype._createPackageObj('hyperref'),
      TeXSC.stdClass.prototype._createPackageObj('graphicx'),
      TeXSC.stdClass.prototype._createPackageObj('hyphenat', 'none'),
      TeXSC.stdClass.prototype._createPackageObj('amsmath')
   ]
   
});

