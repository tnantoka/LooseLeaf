/*
 * tagget
 * lightweight html editor on textarea
 * http://tagget.bornneet.com/
 */
// TODO: refactoring
(function($) {

  var TAB = '  ';

  /**
   * Object for set/get suggesion words
   */
  var Suggester = {
  
    keywords: {  
    
      html: (function() {
        // elements in <head>    
        var header = [
        ];        
        // elements in <body>    
        var body = [
          '<a href="#{c}"></a>',
          '<address>#{c}</address>',
          '<img src="#{c}" />',
          '<br />',
          '<div>#{c}</div>\n',
          '<span>#{c}</span>',
          '<p>#{c}</p>\n',

          '<h1>#{c}</h1>\n',
          '<h2>#{c}</h2>\n',
          '<h3>#{c}</h3>\n',
          '<h4>#{c}</h4>\n',
          '<h5>#{c}</h5>\n',
          '<h6>#{c}</h6>\n',

          '<ul>\n<li>#{c}</li>\n</ul>\n',
          '<ol>\n<li>#{c}</li>\n</ol>\n',
          '<li>#{c}</li>\n',
          '<dl>\n<dt>#{c}</dt>\n<dd></dd>\n</dl>\n',
          '<dt>#{c}</dt>\n',
          '<dt>#{c}</dd>\n',

          '<table>\n#{c}\n</table>\n',
          '<tr>#{c}</tr>',
          '<th>#{c}</th>',
          '<td>#{c}</td>',

          '<strong>#{c}</strong>',
          '<em>#{c}</em>',

          '<form>\n#{c}\n</form>',
          '<fieldset>#{c}</fieldset>',
          '<input type="#{c}" />',
          '<textarea>#{c}</textarea>',

          '<!--',
          '-->',
          '<!-- #{c} -->'
        ];
        var attributes = [
          'href="#{c}"',
          'src="#{c}"',
          'cols="#{c}"',
          'rows="#{c}"',
          'id="#{c}"',
          'class="#{c}"',
          'style="#{c}"',
          'alt="#{c}"',
          'target="#{c}"',

          'colspan="#{c}"',
          'rowspan="#{c}"',
          'border="#{c}"',

          'onload="#{c}"',
          'onclick="#{c}"',
          'onmouseover="#{c}"',
          'onmouseout="#{c}"',
          'ondblclick="#{c}"',
          'onsubmit="#{c}"',
          
          'type="#{c}"',
          'value="#{c}"',
          'name="#{c}"',
          'action="#{c}"',

          'lang="#{c}'
        ];        
        var values = [
          'UTF-8',
          'EUC-JP',
          'Shift-JIS',
          'text',
          'button',
          'submit',
          'reset',
          'reset',
          '_blank',
          'ja'
        ];
        return header.concat(body, attributes, values);
      })(),
      
      js: (function() {      
        var objs = [
          'function() { #{c} }',
          'if (#{c}) { }',
          'alert(\'#{c}\')',
          'console.log(\'#{c}\')'
        ];        
        var libs = [
          'click(#{c});',
          'html(#{c});'
        ];        
        return objs.concat(libs);          
      })(),
      
      css: (function() {      
        var props = [
          'margin: ',
          'margin-right: ',
          'margin-left: ',
          'margin-top: ',
          'margin-bottom: ',
          
          'padding: ',
          'padding-right: ',
          'padding-left: ',
          'padding-top: ',
          'padding-bottom: ',
          
          'border: ',
          'border-right: ',
          'border-left: ',
          'border-top: ',
          'border-bottom: ',
          
          'background: ',
          'background-color: ',
          'background-repeat: ',
          
          'float: ',
          'clear: '
        ];              
        var values = [
          'auto',
          'center',
          'right',
          'left',
          'both'
        ];
        return props.concat(values);          
      })(),
      
      html5: (function() {      
        var elm = [        
        ];        
        var attr = [
        ];      
        return elm.concat(attr);      
      })(),

      css3: (function() {
        var prop = [
        ];
        var val = [
        ];
        return prop.concat(val);
      })()
      
    }, // keywords
  
    /**
     * Add keyword
     * (same format as keywords)
     */
    add: function(newwords) {
      for(var type in newwords) {  
        if (this.keywords[type]) {
          this.keywords[type].concat(newwords[type]);
        } else {
          this.keywords[type] = newwords[type];
        }  
      }
    }, //add
    
    /**
     * Get suggestion
     */
    get: function(ta, str) {
    
      if (!ta || !str || !ta.value) {
        return false;
      }
      
      var matches = {
        view: [],
        insert: []
      };
    
      var words = [];

      // Suggestion by ta.value
      if (Wrapper.checkIntelli(ta)) {
        // Analyze ta.value
        // (character sequence exclude symbol)
        var a = ta.value.match(/[^<>\s　'"#\=:;{}\(\)!?,*]{2,}/g) || [];

        // Delete duplication
        var temp = [];        
        for (var i = 0; i < a.length; i++) {        
          var v = a[i];        
          if (!(v in temp)) {
            words.push(v);
            temp[v] = true;
          }        
        }        
      }

      for(var key in this.keywords) {
        if (Wrapper.checkType(ta, key)) {
          words = words.concat(this.keywords[key]);
        }
      }

      for(var i = 0; i < words.length; i++) {      
        if (words[i] != str && words[i].indexOf(str) == 0) {
          matches.view.push(words[i].replace(/#\{c\}/g, ''));
          // Insert suggestion exclude that has already typed
          matches.insert.push(words[i].slice(str.length));
        }
      }
        
      return (matches.view.length != 0) ? matches : false;
    }
  
  };

  /**
   * Manage html wrapping textarae
   */
  Wrapper = {
  
    isToolbar: true,
  
    // Wrapping textarea
    wrap: function(ta, i) {
    
      // Already wrapped
      if ($(ta).parents().is('.tagget_wrapper')) {
        this.relate(ta);
        return true;
      }
      
      var wrapper = $(ta).wrap('<div class="tagget_wrapper"><p class="tagget_main"></p></div>')
        .parents('div.tagget_wrapper');

      if (this.isToolbar) {
        var toolbar = 
          wrapper.prepend(('<div class="tagget_toolbar"></div>')).children('div.tagget_toolbar');

        // Encode
        toolbar.append(
          $('<p class="tagget_encode"></p>').append(
            $('<select></select>')
              .append('<option selected="selected" value="">Encode Selection</option>')
              .append('<option value="entity">&amp &lt; &gt; → &amp;amp; &amp;lt; &amp;gt;</option>')
              .append('<option value="raw">&amp;amp; &amp;lt; &amp;gt; → &amp &lt; &gt;</option>')
              .append('<option value="enc">encodeURI()</option>')
              .append('<option value="encc">encodeURIComponent()</option>')
              .append('<option value="dec">decodeURI()</option>')
              .append('<option value="decc">decodeURIComponent()</option>')
          )
        );

        // Repcalce
        toolbar.append(
          $('<p class="tagget_replace"></p>')
            .append('<input type="text" placeholder="Before" size="15" />')
            .append(' <img src="data:image/gif;base64,R0lGODlhDAAMALMLAFBQUHBwcH9/f9DQ0LCwsGBgYPDw8MDAwKCgoJCQkP///////wAAAAAAAAAAAAAAACH5BAEAAAsALAAAAAAMAAwAAAQwcMlJ6zoo2XmU0tuCeAI1HEQ2GEopHawnK4FExLNSSEmaICvdRuABbDrCTQKwC4UiADs=" alt="→" /> ')
            .append('<input type="text" placeholder="After" size="15" />')
            .append(' <input type="button" value="Replace All" />')
        );

        // File type
        toolbar.append(
          $('<p class="tagget_type"></p>').append(
            $('<select></select>')
              .append('<option selected="selected" value="html|css|js">HTML,CSS,JS</option>')
              .append('<option value="html|css">HTML,CSS</option>')
              .append('<option value="html">HTML</option>')
              .append('<option value="css">CSS</option>')
              .append('<option value="js">JS</option>')
              .append('<option value="css|js">CSS,JS</option>')
              .append('<option value="html|js">HTML,JS</option>')
          )
        );

        // intelligent
        // Suggestion by word already inputed
        toolbar.append(
          $('<p class="tagget_intelli"></p>')
            .append('<input type="checkbox" checked="checked" title="Suggest by inputed" id="tagget_check_intelli_' + i + '" /><label for="tagget_check_intelli_' + i + '" title="Suggest by inputed">intelli</label>')
        );

        // Status
        // display "line: , col:"
        wrapper.append(
          $('<p class="tagget_status"><span class="tagget_time"></span><span class="tagget_line"></span>&nbsp;</p>')
        );
      }
          
      this.relate(ta);
    },

    getToolbar: function(ta) {
      return $(ta).parents('.tagget_wrapper').children('.tagget_toolbar');  
    },

    // Set toolbar event
    relate: function(ta) {
    
      var toolbar = this.getToolbar(ta);
      
      // Encode
      toolbar.find('.tagget_encode select').change(function() {      
        switch (this.value) {        
          case 'entity':
            Cursor.encodeSelection(ta, Util.escapeHtml);
            break;        
          case 'raw':
            Cursor.encodeSelection(ta, Util.unescapeHtml);
            break;                
          case 'enc':
            Cursor.encodeSelection(ta, encodeURI);
            break;                
          case 'encc':
            Cursor.encodeSelection(ta, encodeURIComponent);
            break;                  
          case 'dec':
            Cursor.encodeSelection(ta, decodeURI);
            break;                          
          case 'decc':
            Cursor.encodeSelection(ta, decodeURIComponent);
            break;        
        }        
        this.value = '';      
      });
      
      // Replace
      var inputs = toolbar.find('.tagget_replace input');
      inputs.filter('[type=button]').click(function() {
        var val = ta.value;        
        var before = inputs.eq(0).val();
        var after = inputs.eq(1).val();
        var flag = 'g';
        // extract flag when input format as "/before/gim"
        if (before.match(/^\/.+\/([^\/]+)$/)) {
          flag = RegExp.$1;
          // remove flag, ^/ and invalid slash
          before = before.replace(/^\/|\/[^\/]+?$/g, '');
        }                
        if (before) {
          ta.value = val.replace(new RegExp(before, flag), after);
        }        
      });    
    },

    // Get id of textarea
    getId: function(ta) {
      return $(ta).attr('class').match(/tagget_([0-9]+)/)[1];
    },
    
    // Get display status of popup
    isPopup: function(ta) {
      var popup = this.getPopup(ta);
      return popup.css('display') != 'none';
    },

    // Show or hide popup
    setPopup: function(display) {
      var popup = this.getPopup(t);
      if (display) {
        popup.show();
      } else {
        popup.hide();
      }
    },
        
    checkType: function(ta, type) {
      var currentType = $(ta).parents('.tagget_wrapper')
        .find('.tagget_type select').val();
      return (new RegExp(currentType)).test(type);
    },
    
    checkIntelli: function(ta) {
      return $('#tagget_check_intelli_' + this.getId(ta)).prop('checked');
    },
    
    // Generate popup, dummy
    absolutes: function(ta) {
    
      var body = $(document.body);
      var id = this.getId(ta);
    
      var popup = $('<ul class="tagget_popup tagget_popup' + id + '"></ul>');
      body.append(popup);

      // Dummy for firefox using get cursor position
      if (window.getComputedStyle) {        
        var dummy = $('<pre class="tagget_dummy tagget_dummy' + id + '"></pre>');
        body.append(dummy);
      }
    },
    
    // Get dummy
    getDummy: function(ta) {
      var id = this.getId(ta);
      var dummy = $('.tagget_dummy' + id);
      return dummy;      
    },
    
    // Copy style of textarea to dummy
    adjust: function(ta) {
      var dummy = this.getDummy(ta);

      if (window.getComputedStyle) {        
        var org = getComputedStyle(ta,'');

        var props = [
          'width', 'height',
          'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 
          'border-left-style', 'border-right-style','border-top-style','border-bottom-style', 
          'border-left-width', 'border-right-width','border-top-width','border-bottom-width', 
          'font-family', 'font-size', 'line-height', 'letter-spacing', 'word-spacing'
        ];
      
        for(var i = 0; i < props.length; i++){        
          var capitalized = props[i].replace(/-(.)/g, function(m, m1){
            return m1.toUpperCase();
          });          
          dummy.css(capitalized, org.getPropertyValue(props[i]));
        }

        var offset = Util.getOffset(ta);

        dummy.css({
          left: offset.left,
          top: offset.top
        });
          
        var $ta = $(ta);
        dummy.width($ta.width())
          .height($ta.height())
        .scrollLeft($ta.scrollLeft())
          .scrollTop($ta.scrollTop());
      }
    },
    
    // Show suggestion
    // TODO: Limit num
    //   or Set height and scroll
    showPopup: function(ta) {
  
      var popup = this.getPopup(ta);
      var suggests = Suggester.get(ta, Cursor.getText(ta)[0]);
      
      if (suggests) {
      
        // Renenerate when suggests is change
        if (popup.text() != suggests.view.join('')) {
      
          popup.html('');
      
          for(var i = 0; i < suggests.view.length; i++) {
            var li = $('<li></li>').attr('title', suggests.insert[i])
              .append('<a href="#"></a>').text(suggests.view[i])
              .hover(function() {
                popup.children('li').removeClass('tagget_current');
                $(this).addClass('tagget_current');
              })
              .click(function() {
                Cursor.insert(ta, Util.unescapeHtml(popup.children('li.tagget_current').attr('title')));
                popup.hide();
              });
            if (i == 0) {
              li.addClass('tagget_current');
            }
            popup.append(li);
          }  

        // Update attribute(inputted) when suggests is not change
        } else {
          popup.children('li').each(function(i) {
            $(this).attr('title', suggests.insert[i]);
          });      
        }
        
        var pos = Cursor.getPos(ta);
        
        popup.css({
          left: pos.x,
          top: pos.y
        });

        popup.show();
        
      } else {      
        popup.hide();        
      }  
    },
    
    getPopup: function(ta) {
      var id = this.getId(ta);
      var popup = $('.tagget_popup' + id);
      return popup;
    },
    
    
    // Choice suggestion
    choice: function(ta, dir /* direction cof cursor inputted */) {

      var popup = this.getPopup(ta);
      var lis = popup.children('li');
    
      if(dir == 1) {
        for(var i = 0; i < lis.length; i++) {
          var li = lis.eq(i);
          if(li.hasClass('tagget_current')) {
            li.removeClass('tagget_current');
            i = (i == 0) ? lis.length - 1 : i - 1;
            lis.eq(i).addClass('tagget_current');
            break;
          }        
        }
      } else {        
        for(var i = 0; i < lis.length; i++) {
          var li = lis.eq(i);          
          if(li.hasClass('tagget_current')) {
            li.removeClass('tagget_current');
            i = (i == lis.length - 1 ) ? 0 : i + 1;
            lis.eq(i).addClass('tagget_current');
            break;
          }        
        }            
      }
    },
    
    // Get current suggestion
    current: function(ta) {    
      var popup = this.getPopup(ta);
      return popup.children('li.tagget_current').attr('title');
    },
    
    // Get status bar
    getStatus: function(ta) {
      return $(ta).parents('.tagget_wrapper').find('.tagget_status');
    },
    
    setLine: function(ta) {
    
      var status = this.getStatus(ta);
      
      // All strings before cursor(all line)
      var s = Cursor.getText(ta, /^[\s\S]*$/)[0] || '';
      
      // All strings before cursor(current line)
      var thisLine = Cursor.getText(ta, /.*$/)[0];
      
      var lineNum = (s.match(/\n/g) || []).length + 1;
      var cols = thisLine.length;

      status.children('.tagget_line').html('line: ' + lineNum + ' col: ' + cols);
    
    }
    
  
  };

  /**
   * Manage text of textarea
   */
  Cursor = {

    // Get current text before/after of cursor
    getText: function(ta, r, after) {

      // target of auto complete
      // starts with '<' or alphabet
      if (!r) {
        r = /[^<>\s　'"#\.=;]+?$|<[^<>\s　'"#\.=;]*?$/;
      }
      
      var start, end;

      // IE
      if (document.selection && !window.opera) {

//        t.focus(); // unnecessary?

        // Get range of selection
        var range = document.selection.createRange();

        // Clone range of selection
        var clone = range.duplicate();

        // Set selecton of clone's range to all of textarea
        // [clone start] text1 [range start] text2 [range end] text3 [clone end]
        clone.moveToElementText(ta);

        // Set end of clone's selection to end of original range
        // [clone start] text1 [range start] text2 [range/clone end] text3
        clone.setEndPoint('EndToEnd', range);

        // calc start/end position of selection
        // [clone start] text1 [range start] text2 [range/clone end] text3
        // --------------------------------------------------------- clone.text.length == end
        // --------------------------------------------------------| range.text.length
        // --------------------| clone.text.length - range.text.length = start
        start = clone.text.length - range.text.length;
        end = clone.text.length;
      }

      // Firefox
        else if ('selectionStart' in ta) {
          start = ta.selectionStart;
          end = ta.selectionEnd;
        }

      var text;
      
      if (!after) {
        text = ta.value.slice(0, start).match(r);
      } else {
        text = ta.value.slice(end).match(r);
      }
      
      return text || [];
    },

    // Get cursor position
    getPos: function(ta) {

      var x, y;

      // IE
      if (document.selection && !window.opera) {
      
        var range = document.selection.createRange();
        x = range.offsetLeft + 
          (document.body.scrollLeft || document.documentElement.scrollLeft) - 
            document.documentElement.clientLeft;
        y = range.offsetTop + 
          (document.body.scrollTop || document.documentElement.scrollTop) - 
            document.documentElement.clientTop;
      
      // Firefox
      } else if (window.getComputedStyle) {

        var id = Wrapper.getId(ta);
        var dummy = $('.tagget_dummy' + id);

        var span = dummy.children('span');
        
        if(!span.is('span')) {
          span = $('<span></span>');
          span.html('|');
        }
    
        dummy.html('');
        dummy.text(ta.value.slice(0, ta.selectionEnd));
        dummy.append(span);

        var offset = Util.getOffset(span.get(0));

        x = offset.left - ta.scrollLeft;
        y = offset.top - ta.scrollTop;
      }

      return {
        x: x,
        y: y
      };
    },
    
    // Insert string to current cursor
    insert: function(ta, str) {

      // Get pos of "#{c}" and remove
      var cursor = str.indexOf('#{c}');
      str = str.replace('#{c}', '');

      // If not focus
      //   insert to body(IE)
      //   not return focus in textrea after insert by button(Firefox)
      ta.focus(); 

      // IE
      if (document.selection && !window.opera) {
        
        // Get selection
        var range = document.selection.createRange();

        // replace select text by str (insert in current cursor)
        range.text = str;

        // Return to cursor pos from end of range
        // (unnecessary if "#{c}" not exisits )
        var back = str.length - (cursor != -1 ? cursor : str.length);
        range.move('character', -back);

        // Update select
        range.select();
      // Firefox
      } else if ('selectionStart' in ta) { 

        // save scroll top
        var top = ta.scrollTop;

        var start = ta.selectionStart;
        var end = ta.selectionEnd;

        // insert str between start and end(pos of current cursor)
        ta.value = ta.value.slice(0, start) + str + ta.value.slice(end);

        // Set cursor pos to after insertion
        var index = start + (cursor != -1 ? cursor : str.length);
        ta.setSelectionRange(index, index);

        // Scroll bottom if many line break
        // TODO: 
        if (/\n/g.test(str) && str.match(/\n/g).length > 2) {
          top += parseInt(getComputedStyle(ta, '').getPropertyValue('font-size'), 10) + 3;
        }
        
        // restore scroll top
        ta.scrollTop = top;
      }
      return this;      
    },
  
    // encode selection with func
    encodeSelection: function(ta, func) {
    
      ta.focus(); 

      // IE
      if (document.selection && !window.opera) {
      
        var range = document.selection.createRange();
        range.text = func(range.text);
        range.select();
        
      // Firefox
      } else if ('selectionStart' in ta) { 

        var top = ta.scrollTop;

        var start = ta.selectionStart;
        var end = ta.selectionEnd;

        var before = ta.value.slice(start, end);
        var after = func(before);        

        ta.value = ta.value.slice(0, start) + after + ta.value.slice(end);

        ta.setSelectionRange(start, start + after.length);

        ta.scrollTop = top;
      }
    },
    
    // Complete close tag
    // カーソル位置より前にある開始タグをさかのぼって見ていく
    // 閉じタグが何もなければ直近のタグを閉じる
    // 閉じタグとマッチしないタグがあれば閉じる
    // カーソル後に閉じタグがあるとかは無視
    // 整形式じゃないのも無視
     closeTag: function(ta) {

      // カーソルより前の開始タグ一覧
      // <! <? </ 空要素/>は除く
      // TODO:できれば一文でやりたい
      var sTags = Cursor.getText(ta, /^[\s\S]*$/)[0]
        .replace(/<[!\?\/][\s\S]*?>/g, '')  // <!?/を除去
        .replace(/<[^>]*?\/>/g, '')    // 空要素/>を除去
        .match(/<[^>]+?>/g);        // タグ抽出
      var eTags = Cursor.getText(ta, /<\/[^?]+?>/g);
      
      if (sTags) { 
        var i = sTags.length - 1;
          
        for (; i >= 0 && eTags.length > 0; i--) {
        
            // <までとタグ名以降を除去
            // >と\s始まり（属性と閉じ括弧）を除去
            // TODO:もうちょっと改善すれば改行された要素にも対応できる？
            var sTag = sTags[i].replace(/^.*<|[\s>].*/g, '');

            var j = 0;
            for (; j < eTags.length; j++) {
              var eTag = eTags[j].replace(/^.*<\/|[\s>].*/g, '');

              // マッチしたらその閉じタグを配列から消して除外
              if (sTag == eTag) {
                break;
              }
            }
            if (j < eTags.length) {
              eTags.splice(j, 1);                
            // マッチしなかったらその開始タグを閉じる
            } else {
              break;
            }
        }
        // 現在の開始タグを閉じる
        // 全てマッチしたら何もしない
        if (i >= 0) {
          Cursor.insert(ta, '</' + sTags[i].replace(/^.*<|[\s>].*/g, '') + '>');
        }
      }
    }  
  };


  // function doesn't depend context
  Util = {
  
    // escape &, <, >[, "]
    escapeHtml: function(s, quot) {
      s = s.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');      
      return !quot ? s : s.replace(/"/g, '&quot;');
    },
    
    // unescape &amp;, &lt;, &gt;[, &quot;]
    unescapeHtml:function(s, quot) {            
      s = s.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');      
      return !quot ? s : s.replace(/&quot;/g, '"');
    },

    // simple getting of offset(xy of element)
    getOffset: function(elm) {

      var left, top;

      // IE and some modern browser
      if (elm.getBoundingClientRect) {
        var rect = elm.getBoundingClientRect();
        left = Math.round(scrollX + rect.left);
        top = Math.round(scrollY + rect.top);        
      // legacy browser
      } else {
        left = elm.offsetLeft;
        top  = elm.offsetTop;
        var offsetParent = elm.offsetParent;        
        while (offsetParent) {
          left += offsetParent.offsetLeft;
          top  += offsetParent.offsetTop;             
          offsetParent = offsetParent.offsetParent;
        }       
      }
      return {
        left: left,
        top: top
      };      
    }, 
    
    fillZero: function(s) {
        return ('0' + s).slice(-2); 
    }, 
    
    now: function() {    
        var date = new Date();
        var y = date.getFullYear();
        var m = this.fillZero(date.getMonth() + 1);
        var d = this.fillZero(date.getDate());
        var h = this.fillZero(date.getHours());
        var min = this.fillZero(date.getMinutes());
        var sec = this.fillZero(date.getSeconds());
        return y + '/' + m + '/' + d + '/' + ' ' + h + ':' + min + ':' + sec;
    }    
  };

  // function setting event of textarea
  Event = {
  
    // keyup(less-frequently occurring)
    //   show suggesion
    keyup: function(e) {
      var ta = this;
      // show when !arrow key, !enter
      if(!(37 <= e.which && e.which <= 40) && !(e.which == 13)) {
        Wrapper.showPopup(ta);        
      // hide when left/right key
      } else if(e.which == 37 || e.which == 39) {
        Wrapper.getPopup(ta).hide();
      }
      Wrapper.setLine(ta);
    }, 
    
    // keydown
    //   handling inputed string
    //   and doesn't work keyup/press
    keydown: function(e) {
    
      var ta = this;
    
      // Cancel tab
      // doesn't work keyup/down
      if (e.which == 9) {
        Cursor.insert(ta, TAB);
        return false;
      }

      // insert \n or <br /> when input Shift+Enter
      if (e.shiftKey && e.which == 13) {
        var n = '\n'; // plain text
        if (Wrapper.checkType(ta, 'html')) {
          n = '<br />\n'; // html
        }
        Cursor.insert(ta, n);        
        // End complete
        return false;
      }

      // collect close tag when input Ctrl+Enter
      if (e.metaKey && e.which == 13) {
        if (Wrapper.checkType(ta, 'html')) {
          Cursor.closeTag(ta);
          return false;
        }      
      }

      // Choice by arrow key
      // keyup can't continue to press
      // doesn't work keypress
      if (Wrapper.isPopup(ta)) {
        switch (e.which) {        
          // right
//          case 37:
          // up
          case 38:
            Wrapper.choice(ta, 1);
            return false;

          // left
//          case 39:
          // down
          case 40:
            Wrapper.choice(ta, -1);
            return false;

          // Enter(insert suggestion)
          case 13:
            Cursor.insert(ta, Util.unescapeHtml(Wrapper.current(ta)));
            Wrapper.getPopup(ta).hide();
            return false;
        }
      } else {    
        // fix indent when enter  
        if (e.which == 13) {
          var indent = Cursor.getText(ta, /^[\t ]*/mg);
          Cursor.insert(ta, '\n' + (indent ? indent[indent.length - 1] : ''));
/* unnecessary?
          var $ta = $(ta);
          if (window.getComputedStyle) {
            $ta.scrollTop($ta.scrollTop() + parseInt(getComputedStyle(ta, '').getPropertyValue('font-size'), 10) + 3);
          }          
*/          
          return false;
        }            
      }
    }  
  };

  // Init tagget
  var init = function(ta, i) {
  
    // set uniq id
    while ($('textarea').is('.tagget_' + i)) {
      i = '0' + i;
    }
    $(ta).addClass('tagget_' + i);

    Wrapper.wrap(ta, i);
    Wrapper.absolutes(ta);

    // Set event

    $(ta).keyup(Event.keyup)
    .keydown(Event.keydown)
    .click(Event.keyup); // For hide when click textarea

    Wrapper.setLine(ta);
  }; // init
  

  // Add jQuery plugin
  // for call by $('textarea.tagget').tagget()
  $.fn.tagget = function() {

    // this is $('textarea.tagget')
    this.each(function(i) {
        // init textarea
        init(this, i);
    });

    // set window event
    
    var self = this;    
    // adjust dummy when resize
    $(window).resize(function() {
      self.each(function() {
        Wrapper.adjust(this);
      });
    }).resize();
          
    // This is jQuery!!
    return this;
    
  }; // $.fn.tagget

})(jQuery);
