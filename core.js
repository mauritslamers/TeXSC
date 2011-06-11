// ==========================================================================
// Project:   TeXSC
// Copyright: ©2010 Maurits Lamers
// ==========================================================================
/*globals TeXSC */

/** @namespace

  A simple SC framework for generating LaTeX documents.
  
  @extends SC.Object
*/
TeXSC = SC.Object.create(
  /** @scope Tex.prototype */ {

  NAMESPACE: 'Tex',
  VERSION: '0.1.0',

  FONTFAM_SS: 'sansserif',
  FONTFAM_TW: 'typewriter',
  FONTFAM_RM: 'roman'
  
/*  
  '-4': '\\tiny', // \tiny
  '-3': '\\scriptsize',
  '-2': '\\footnotesize', // \footnotesize
  '-1': '\\small', // \small
  '0': '', // 
  '1': '\\large', // \large
  '2': '\\Large', // \Large
  '3': '\\LARGE', // \LARGE
  '4': '\\huge', // \huge
  '5': '\\Huge' // \Huge */

}) ;
