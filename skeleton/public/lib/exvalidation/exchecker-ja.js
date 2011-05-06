/**
 * exValidation
 *
 * @version   : 1.2.2
 * @author    : nori (norimania@gmail.com)
 * @copyright : 5509 (http://5509.me/)
 * @license   : The MIT License
 * @link      : http://5509.me/log/exvalidation
 * @modified  : 2011-04-24 22:14
 */
;(function($) {
	// Extend validation rules
	$.exValidationRules = $.extend($.exValidationRules, {
		chkrequired: [
			"入力してください",
			function(txt, t) {
				if ( $(t).hasClass("chkgroup") ) {
					var flag = 0;
					$("input,select",t).each(function() {
						if ( $(this).val().length > 0 ) flag++;
					});
					if ( txt && flag === $("input,select", t).length ) {
						if ( /^[ 　\r\n\t]+$/.test(txt) ) {
							return false;
						} else {
							return true;
						}
					}
				} else {
					if ( txt && txt.length>0 ) {
						if ( /^[ 　\r\n\t]+$/.test(txt) ) {
							return false;
						} else {
							return true;
						}
					}
				}
			}
		],
		chkselect: [
			"選択してください",
			function(txt, t) {
				if ( txt && txt.length>0 ) {
					if ( /^[ 　\r\n\t]+$/.test(txt) ) {
						return false;
					} else {
						return true;
					}
				}
			}
		],
		chkretype: [
			"入力内容が異なります",
			function(txt, t) {
				var elm = $("#" + $(t).attr("class").split("retype\-")[1].split(/\b/)[0]);
				if ( elm.hasClass("chkgroup") ) {
					var chktxt = $("input", elm), txt = $("input", t);
					for ( var i = 0, flag = false; i < chktxt.length; i++ ) {
						if ( chktxt[i].value === txt[i].value ) flag = true;
						else flag = false;
					}
					if ( flag ) return true;
				} else {
					return elm.val() == txt;
				}
			}
		],
		chkemail: [
			"正しいメールアドレスの形式を入力してください",
			/^(?:[^\@]+?@[A-Za-z0-9_\.\-]+\.+[A-Za-z\.\-\_]+)*$/
		],
		chkhankaku: [
			"全角文字は使用できません",
			/^(?:[a-zA-Z0-9@\;\:\[\]\{\}\|\^\=\/\!\*\`\"\#\$\+\%\&\'\(\)\,\.\-\_\?\\\s]*)*$/
		], //"
		chkzenkaku: [
			"全角文字で入力してください",
			/^(?:[^a-zA-Z0-9@\;\:\[\]\{\}\|\^\=\/\!\*\"\#\$\+\%\&\'\(\)\,\.\-\_\?\\\s]+)*$/
		], //"
		chkhiragana: [
			"ひらがなで入力してください",
			/^(?:[あ-んー～]+)*$/
		],
		chkkatakana: [
			"カタカナで入力してください",
			/^(?:[ア-ンー～]+)*$/
		],
		chkfurigana: [
			"ふりがなはひらがな、全角数字と〜、ー、（）が利用できます",
			/^(?:[あ-ん０-９ー～（）\(\)\d 　]+)*$/
		],
		chknochar: [
			"英数字で入力してください",
			/^(?:[a-zA-Z0-9]+)*$/
		],
		chknocaps: [
			"英数字(小文字のみ)で入力してください",
			/^(?:[a-z0-9]+)*$/
		],
		chknumonly: [
			"半角数字のみで入力してください",
			/^(?:[0-9]+)*$/
		],
		chkmin: [
			"文字以上で入力してください",
			function(txt, t) {
				if ( txt.length==0 ) return true;
			 	var length = $(t).attr("class").match(/min(\d+)/) ? RegExp.$1 : null;
				return txt.length >= length;
			}
		],
		chkmax: [
			"文字以内で入力してください",
			function(txt, t) {
				var length = $(t).attr("class").match(/max(\d+)/) ? RegExp.$1 : null;
				return txt.length <= length;
			}
		],
		chkradio: [
			"選択してください",
			function(txt, t) {
				return $("input:checked",t).length>0;
			}
		],
		chkcheckbox: [
			"選択してください",
			function(txt, t) {
				return $("input:checked",t).length>0;
			}
		],
		chkurl: [
			"正しいURLの形式を入力してください",
			/^(?:http(s)?\:\/\/[^\/]*)*$/
		],
		chktel: [
			"正しい電話番号を入力してください",
			/^(?:\(?\d+\)?\-?\d+\-?\d+)*$/
		],
		chkfax: [
			"正しいファックス番号を入力してください",
			/^(?:\(?\d+\)?\-?\d+\-?\d+)*$/
		]
	});
})(jQuery);