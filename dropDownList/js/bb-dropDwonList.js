// JavaScript Document
(function($) {
    $.fn.dropDwonList = function(options) {

        //默认配置
        var defaults = {
            data: [], // 数据
            tips: '请输入', // 提示信息
            editAble: false, // 是不是可以编辑
            associate: false, // 是否开启联想功能， 当editAble为true生效
            ok: function(params) { // 下拉框选择回调
                // todo 
            }
        };

        var GLOBAL = {
            containerId: $(this).attr('id'),
            container: $(this),
            LIST_WRAP: '' // 下拉容器
        };

        var opts = $.extend({}, defaults, options);

        // jquery链式操作
        // this.each(function(i) {

        var dropDwonList = {

            /**
             * [renderCombox 渲染combox的输入框]
             * @param  {[type]} id   [dom元素id]
             * @param  {[type]} data [数据集合]
             * @param  {[type]} tips [placeholder提示信息]
             * @return {[type]}      [description]
             */
            renderCombox: function(id, data, tips) {
                var data = opts.data || [],
                    self = this,
                    id = GLOBAL.containerId || 'combox',
                    listId = id + 'List',
                    tips = opts.tips || '请输入关键字',
                    wrap = GLOBAL.container,
                    //wrap = $('#' + id),
                    tmpl = ['<span class="combox-input-wrap">',
                        '       <input class="combox-input" type="text" placeholder="PLD_STR" UN_ABLED>',
                        '       <input class="combox-input-code hide" type="text" >',
                        '    </span>',
                        '    <span class="combox-select">',
                        '        <i class="combox-triangle-down"></i>',
                        '     </span>'
                    ].join(''),
                    rTips = tmpl.replace('PLD_STR', tips);
                if (!opts.editAble) {
                    rTips = rTips.replace('UN_ABLED', 'unselectable="on"  readonly="true"');
                };

                wrap.append(rTips); /*unselectable="on"*/

                this.renderComboxList(id, data);

                this.addEvent();
            },

            // 添加事件
            addEvent: function() {
                var data = opts.data || [],
                    self = this,
                    id = GLOBAL.containerId || 'combox',
                    listId = id + 'List',
                    $list = $('#' + listId),
                    tips = opts.tips || '请输入关键字',
                    wrap = GLOBAL.container;

                // 搜索方法
                wrap.on('keyup', '.combox-input', function(e) {
                    if (opts.editAble && opts.associate) {


                        var that = $(this),
                            kw = $.trim(that.val());

                        if (e.keyCode === 38 || e.keyCode === 40) {
                            that.blur();
                        };

                        var list = $.map(data, function(item) {
                            if (item.text.indexOf(kw) > -1) {
                                return item;
                            };
                        })
                        wrap.find('.combox-input-code').val('');
                        self.renderComboxList(id, list);
                        $('#' + listId).show();
                    };
                }).on('change', function(e) {
                    wrap.find('.combox-input-code').val('');
                });
                /*.on('keydown', function(e) {
                                         e.stopPropagation();
                                    })*/


                // 显影
                wrap.on('click', '.combox-select', function(e) {
                    e.stopPropagation();

                    //$('.combox-list').not($list).hide();

                    // 还原数据
                    if (opts.editAble && opts.associate) {
                        var value = GLOBAL.container.find('.combox-input-code').val();
                        self.renderComboxList(id, opts.data);
                        var selected = $('#' + listId + ' li[data-value="' + value + '"]');
                        selected.length && selected.trigger('click', 'keyTrigger');
                    };

                    // 修正位置
                    self.fixPosition();
                    $('#' + listId).toggle();

                    // 滚动条位置
                    var selected = $('#' + listId).find('.selected');
                    self.scroolFixed($list, selected);

                    //selected.length && selected[0].scrollIntoView(false);
                })

                // 滚动
                $('body').scroll(function() {
                    $('#' + listId).hide();
                });

                // body点击
                $('body').on('click', function() {
                    $('#' + listId).hide();
                })

                // item选择
                $('body').on('click', '#' + listId + ' li', function(e, param) {
                    e.stopPropagation();
                    var that = $(this),
                        text = that.data('text'),
                        value = that.data('value'),
                        input = wrap.find('.combox-input'),
                        hidden = wrap.find('.combox-input-code');
                    that.addClass('selected').siblings().removeClass('selected');
                    input.val(text).blur();
                    hidden.val(value);
                    !param && $('#' + listId).hide();

                    // 回调函数
                    var params = {
                        text: text,
                        value: value
                    };
                    /*GLOBAL.RETURN_DATA = {
                        opts: opts,
                        data: params
                    };*/
                    opts.ok && opts.ok(params);
                })

                // 上下键选择支持
                $('body').on('keydown', function(e) {
                    var up = 38,
                        down = 40,
                        enter = 13,
                        selected = $('#' + listId).find('.selected');

                    if (!$('#' + listId).is(':visible')) {
                        return;
                    };

                    // up
                    if (e.keyCode === up) {
                        e.preventDefault();
                        selected = selected.prev();
                        selected.trigger('click', 'keyTrigger');
                        //var topNum = $('#' + listId).find('.selected').position().top;
                        //selected.length && selected[0].scrollIntoView();
                        self.scroolFixed($list, selected);
                        return;
                    }

                    // down
                    if (e.keyCode === down) {
                        e.preventDefault();
                        selected = selected.length ? selected = selected.next() : $('#' + listId).find('li:first');
                        selected.trigger('click', 'keyTrigger');
                        self.scroolFixed($list, selected);
                        //selected.length && selected[0].scrollIntoView();
                        return;
                    };

                    // enter
                    if (e.keyCode === enter) {
                        $('#' + listId).hide();
                        return;
                    }

                })
            },

            // 滚动滚动条，使选中的item暴露在视野中
            scroolFixed: function() {

                var $list = GLOBAL.LIST_WRAP,
                    selected = $list.find('.selected');
                if (!selected.length) {
                    return false;
                };

                var cTop = $list.offset().top,
                    csTop = $list.scrollTop(),
                    iTop = selected.offset().top,
                    rTop = iTop - cTop + csTop;
                $list.animate({
                    scrollTop: rTop - 10
                }, 100);
            },

            /**
             * [getComboxId 获取选中的combox的id]
             * @param  {[type]} id   [dom元素id]
             * @param  {[type]} data [数据集合]
             * @return {[type]}      [选中的text和value]
             */
            getComboxId: function(id) {
                var id = id || 'combox',
                    wrap = $('#' + id),
                    input = wrap.find('.combox-input'),
                    hidden = wrap.find('.combox-input-code');
                return {
                    text: input.val(),
                    value: hidden.val()
                }
            },

            /**
             * [renderComboxList 渲染combox的下拉list]
             * @param  {[type]} id   [dom元素id]
             * @param  {[type]} data [数据集合]
             * @return {[type]}      [description]
             */
            renderComboxList: function(id, data) {
                var id = id || 'combox',
                    listId = id + 'List',
                    wrap = $('#' + id),
                    listWrap = $('#' + listId);

                listWrap.length && listWrap.remove();

                // 计算位置
                /*var left = wrap.offset().left,
                    top = wrap.offset().top,
                    h = wrap.outerHeight(),
                    w = wrap.outerWidth(),
                    listTop = top + h,
                    style = 'top:' + listTop + 'px;left:' + left + 'px;width:' + w + 'px';*/
                //selectedCode = this.getComboxId(id).value;

                // 下拉模板
                var liTmpl = data.length ? $.map(data, function(item, i) {
                        return '<li class="ell" title="' + item.text + '"data-text="' + item.text + '" data-value="' + item.value + '"title="' + item.text + '">' + item.text + '</li>';
                    }).join('') : '<li class="empty-data-li">没有数据</li>',
                    downListTmpl = [' <div id=' + listId + ' class="combox-list">',
                        '               <ul class="combox-list-ul">',
                        liTmpl,
                        '               </ul>',
                        '           </div>'
                    ].join('');

                $('body').append(downListTmpl);

                GLOBAL.LIST_WRAP = $('#' + listId);

                this.fixPosition();
                //listWrap.show();
            },


            // 修正位置，返回正确的位置
            fixPosition: function() {
                var id = GLOBAL.containerId || 'combox',
                    listId = id + 'List',
                    wrap = $('#' + id),
                    listWrap = $('#' + listId);

                var bH = $('body').outerHeight(),
                    cH = $('#' + id).outerHeight(),
                    listH = listWrap.outerHeight(),
                    top = wrap.offset().top,
                    left = wrap.offset().left,
                    h = wrap.outerHeight(),
                    w = wrap.outerWidth(),
                    position = {};

                // 如果显示不全
                if (listH + h + top >= bH && top > listH) {
                    position = {
                        top: top - listH,
                        left: left,
                        width: w
                    };
                    //position['border' + (top > listH ? 'Bottom' : 'Top')] = 'none';
                } else {
                    position = {
                        top: top + h,
                        left: left,
                        width: w,
                        //borderTop: 'none'
                    };
                };
                /*return position;*/

                listWrap.css(position);
            },

            // 销毁
            distory: function() {

            },

            // 获取数据
            getData: function() {
                var code = GLOBAL.container.find('.combox-input-code').val(),
                    text = GLOBAL.container.find('.combox-input').val(),
                    data = opts.data;
                if (code) {
                    return this.getItem(data, text);
                } else {
                    return {
                        text: text,
                        value: ''
                    };
                }
                // return GLOBAL.RETURN_DATA;
            },

            // 获取数组制定项
            getItem: function(data, code) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i]['text'] === code) {
                        return data[i];
                    };
                }
                return '';
            },

            // 塞值，回显
            setData: function(param) {
                var id = GLOBAL.containerId || 'combox',
                    listId = id + 'List',
                    wrap = GLOBAL.container,
                    listWrap = $('#' + listId),
                    selected;
                if (opts.editAble) {
                    if (param.text !== undefined) {
                        wrap.find('.combox-input').val(param.text);
                        wrap.find('.combox-input-code').val('');

                        // 清除选中
                        listWrap.find('.selected').removeClass('selected');
                    };
                    if (param.value !== undefined) {
                        selected = $('#' + listId + ' li[data-value="' + param.value + '"]');
                        selected.length && selected.trigger('click', 'keyTrigger');
                        //selected[0].scrollIntoView();
                        this.scroolFixed();
                    };

                } else {
                    selected = $('#' + listId + ' li[data-value="' + param.value + '"]');
                    selected.length && selected.trigger('click', 'keyTrigger');
                    //selected[0].scrollIntoView();
                    this.scroolFixed();
                };

            },

            ctor: function() {
                this.renderCombox();
            }

        };

        dropDwonList.ctor();

        // 返回实例
        return dropDwonList;

        // });

    };

})(jQuery);
