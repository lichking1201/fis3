/*
* Search box group
*/

var $ = require("common:widget/ui/jquery/jquery.js"),
	UT = require("common:widget/ui/ut/ut.js"),
	helper = require("common:widget/ui/helper/helper.js");
require("lv2:widget/ui/suggest/suggest.js");

Gl.searchGroup = function(o) {
	var _conf = conf.searchGroup,
		type = o.type || "index",
		logoPath = _conf.conf[type].logoPath,
		
		logo = $("#" + (o.logoId || "searchGroupLogo")),
		logoGroup = $("#" + (o.logoGroupId || "searchGroupLogos")),
		tabs = $("#" + (o.tabsId || "searchGroupTabs")),
		form = $("#" + (o.formId || "searchGroupForm")),
		input = $("#" + (o.inputId || "searchGroupInput")),
		label = $("#" + (o.labelId || "searchGroupLabel")),
		// radios = $("#" + (o.radiosId || "searchGroupRadios")),
		btn = $("#" + (o.btnId || "searchGroupBtn")),
		// more = $("#" + (o.moreId || "searchGroupMore")),
		moreTab = $("#" + (o.moreTabId || "searchGroupMoreTab")),
		params = $("#" + (o.paramsId || "searchGroupParams")),
		// radioName = o.radioName || "searchGroupRadio",

		webEngine = $("#searchGroupWebEngine"),

		btnWrap = btn.parent(),
		inputWrap = input.parent(),
		defaultN = _conf.conf[type].curN || 0,
		curTab = $("a:eq(" + defaultN + ")", tabs),
		tabsChildren = $("a", tabs),
		//render data when init sug
		defaultData = _conf.sug[_conf.list[curTab.attr("data-t")].engine[defaultN].id],
		//record which form was selected in tabs
		storeForm = {},
		logoHash  = {
	    	'yahoo': 'yahoo',
	    	'google': 'google',
	    	'baidu': 'baidu',
	    	'defau': 'defau'
	    },
	    getCurLogo = function(attr) {
	    	var tmpObj = null;
	    	attr = attr.toLowerCase();
	    	for(var i in logoHash) {
	    		if(attr.search(i) > -1) {
	    			tmpObj = logoHash[i];
	    			break;
	    		}
	    	}
	    	if(tmpObj === 'yahoo' && conf.country === 'jp') {
	    		tmpObj = 'yahoo_jp';
	    	}
		    return (tmpObj || 'defau');
	    },
	    //smallLogoPath = "/resource/fe/headerTest/search/#{logo}.png",
	    
		//reset the form about action and params
		resetForm = function(data, n) {
			var ret = [];
			var theLogoPath = $(document.body).hasClass("skin-type-dark")?(_conf.conf[type].logoPath+"dark/"):_conf.conf[type].logoPath;
			var logoGroupDt = $("dt", logoGroup).clone();
			var isFixed     = $(document.body).hasClass("header-fixed-up");
			// Fixed bug in IE8
			logoGroup.html('');
			logoGroup.append(logoGroupDt);
			// rebinding logo element
			logo = $("#" + (o.logoId || "searchGroupLogo"), logoGroupDt);

			form.attr("action", data[n].action);
			input.attr("name", data[n].q);
			if(isFixed) {
				logo.attr("src", "/resource/fe/headerTest/search/" + getCurLogo(data[n].logo) + ".png");
			} else {
				logo.attr("src", theLogoPath + data[n].logo + ".png");
			}
			logo.attr("alt", data[n].name);
			logo.parent().attr("title", data[n].name);
			logo.parent().attr("data-n", n);
			logo.attr("data-id", data[n].id);

			// $("dd", logoGroup).remove();

			logoGroup.append(function () {
				ret = [];
				$.each(data, function(key, val) {
					if(isFixed) {
						ret.push('<dd class="box-search_logo_hide"><a href="#" onclick="return false" title="' + val.name + '" hidefocus="true" data-n="' + key + '"><img id="searchGroupLogo_' + key + '" src="/resource/fe/headerTest/search/' + getCurLogo(val.logo) + '.png" alt="' + val.name + '" /><span class="box-search-logo-item-tips">'+ val.name + '</span></a></dd>');
					} else {
						ret.push('<dd class="box-search_logo_hide"><a href="#" onclick="return false" title="' + val.name + '" hidefocus="true" data-n="' + key + '"><img id="searchGroupLogo_' + key + '" src="' + theLogoPath + val.logo + '.png" alt="' + val.name + '" /></a></dd>');
					}
				});
				return ret.join("");
			});
			// fix: show errors when click radios on IE
			/*setTimeout(function() {
				radios.html(function() {
					ret = [];
					$.each(data,function(key, val) {
						ret.push('<label for="searchGroupRadio_' + key + '"><input id="searchGroupRadio_' + key + '"  name="searchGroupRadio" value="' + key + '" type="radio" ' + (key === n ? "checked" : "") + '>' + val.name + '</label>');
					});
					return ret.join("");
				});
			}, 0);*/

			params.html(function() {
				ret = [];
				$.each(data[n].params, function(key, val) {
					ret.push('<input type="hidden" name="' + key + '" value="' + val + '">');
				});
				return ret.join("");
			});

			if (data.length <= 1) {
				logoGroup.addClass("box-search_logo_disabled");
			} else {
				logoGroup.removeClass("box-search_logo_disabled");
			}
			logoGroup.children().on("mouseenter", function() {
				$(this).addClass("box-search_logo_hover");
			}); 
			logoGroup.children().on("mouseleave", function() {
				$(this).removeClass("box-search_logo_hover");
			});
		},
		
		resetSug = function(data, n) {
			data = _conf.sug[data[n].id];
			$.each(data, function(key, val) {
				sug.o[key] = val;
			});
			//fix more prams
			!data.templ && (sug.o.templ = false);
			!data.callbackFn && (sug.o.callbackFn = false);
			!data.callbackDataKey && (sug.o.callbackDataKey = false);
			!data.callbackName && (sug.o.callbackName = false);
			!data.callbackDataNum && (sug.o.callbackDataNum = false);
			!data.customUrl && (sug.o.customUrl = false);
			
			!data.customUrl && (sug.o.customUrl = false);
			!data.charset && (sug.o.charset = undefined);
			sug.reset(true);
		},

		// toggle for baidu sug
		resetBaiduSug = function (data, n) {

			if (!baidu_sug) {
				return;
			}

			data = data ? data[n].baiduSug : false;

			if (data) {
				baidu_sug.setMode(data.mod);
				baidu_sug.toggle(true);
			} else {
				baidu_sug.toggle(false);
			}
		},

		// toggle for PS video sug
		resetBaiduVideoSug = function(data, n) {
			if(!window["baidu_video_sug"]) {
				return;
			}

			data = data ? data[n].otherSug : false;

			if (data) {
				baidu_video_sug.setMode(data.mod);
				baidu_video_sug.toggle(true);
			} else {
				baidu_video_sug.toggle(false);
			}
		},
		
		switchTab = function(tab, sugStay) {
			tab = $(tab);
			curTab.removeClass("cur");
			tab.addClass("cur");
			curTab = tab;
			
			var t = tab.attr("data-t"),

				list = _conf.list,
				engines = list[t].engine,
				engLen = engines.length;
			//ps sug gut add tab changed name
			tabCategoryName = t;
			
				//if the last element is null, remove it
				if($.isEmptyObject(engines[engLen-1])){
					engines.length = engLen - 1;
				};
			//record current form(add the current type to storeForm as a key)
			storeForm[t] || (storeForm[t] = 0);
			
			//reset form
			resetForm(engines, storeForm[t]);
			
			//reset suggest
			!sugStay && resetSug(engines, storeForm[t]);

			// reset PS video sug
			!sugStay && resetBaiduVideoSug(engines, storeForm[t]);

			// reset baidu sug
			!sugStay && resetBaiduSug(engines, storeForm[t]);
			
			/*
			//reset hot word
			label.text(list[t].hotWords)
			*/

			/*
			setTimeout(function() {
				input.select();
			}, 16);
			*/
			//keep the cursor in end
			/*setTimeout(function() {
				setCursorPos(input[0], input.val().length);
			}, 16); */
		},
		
		showMore = function() {
			var more = $("dd", moreTab),
				list = _conf.more,
				ret = [];
			if ($("dd", moreTab).length === 0) {
				$.each(list, function() {
					ret.push('<dd><a href="' + this.url + '">' + this.name + '</a></dd>');
				});
				moreTab.append(ret.join(""));
				moreTab.children().on("mouseenter", function() {
					$(this).addClass("box-search_more_hover");
				}); 
				moreTab.children().on("mouseleave", function() {
					$(this).removeClass("box-search_more_hover");
				}); 
			}
			if(moreTab.hasClass("box-search_more_show")) {
				moreTab.removeClass("box-search_more_show");
				more.each(function () {
					$(this).addClass("box-search_more_hide");
				});
			}
			else {
				moreTab.addClass("box-search_more_show");
				more.each(function () {
					$(this).removeClass("box-search_more_hide");
				});
			}
		},

		showLogo = function () {
			var n = logo.parent().attr("data-n"),
			logoList = $("dd", logoGroup);
			var isFix  = $(document.body).hasClass("header-fixed-up"),
			    logLen = logoList.length;
			if (logoGroup.hasClass("box-search_logos_show")) {
				logoGroup.removeClass("box-search_logos_show");
				logoList.each(function () {
					$(this).addClass("box-search_logo_hide").removeClass("box-search_logo_first box-search_logo_last");
				});
			}
			else {
				logoGroup.addClass("box-search_logos_show");
				logoList.each(function (key) {
					var $that = $(this);
					key != n && $that.removeClass("box-search_logo_hide");
				    if (isFix && (logLen > 1) && (key != n)) {
				    	if(n == 0) {
				    		if(key === 1) {
				    			$that.addClass("box-search_logo_first");
				    		}
				    		if(key === logLen-1) {
				    			$that.addClass("box-search_logo_last");
				    		}
				    	} else if(n == logLen-1) {
				    		if(key === 0) {
				    			$that.addClass("box-search_logo_first");
				    		}
				    		if(key === logLen-2) {
				    			$that.addClass("box-search_logo_last");
				    		}
				    	} else {
				    		if(key === 0) {
				    			$that.addClass("box-search_logo_first");
				    		}
				    		if(key === logLen-1) {
				    			$that.addClass("box-search_logo_last");
				    		}
				    	}
					}
				});
			}
		},

		//disable selection for input elements
		disableSelection = function(el) {
			if (typeof el.onselectstart != "undefined") { //IE
				el.onselectstart = function() {
					return false;
				}
			} else if (typeof el.style.MozUserSelect != "undefined") { //FF
				el.style.MozUserSelect = "none";
			} else { //Opera
				el.onmousedown = function() {
					return false;
				}
			}
		},

		setCursorPos = function(obj, pos) {
			if (obj.setSelectionRange) {
				obj.focus();
				obj.setSelectionRange(pos, pos);
			} else if (obj.createTextRange) {
				var range = obj.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		},
		
		//sug instantiation
		sug = Gl.suggest(input[0], {
			classNameWrap: "sug-search",
			classNameQuery: "sug-query",
			classNameSelect: "sug-select",
			//classNameClose: "sug-close",
			delay: _conf.conf[type].delay,
			n: _conf.conf[type].n,
			autoFocus: false,
			requestQuery: defaultData.requestQuery,
			requestParas: defaultData.requestParas,
			url: defaultData.url,
			callbackFn: defaultData.callbackFn,
			callbackDataKey: defaultData.callbackDataKey,
			onMouseSelect: function() {
				var t = curTab.attr("data-t"),
					_action = _conf.list[t].engine[storeForm[t]].action;
				//fix action
				if(/#\{([^}]*)\}/mg.test(_action)) {
					form.attr("action", helper.replaceTpl(_action, {q: encodeURIComponent(input.val())}));
					input.attr("disabled", true);
					setTimeout(function() {
						input.attr("disabled", false);
					}, 16);
				}
			  input.select();
	          var _type = curTab.attr("data-t");
			  var utObj = {
				  type: "click",
				  position: "search",
				  engine: _conf.list[_type].engine[storeForm[_type]].id.toLowerCase(),
				  modId: "search",
				  tab: t
			  },
				  val = encodeURIComponent(input.val());
			  /*if (_conf.conf.sort) {
				  utObj.sort = _conf.conf.sort;
			  } else {
				  if (conf.country === "tw" && $(document.body).hasClass("header-fixed-up")) {
					  utObj.sort = "header";
				  }
			  }*/
			  if ($(document.body).hasClass("header-fixed-up")) {
				  utObj.sort = "header";
			  }
			  if (conf.country != "jp") {
				  utObj.value = val;
			  }
			  UT.send(utObj);
	        },
			templ: defaultData.templ
		});
	
	//ps sug gut add tab 
	window.tabCategoryName = curTab.attr("data-t");

	//clear the input's value after refresh
	input.val("");	
	//some browsers may keep form's status after refresh
	// $("[name = radioName]:first").attr("checked", true);
	
	//record the default form'n
	storeForm[curTab.attr("data-t")] = 0;

	//select text in input after submit
	form.on("submit", function() {
		// input.select();
		var t = curTab.attr("data-t"),
			_action = _conf.list[t].engine[storeForm[t]].action,
			_url = _conf.list[t].engine[storeForm[t]].url,
			isBlank = false;
		/*var radioEl = $("input", radios);
		for(var i = 0; i < radioEl.length; i++) {
			if(radioEl.eq(i).attr("checked")) {
				var checkedRadio = radioEl.eq(i);
			}
		}
		if(t == "shopping" && checkedRadio.attr("id") == "searchGroupRadio_0") {
			form[0].acceptCharset = document.charset = "big5";
		}
		else {
			form[0].acceptCharset = document.charset = "utf-8";
		}*/

		/* cancel hot word
		// set input's value to the hot word if it was blank
		if($.trim(input.val()) === "") {
			if($.trim(label.text()) === ""){
				var action = _action && _url ? _url : _action;
				form.attr("action", action);
			} else {
				input.val(label.text());
				input.css("color", "#fff");
				isBlank = true;
			}
		} else {
			form.attr("action", _action);
		}
		*/

		// set charset to big5 while the engine is ruten
		if(t == "shopping" && /ruten.png/.test(logo.attr("src"))) {
			form[0].acceptCharset = document.charset = "big5";
		}
		else {
			form[0].acceptCharset = document.charset = "utf-8";
		}
		var utObj = {
			type: "click",
			position: "search",
			engine: _conf.list[t].engine[storeForm[t]].id.toLowerCase(),
			modId: "search",
			tab: t
		},
		    val = encodeURIComponent(input.val());
		/*if (_conf.conf.sort) {
	        utObj.sort = _conf.conf.sort;
		} else {
			if(conf.country === "tw" && $(document.body).hasClass("header-fixed-up")) {
				utObj.sort = "header";
			}
		}*/
		if($(document.body).hasClass("header-fixed-up")) {
			utObj.sort = "header";
		}
		if(conf.country != "jp") {
			utObj.value = val;
		}
		UT.send(utObj);
        //reset input after search     
		if(isBlank) {
			setTimeout(function() {
				input.val("");
				input.removeAttr("style");
			}, 16);
		} else {
			input.select();
		}
		//fix action
		if(/#\{([^}]*)\}/mg.test(_action)) {
			form.attr("action", helper.replaceTpl(_action, {q: encodeURIComponent(input.val())}));
			input.attr("disabled", true);
			setTimeout(function() {
				input.attr("disabled", false);
				input.select();
			}, 16);
		}
		//no action while engine is hao123 and input val is blank
		if(/^hao123$/.test(logo.attr("data-id")) && input.val() === "") {
			return false;
		}
	});
	
	//disableSelection
	disableSelection(tabs[0]);
	// disableSelection(radios[0]);
	
	resetBaiduVideoSug(_conf.list[curTab.attr('data-t')].engine, defaultN);

	resetBaiduSug(_conf.list[curTab.attr('data-t')].engine, defaultN);
	
	//focus the input when init

	//to let lv2 page NOT to auto focus SEARCH INPUT! by NE
	if(o.autoFocus == null){
		o.autoFocus = true; //default TRUE!
	}
	if(o.autoFocus) {
		input.focus();
	}
	
	btn.on("mousedown", function() {
		btnWrap.addClass("btn-search_click");
	});
	btn.on("mouseup", function() {
		btnWrap.removeClass("btn-search_click");
	});	
	btn.on("mouseout", function() {
		btnWrap.removeClass("btn-search_click");
	});
	btn.on("mouseenter", function() {
		btnWrap.addClass("btn-search_hover");
	});
	btn.on("mouseleave", function() {
		btnWrap.removeClass("btn-search_hover");
	});
	input.on("focus", function() {
		inputWrap.addClass("box-search_focus");
		label.hide();
	});
	input.on("blur", function() {
		inputWrap.removeClass("box-search_focus");
		// $.trim(input.val()) === "" && label.show();
	});
	logoGroup.children().on("mouseenter", function() {
		$(this).addClass("box-search_logo_hover");
	}); 
	logoGroup.children().on("mouseleave", function() {
		$(this).removeClass("box-search_logo_hover");
	}); 
	moreTab.children().on("mouseenter", function() {
		$(this).addClass("box-search_more_hover");
	}); 
	moreTab.children().on("mouseleave", function() {
		$(this).removeClass("box-search_more_hover");
	}); 

	tabs.on("mousedown", function(e) {
		var el = e.target;
		el.tagName === "SPAN" && (el = el.parentNode);
		//el.tagName !== "DT" && !hasClass(el, "cur") && !hasClass(el, "more") && switchTab(el);
		el.getAttribute("data-t") && switchTab(el);
		form.acceptCharset = document.charset = "utf-8";

		// e.stopPropagation();

		// focus the input when tab element exchanges
		setTimeout(function() {
			input.focus();
			// clearTimeout(t);
		}, 5);		
	});
	conf.pageType !=="lv2" && window["PDC"] && PDC.mark("c_sxvi");
	moreTab.on("mousedown", function(e) {
		var el = e.target;
		if(el.parentNode.tagName === "DD") {
			setTimeout(showMore, 200);
		}else {
			showMore();
		}
	});
	
	$(document).on("mousedown", function(e) {
		var el = e.target;
		logoGroup.hasClass("box-search_logos_show") && el !== logoGroup[0] && !jQuery.contains(logoGroup[0], el) && showLogo();
		moreTab.hasClass("box-search_more_show") && el !== moreTab[0] && !jQuery.contains(moreTab[0], el) && showMore();
		// more.css("display") === "block" && el !== moreTab[0] && !jQuery.contains(moreTab[0], el) && !jQuery.contains(more[0], el) && showMore();
	});
	
	logoGroup.on("click", function(e) {
		var el = e.target,
		    $el = $(el),
		    $ta = el.tagName,
			t = curTab.attr("data-t"),
			n = storeForm[t],
			_n,
			engines = _conf.list[t].engine,
			engLen = engines.length;

			//remove the last null ,IE8 bug
			if($.isEmptyObject(engines[engLen-1])){
				engines.length = engLen - 1;
			};
			if ($ta === "IMG"||$ta === "SPAN") {
				_n = ~~$el.parent().attr("data-n");
			} else if ($ta === "A") {
				_n = ~~$el.attr("data-n");
			} else {
				_n = ~~$el.children().attr("data-n");
			}

			if(curTab.attr("data-t") == "web") {
				webEngine.attr("data-num", _n);
			}
		//input.select();
		//keep the cursor in end
		form[0].acceptCharset = document.charset = "utf-8";
		/*setTimeout(function() {
			setCursorPos(input[0], input.val().length);
		}, 16);*/
			
		if(_n !== n) {
			storeForm[t] = _n;
			resetForm(engines, _n);
			
			//reset suggest
			resetSug(engines, _n);

			//reset PS video sug
			resetBaiduVideoSug(engines, _n);

			//reset baidu sug
			resetBaiduSug(engines, _n);
		}
		showLogo();



	});

}
