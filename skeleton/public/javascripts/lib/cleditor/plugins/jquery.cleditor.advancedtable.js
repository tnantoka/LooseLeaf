/**
 @preserve CLEditor Advanced Table Plugin v1.0.0
 http://premiumsoftware.net/cleditor
 requires CLEditor v1.2.2 or later
 
 Copyright 2010, Sergio Drago
 Dual licensed under the MIT or GPL Version 2 licenses.

 Based on Chris Landowski's Table Plugin v1.0.2
*/

// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name jquery.cleditor.advancedtable.min.js
// ==/ClosureCompiler==

(function($) {

  // Define the table button
  $.cleditor.buttons.table = {
    name: "table",
    image: "table.gif",
    title: "Insert Table",
    command: "inserthtml",
    popupName: "table",
    popupClass: "cleditorPrompt",
    popupContent:
      "<table cellpadding=0 cellspacing=0><tr>" +
      "<td style=\"padding-right:6px;\">Cols:<br /><input type=text value=4 size=12 /></td>" +
      "<td style=\"padding-right:6px;\">Rows:<br /><input type=text value=4 size=12 /></td>" +
      "</tr><tr>" +
      "<td style=\"padding-right:6px;\">Cell Spacing:<br /><input type=text value=2 size=12 /></td>" +
      "<td style=\"padding-right:6px;\">Cell Padding:<br /><input type=text value=2 size=12 /></td>" +
      "</tr><tr>" +
      "<td style=\"padding-right:6px;\">Border:<br /><input type=text value=1 size=12 /></td>" +
      "<td style=\"padding-right:6px;\">Style (CSS):<br /><input type=text size=12 /></td>" +
      "</tr></table><br /><input type=button value=Submit  />",
    buttonClick: tableButtonClick
  };

  // Add the button to the default controls
  $.cleditor.defaultOptions.controls = $.cleditor.defaultOptions.controls
    .replace("rule ", "rule table ");

  // Table button click event handler
  function tableButtonClick(e, data) {

    // Wire up the submit button click event handler
    $(data.popup).children(":button")
      .unbind("click")
      .bind("click", function(e) {

        // Get the editor
        var editor = data.editor;

        // Get the column and row count
        var $text = $(data.popup).find(":text"),
          cols = parseInt($text[0].value),
          rows = parseInt($text[1].value),
          spacing = parseInt($text[2].value),
          padding = parseInt($text[3].value),
          border = parseInt($text[4].value),
          styles = $text[5].value;

        if (parseInt(cols) < 1 || !parseInt(cols)) cols = 0;
        if (parseInt(rows) < 1 || !parseInt(rows)) rows = 0;
        if (parseInt(spacing) < 1 || !parseInt(spacing)) spacing = 0;
        if (parseInt(padding) < 1 || !parseInt(padding)) padding = 0;
        if (parseInt(border) < 1 || !parseInt(border)) border = 0;

        // Build the html
        var html;
        if (cols > 0 && rows > 0) {
          html = "<table border=" + border + " cellpadding=" + padding +
            " cellspacing=" + spacing + 
            (styles ? ' style="' + styles + '"' : "") + ">";
          for (y = 0; y < rows; y++) {
            html += "<tr>";
            for (x = 0; x < cols; x++)
              html += "<td>" + x + "," + y + "</td>";
            html += "</tr>";
          }
          html += "</table><br />";
        }

        // Insert the html
        if (html)
          editor.execCommand(data.command, html, null, data.button);

        // Reset the text, hide the popup and set focus
        $text[0].value = "4";
        $text[1].value = "4";
        $text[2].value = "2";
        $text[3].value = "2";
        $text[4].value = "1";
        $text[5].value = "";
        editor.hidePopups();
        editor.focus();

      });

    }

})(jQuery);