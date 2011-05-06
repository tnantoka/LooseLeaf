(function($) {

    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */

	/**
	 *
	 * 入力補完候補を保持、取得するオブジェクト
	 *
	 */
	var Suggester = {
	
		keywords: {	
		
			html: (function() {

				// <head>内の要素		
				var header = [
					'<?xml version="1.0" encoding="#{c}"?>\n', 
					'<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n',
					'<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n',
					'<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">\n',
					'<!DOCTYPE html>', 
					'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ja" lang="ja">\n',
					'<link rel="stylesheet" type="text/css" href="#{c}" />\n',
					'<script type="text/javascript" src="#{c}"></script>\n',
					'<script type="text/javascript">\n#{c}\n</script>\n',
					'<style type="text/css">\n#{c}\n</style>\n',

					'<meta http-equiv="Content-Type" content="text/html; charset=#{c}" />\n',
					'<meta http-equiv="Content-Style-Type" content="text/css" />\n',
					'<meta http-equiv="Content-Script-Type" content="text/javascript" />\n',
					'<meta name="ROBOTS" content="#{c}" />\n',
					'<meta name="description" content="#{c}" />\n',
					'<meta name="keywords" content="#{c}" />\n',

					'<head>#{c}</head>\n',
					'<title>#{c}</title>\n',
					'<body>#{c}</body>\n',

					'<link rel="alternate" type="application/atom+xml" title="#{c}" href="" />\n',
					'<link rel="alternate" type="application/rss+xml" title="#{c}" href="" />\n',
					'<link rel="EditURI" type="application/rsd+xml" title="#{c}" href="" />\n'
				];

				// <body>内の要素		
				var body = [
					'<a>#{c}</a>',
					'<address>#{c}</address>',
					'<![CDATA[ #{c} ]]>', 
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

					'<!--',
					'-->',
					'<!-- #{c} -->'
				];

				// 属性		
				var attributes = [
					'href="#{c}"',
					'src="#{c}"',
					'cols="#{c}"',
					'rows="#{c}"',
					'id="#{c}"',
					'class="#{c}"',
					'style="#{c}"',

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

					'xml:lang="#{c}"',
					'lang="#{c}',
					'xmlns="#{c}"'
				];
				
				// 属性値	
				var values = [
					'UTF-8',
					'EUC-JP',
					'Shift-JIS',
					'text',
					'button',
					'submit',
					'reset',
					'ja',
					'http://www.w3.org/1999/xhtml'
				];

				return header.concat(body, attributes, values);

			})(),
			
			js: (function() {
			
				var objs = [
					'function() { #{c} }',
					'if (#{c}) { }'
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
		 * キーワードを追加
		 * keywordsと同じ形式で渡す。
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
		 * 補完候補を取得
		 */
		get: function(t, s) {
		
			if (!t || !s || !t.value) {
				return false;
			}
			
			var matches = {
				view: [],
				insert: []
			};
		
			var words = [];

			// 入力内容で補完
			if (Wrapper.checkIntelli(t)) {

				// 変数名とかを抽出
				// 記号じゃない連続文字列
				var a = t.value.match(/[^<>\s　'"#\=:;{}\(\)!?,*]{2,}/g) || [];

				// 重複削除
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
				if (Wrapper.checkType(t, key)) {
					words = words.concat(this.keywords[key]);
				}
			}

			for(var i = 0; i < words.length; i++) {
			
				if (words[i] != s && words[i].indexOf(s) == 0) {
					matches.view.push(words[i].replace(/#\{c\}/g, ''));
					// 既に入力されている部分を除いて挿入
					matches.insert.push(words[i].slice(s.length));
				}
			}
				
			return (matches.view.length != 0) ? matches : false;
		
		}
	
	};

    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */
	/**
	 * taggetに必要なHTMLを生成・操作する
	 */
	Wrapper = {
	
		// ツールバーを表示するか
		isToolbar: true,
	
		// wrap処理
		// textarea周囲にHTMLを追加する
		wrap: function(t) {
		
			if ($(t).parents().is('.tagget_wrapper')) {
				this.relate(t);
				return true;
			}
			
			// 全体の枠を作ってその参照を取得
			// wrapの戻り値はwrapされた要素なので、parentsでwrapした要素を取得
			var wrapper = $(t).wrap('<div class="tagget_wrapper"><p class="tagget_main"></p></div>')
				.parents('div.tagget_wrapper');

			// 必要に応じてツールバーを追加
			if (this.isToolbar) {
				var toolbar = 
					wrapper.prepend(('<div class="tagget_toolbar"></div>')).children('div.tagget_toolbar');

				// 選択範囲変換
				toolbar.append(
					$('<p class="tagget_encode"></p>').append(
						$('<select title="選択範囲を変換"></select>')
							.append('<option selected="selected" value="">Encode Selection</option>')
							.append('<option value="entity">&amp &lt; &gt; → &amp;amp; &amp;lt; &amp;gt;</option>')
							.append('<option value="raw">&amp;amp; &amp;lt; &amp;gt; → &amp &lt; &gt;</option>')
							.append('<option value="enc">encodeURI()</option>')
							.append('<option value="encc">encodeURIComponent()</option>')
							.append('<option value="dec">decodeURI()</option>')
							.append('<option value="decc">decodeURIComponent()</option>')
					)
				);

				// 置換
				toolbar.append(
					$('<p class="tagget_replace"></p>')
						.append('<input type="text" value="Before" title="置換前" />')
						.append('<img src="tagget/img/v_arrow010102.gif" />')
						.append('<input type="text" value="After" title="置換後" />')
						.append('<input type="button" value="Replace All" title="全て置換" />')
				);

				// ファイルタイプ
				toolbar.append(
					$('<p class="tagget_type"></p>').append(
						$('<select title="選択範囲を変換"></select>')
							.append('<option selected="selected" value="html|css|js">HTML,CSS,JS</option>')
							.append('<option value="html|css">HTML,CSS</option>')
							.append('<option value="html">HTML</option>')
							.append('<option value="css">CSS</option>')
							.append('<option value="js">JS</option>')
							.append('<option value="css|js">CSS,JS</option>')
							.append('<option value="html|js">HTML,JS</option>')
					)
				);

				// Cookie
				toolbar.append(
					$('<p class="tagget_cookie"></p>')
						.append('<input type="checkbox" checked="checked" title="Cookieに下書きを保存" id="tagget_check_cookie" /><label for="tagget_check_cookie" title="Cookieに下書きを保存">Cookie</label>')
				);

				// intelligent
				// 入力内容を使用した補完
				toolbar.append(
					$('<p class="tagget_intelli"></p>')
						.append('<input type="checkbox" checked="checked" title="入力内容から補完" id="tagget_check_intelli" /><label for="tagget_check_intelli" title="入力内容から補完">intelligent</label>')
				);

				// Status
				// Draft Saved At 1:17とか表示
				// 行、列を表示（line: , col:）
				wrapper.append(
					$('<p class="tagget_status"><span class="tagget_time"></span><span class="tagget_line"></span>&nbsp;</p>')
				);

				// jQuery UI CSS Frameworkのclass名を設定	
				toolbar.addClass('ui-helper-clearfix');
				wrapper.addClass('ui-widget-header ui-corner-all')
					.children('div, p').addClass('ui-widget-header');

			}
		
			this.relate(t);
		
		},

		getToolbar: function(t) {
		
			return $(t).parents('.tagget_wrapper').children('.tagget_toolbar');
		
		},

		// wrap要素にeventを設定する。
		// 既にHTMLがあった場合は、こちらだけを行う。
		relate: function(t) {
		
			var toolbar = this.getToolbar(t);
			
			// 選択範囲変換
			// onchangeイベント設定
			toolbar.find('.tagget_encode select').change(function() {
			
				switch (this.value) {
				
					case 'entity':
						Cursor.encodeSelection(t, Util.escapeHtml);
						break;
				
					case 'raw':
						Cursor.encodeSelection(t, Util.unescapeHtml);
						break;				
				
					case 'enc':
						Cursor.encodeSelection(t, encodeURI);
						break;				
				
					case 'encc':
						Cursor.encodeSelection(t, encodeURIComponent);
						break;	
									
					case 'dec':
						Cursor.encodeSelection(t, decodeURI);
						break;				
									
					case 'decc':
						Cursor.encodeSelection(t, decodeURIComponent);
						break;				
				}
				
				this.value = '';
			
			});
			
			
			// 置換ボタンクリックで置換
			// 正規表現使用可
			var inputs = toolbar.find('.tagget_replace input');
			inputs.filter('[type=button]').click(function() {

				var val = t.value;
				
				var before = inputs.eq(0).val();
				var after = inputs.eq(1).val();
				// フラグはデフォルトでg(Replace All)
				var flag = 'g';

				// TODO: 一応動くけどもっとみやすいコードに

				// /before/gim形式で入力されたらフラグを抽出
				// それ以外は全体を正規表現として扱う
				if (before.match(/^\/.+\/([^\/]+)$/)) {
					
					// フラグ上書き
					flag = RegExp.$1;
					// 行頭の/、/以降の文字（フラグ、スラッシュ連続など形式外の入力）を除去
					before = before.replace(/^\/|\/[^\/]+?$/g, '');
				}
								
				if (before) {
					t.value = val.replace(new RegExp(before, flag), after);
				}
				
			});	

		
		},

		// textareaからID取得
		getId: function(t) {
			return $(t).attr('class').match(/tagget_([0-9]+)/)[1];
		},
		
		// Popup表示状態
		isPopup: function(t) {
			var popup = this.getPopup(t);
			return popup.css('display') != 'none';
		},

		// Popup表示設定
		setPopup: function(display) {
			var popup = this.getPopup(t);
			if (display) {
				popup.show();
			} else {
				popup.hide();
			}
		},
				
		checkType: function(t, type) {
			var currentType = $(t).parents('.tagget_wrapper')
				.find('.tagget_type select').val();
			return (new RegExp(currentType)).test(type);
		},

		
		checkCookie: function(t) {
			var cookie = $(t).parents('.tagget_wrapper')
				.find('.tagget_cookie input').attr('checked');
			return cookie;
		},

		// 入力データを利用した補完を行うか
		checkIntelli: function(t) {
			var intelli = $(t).parents('.tagget_wrapper')
				.find('.tagget_intelli input').attr('checked');
			return intelli;
		},
		
		// Popup,Dummyを生成
		absolutes: function(t) {
		
			var body = $(document.body);
			var id = this.getId(t);
		
			// suggestion用の要素作成
			var popup = $('<ul class="tagget_popup tagget_popup' + id + '"></ul>');
			body.append(popup);

			// Firefox用dummy生成
			// カーソル座標取得に使用
			if (window.getComputedStyle) {
				
				var dummy = $('<pre class="tagget_dummy tagget_dummy' + id + '"></pre>');
				body.append(dummy);

			}

		},
		
		// Dummyを取得
		getDummy: function(t) {

			var id = this.getId(t);
			var dummy = $('.tagget_dummy' + id);
			return dummy;
			
		},
		
		// textareaのstyleをdummyにコピー
		adjust: function(t) {

			var dummy = this.getDummy(t);

			if (window.getComputedStyle) {
				
				var org = getComputedStyle(t,'');

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

				var offset = Util.getOffset(t);

			    dummy.css({
			    	left: offset.left,
			    	top: offset.top
			    });
			    
			    var $t = $(t);
			    dummy.width($t.width())
			    	.height($t.height())
					.scrollLeft($t.scrollLeft())
			    	.scrollTop($t.scrollTop());

			}
		},
		
		// suggestionを表示
		// TODO: 候補数制限 or 高さ設定してスクロール
		showPopup: function(t) {
	
			var popup = this.getPopup(t);
			var suggests = Suggester.get(t, Cursor.getText(t)[0]);
			
			if (suggests) {
			
				// 変化があった場合のみ再構成
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
								Cursor.insert(t, Util.unescapeHtml(popup.children('li.tagget_current').attr('title')));
								popup.hide();
							});
						if (i == 0) {
							li.addClass('tagget_current');
						}
						popup.append(li);
					}	

				// 変化がなければ属性のみ変更
				// TODO:入力分の削除をincertに現在の文字渡してやるようにした方がよさそう。
				} else {

					popup.children('li').each(function(i) {
						$(this).attr('title', suggests.insert[i]);
					});			
				}
				
				var pos = Cursor.getPos(t);
				
				popup.css({
					left: pos.x,
					top: pos.y
				});

				popup.show();
				
			} else {
			
				popup.hide();
				
			}	
		},
		
		// popupを取得
		getPopup: function(t) {
			var id = this.getId(t);
			var popup = $('.tagget_popup' + id);
			return popup;
		},
		
		
		// suggest選択
		// TODO:もっとちゃんと書く
		choice: function(t, d) {

			var popup = this.getPopup(t);
			var lis = popup.children('li');
		
			if(d == 1) {
				
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
		
		// 選択中のsuggestionを取得
		current: function(t) {
		
			var popup = this.getPopup(t);
			return popup.children('li.tagget_current').attr('title');
		},
		
		getStatus: function(t) {
			return $(t).parents('.tagget_wrapper').find('.tagget_status');
		},
		
		setLine: function(t) {
		
			var status = this.getStatus(t);
			
			//カーソル前の全文字列
			var s = Cursor.getText(t, /^[\s\S]*$/)[0] || '';
			
			//現在の行の行頭までの文字列
			//.は改行にはマッチしないので楽
			var thisLine = Cursor.getText(t, /.*$/)[0];
			
			var lineNum = (s.match(/\n/g) || []).length + 1;
			var cols = thisLine.length;

			status.children('.tagget_line').html('line: ' + lineNum + ' col: ' + cols);
		
		}
		
	
	};

    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */
	/**
	 * textarea内のテキストを操作
	 */
	Cursor = {

		// カーソル位置の文字を取得
		getText: function(t, r, after) {

//			if (!r) r = /[^<>\s　'"#\.=;]+?$|<[^<>\n=]*?$/;
			if (!r) {
				// 補完対象
				// 変な記号で始まらない文字列
				// <で始まる文字列（タグ）
				r = /[^<>\s　'"#\.=;]+?$|<[^<>\s　'"#\.=;]*?$/;
			}
			
			var start, end;

			// IE
			if (document.selection && !window.opera) {

//				t.focus(); // focusなしでもいける

				// 選択範囲を取得
				var range = document.selection.createRange();

				// 選択範囲の複製を作成
				var clone = range.duplicate();

				// textarea内のテキスト全体を選択
				// [clone start] text1 [range start] text2 [range end] text3 [clone end]
				clone.moveToElementText(t);

				// cloneの選択範囲終点を、rangeの終点にあわせる
				// [clone start] text1 [range start] text2 [range/clone end] text3
				clone.setEndPoint('EndToEnd', range);

				// 選択範囲始点を求める
				// [clone start] text1 [range start] text2 [range/clone end] text3
				// --------------------------------------------------------- clone.text.length == end
				//                     ------------------------------------- range.text.length
				// -------------------- clone.text.length - range.text.length = start
				start = clone.text.length - range.text.length;
				end = clone.text.length;

			}

			// Firefox
		    else if ('selectionStart' in t) {

		        start = t.selectionStart;
		        end = t.selectionEnd;

		    }

			var text;
			
			if (!after) {
				text = t.value.slice(0, start).match(r);
			} else {
				text = t.value.slice(end).match(r);
			}
			
			return text || [];
			
		},

		// カーソルの座標を取得
		getPos: function(t) {

			var x, y;

			if (document.selection && !window.opera) {
			
				var range = document.selection.createRange();
				x = range.offsetLeft + 
					(document.body.scrollLeft || document.documentElement.scrollLeft) - 
						document.documentElement.clientLeft;
				y = range.offsetTop + 
					(document.body.scrollTop || document.documentElement.scrollTop) - 
						document.documentElement.clientTop;
			
			} else if (window.getComputedStyle) {

				var id = Wrapper.getId(t);
				var dummy = $('.tagget_dummy' + id);

				var span = dummy.children('span');
				
				if(!span.is('span')) {
					span = $('<span></span>');
					span.html('|');
				}
		
				dummy.html('');
				dummy.text(t.value.slice(0, t.selectionEnd));
				dummy.append(span);

				var offset = Util.getOffset(span.get(0));

				x = offset.left - t.scrollLeft;
				y = offset.top - t.scrollTop;
		    }

			return {
				x: x,
				y: y
			};
		},
		
		// textareaのカーソル位置に文字列挿入
		insert: function(t, s) {

			// カーソル移動位置（#{c}）を取得後、削除
			var cursor = s.indexOf('#{c}');
			s = s.replace('#{c}', '');

			// focusしないとIEでbodyに挿入されたりする
			// Firefoxでもボタンで挿入後にfocusが戻らない
			t.focus(); 

			// for IE
			if (document.selection && !window.opera) {
				
				// 選択範囲を取得
				var range = document.selection.createRange();

				// 選択中のテキスト引数sで置き換え（現在のカーソル位置にsを挿入）
				range.text = s;

				// カーソルがrange.textの最後になるので戻す
				// #{c}指定がなければ最後のまま
				var back = s.length - (cursor != -1 ? cursor : s.length);
				range.move('character', -back);

				// 現在のカーソル位置を反映する（これやらないと水の泡）
				range.select();
			}

			// Firefox
			// inかundefinedあたりで判定しないとselectionStartが0の時ミスる
		    else if ('selectionStart' in t) { 

				// スクロールバーの位置を保存
				var top = t.scrollTop;

				// 選択範囲の開始・終了位置を取得
		        var start = t.selectionStart;
		        var end = t.selectionEnd;

				// 開始位置と終了位置の間（現在のカーソル位置）にsを挿入
		        t.value = t.value.slice(0, start) + s + t.value.slice(end);

				// カーソル移動位置に移動させる
				var index = start + (cursor != -1 ? cursor : s.length);
		        t.setSelectionRange(index, index);

				// 改行がたくさんある場合スクロールバーを下にずらす
				if (/\n/g.test(s) && s.match(/\n/g).length > 2) {
					top += parseInt(getComputedStyle(t, '').getPropertyValue('font-size'), 10) + 3;
				}
				
				// スクロールバーを戻す
			    t.scrollTop = top;
		    }

			return this;
			
		},
	
		/**
		 * 渡された関数で選択範囲を変換
		 */
		// TODO:変換後も選択した状態に
		encodeSelection: function(t, func) {
		
			t.focus(); 

			// IE
			if (document.selection && !window.opera) {
			
				var range = document.selection.createRange();
				range.text = func(range.text);
				range.select();
				
			} else if ('selectionStart' in t) { 

				var top = t.scrollTop;

		        var start = t.selectionStart;
		        var end = t.selectionEnd;

				var before = t.value.slice(start, end);
				var after = func(before);
				

				t.value = t.value.slice(0, start) + 
					after + t.value.slice(end);

		        t.setSelectionRange(end, end);

			    t.scrollTop = top;
		    }
		    
		},
		
		/**
		 * 閉じタグ補完
		 */
		// カーソル位置より前にある開始タグをさかのぼって見ていく
		// 閉じタグが何もなければ直近のタグを閉じる
		// 閉じタグとマッチしないタグがあれば閉じる
		// カーソル後に閉じタグがあるとかは無視
		// 整形式じゃないのも無視
		 closeTag: function(t) {

				// カーソルより前の開始タグ一覧
				// <! <? </ 空要素/>は除く
				// TODO:できれば一文でやりたい
				var sTags = Cursor.getText(t, /^[\s\S]*$/)[0]
					.replace(/<[!\?\/][\s\S]*?>/g, '')	// <!?/を除去
					.replace(/<[^>]*?\/>/g, '')		// 空要素/>を除去
					.match(/<[^>]+?>/g);				// タグ抽出
				var eTags = Cursor.getText(t, /<\/[^?]+?>/g);
				
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
						Cursor.insert(t, '</' + sTags[i].replace(/^.*<|[\s>].*/g, '') + '>');
					}

				}

		}
	
	};


    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */
	/*
	 * contextに依存しない関数群
	 */
	Util = {
	
		// &, <, >[, "]を変換
		escapeHtml: function(s, quot) {
			s = s.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
			
			return !quot ? s : s.replace(/"/g, '&quot;');
		},
		
		// &amp;, &lt;, &gt;[, &quot;]を戻す
		unescapeHtml:function(s, quot) {
						
			s = s.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>');
			
			return !quot ? s : s.replace(/&quot;/g, '"');
		},

		// offset(要素の実xy座標)を簡易算出
		getOffset: function(elm) {

			var left, top;

			if (elm.getBoundingClientRect) {

				var rect = elm.getBoundingClientRect();
				left = Math.round(scrollX + rect.left);
				top = Math.round(scrollY + rect.top);
				
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

    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */
	/**
	 * Cookieに下書き保存
	 */
	var Cookie = {
	
		load: function(key) {
		
			var cookie = $.cookie(key);
			if (cookie) {
				return cookie;
			}
		
		},
		
		zip: function(s) {

	    	var data = utf16to8(s);
	    	data = zip_deflate(data);
	     	data = base64encode(data);
			return data;
		
		},

		unzip: function(s) {

		    var data = base64decode(s);
		    data = zip_inflate(data);
		    data = utf8to16(data);
			return data;
		
		},
		
		save: function(key, val) {

			var size = val.length;
		
			if(size <= 4000) {
				$.cookie(key, val, { 'expires': 1 });
			}
		
		}
	
	
	};

    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */
	/**
	 * textareaのEventに設定する関数群
	 */
	Event = {
	
		// keyupは発生タイミングが一番少ない
		// 候補表示に使用
		keyup: function(e) {
		
			var t = this;
		
			// 十字キー、Enterの時は補完を表示しない
			if(!(37 <= e.which && e.which <= 40) && !(e.which == 13)) {
				Wrapper.showPopup(t);
				
			} 
			// 左右キーで補完を非表示化
			else if(e.which == 37 || e.which == 39) {
				Wrapper.getPopup(t).hide();
			}
			
			Wrapper.setLine(t);
		}, 
		
		// 入力内容に応じた処理はdownで
		// press,upだとおかしくなるものもこっちで
		keydown: function(e) {
		
			var t = this;
		
			// タブキャンセル
			// keydown以外だとうまくいかない
			if (e.which == 9) {
				Cursor.insert(t, '\t');
				return false;
			}

			// Shift+Enterで改行 or <br />入力
			if (e.shiftKey && e.which == 13) {

				var n = '\n';
				if (Wrapper.checkType(t, 'html')) {
					n = '<br />';
				}
				Cursor.insert(t, n);
				
				// 補完処理終了。
				// 以下同様で後続処理は行わない
				return false;
			}

			// Ctrl+Enterで閉じタグ補完
			if (e.metaKey && e.which == 13) {

				if (Wrapper.checkType(t, 'html')) {

					Cursor.closeTag(t);
					return false;

				}
			
			}

			// 十字キーで候補選択
			// upだとおしっぱにできない、pressだとおかしくなる
			if (Wrapper.isPopup(t)) {


				switch (e.which) {
				
					// right
//					case 37:

					// up
					case 38:

						Wrapper.choice(t, 1);
						return false;

					// left
//					case 39:

					// down
					case 40:

						Wrapper.choice(t, -1);
						return false;

					// Enterで補完
					case 13:
						Cursor.insert(t, Util.unescapeHtml(Wrapper.current(t)));
						Wrapper.getPopup(t).hide();

						return false;
				}

			} else {
		
				// インデントを合わせる	
				if (e.which == 13) {

					var indent = Cursor.getText(t, /^[\t ]*/mg);
					Cursor.insert(t, '\n' + (indent ? indent[indent.length - 1] : ''));

					// TODO:もっとちゃんとスクロールの高さ直す
					var $t = $(t);
					if (window.getComputedStyle) {
						$t.scrollTop($t.scrollTop() + parseInt(getComputedStyle(t, '').getPropertyValue('font-size'), 10) + 3);
					}
					
					return false;
			
				}			
			
			}

		}
	
	};


    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */
	// tagget初期化
	var init = function(t, i) {
	
		// 被らないコードを振る
		while ($('textarea').is('.tagget_' + i)) {
			i = '0' + i;
		}
		$(t).addClass('tagget_' + i);

		Wrapper.wrap(t);
		Wrapper.absolutes(t);

		// イベント設定

		// keyup（発生タイミングが一番少ない）で候補表示
		$(t).keyup(Event.keyup)

		// 入力キーに応じた処理		
		.keydown(Event.keydown);

		// 最初に1回だけ呼び出し。
		var data = Cookie.load(Wrapper.getId(t));
		if (data) {
			t.value = Cookie.unzip(data);
		}
		Wrapper.setLine(t);
	
	}; // init
	

    /* ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- */
	/**
	 * jqueryにプラグイン追加
	 * $('textarea.tagget').tagget()とかで呼び出し
	 */
	$.fn.tagget = function(conf) {


		// 設定オブジェクト
		conf = $.extend({
			toolbar: true, // ツールバー表示
			cookie: true  // クッキーに保存
		}, conf);

		// thisには$('textarea.tagget')が入ってくる
		this.each(function(i) {

				// textareaを初期化
				init(this, i);

		});

		// window全体のイベント設定
		
		var self = this;		
		// リサイズ時にDummyを調整
		$(window).resize(function() {

			self.each(function() {
				Wrapper.adjust(this);
			});

		}).resize();
		
		// Cookie保存設定
		var interval = 60000; // 60秒:1分
		setTimeout(function timer() {

			self.each(function() {

				if (Wrapper.checkCookie(this)) {

					Cookie.save(Wrapper.getId(this), Cookie.zip(this.value));

					var status = Wrapper.getStatus(this);	
					status.children('.tagget_time').html('Draft Saved At ' + Util.now());

				}
				
				setTimeout(timer, interval);
			});		
		}, interval);
			
		// This is jQuery!!
		return this;
		
	}; // $.fn.tagget


})(jQuery);
