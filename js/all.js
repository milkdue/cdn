// 气泡
function qipao() {
    $('#page-header').circleMagic({
        radius: 10,
        density: .2,
        color: 'rgba(255,255,255,.4)',
        clearOffset: 0.99
    });
}! function(p) {
    p.fn.circleMagic = function(t) {
        var o, a, n, r, e = !0,
            i = [],
            d = p.extend({ color: "rgba(255,0,0,.5)", radius: 10, density: .3, clearOffset: .2 }, t),
            l = this[0];

        function c() { e = !(document.body.scrollTop > a) }

        function s() { o = l.clientWidth, a = l.clientHeight, l.height = a + "px", n.width = o, n.height = a }

        function h() {
            if (e)
                for (var t in r.clearRect(0, 0, o, a), i) i[t].draw();
            requestAnimationFrame(h)
        }

        function f() {
            var t = this;

            function e() { t.pos.x = Math.random() * o, t.pos.y = a + 100 * Math.random(), t.alpha = .1 + Math.random() * d.clearOffset, t.scale = .1 + .3 * Math.random(), t.speed = Math.random(), "random" === d.color ? t.color = "rgba(" + Math.floor(255 * Math.random()) + ", " + Math.floor(0 * Math.random()) + ", " + Math.floor(0 * Math.random()) + ", " + Math.random().toPrecision(2) + ")" : t.color = d.color }
            t.pos = {}, e(), this.draw = function() { t.alpha <= 0 && e(), t.pos.y -= t.speed, t.alpha -= 5e-4, r.beginPath(), r.arc(t.pos.x, t.pos.y, t.scale * d.radius, 0, 2 * Math.PI, !1), r.fillStyle = t.color, r.fill(), r.closePath() }
        }! function() {
            o = l.offsetWidth, a = l.offsetHeight,
                function() {
                    var t = document.createElement("canvas");
                    t.id = "canvas", t.style.top = 0, t.style.zIndex = 0, t.style.position = "absolute", l.appendChild(t), t.parentElement.style.overflow = "hidden"
                }(), (n = document.getElementById("canvas")).width = o, n.height = a, r = n.getContext("2d");
            for (var t = 0; t < o * d.density; t++) {
                var e = new f;
                i.push(e)
            }
            h()
        }(), window.addEventListener("scroll", c, !1), window.addEventListener("resize", s, !1)
    }
}(jQuery);

// 调用气泡方法
qipao();

// botui.js
/*
 * botui 0.3.9
 * A JS library to build the UI for your bot
 * https://botui.org
 *
 * Copyright 2019, Moin Uddin
 * Released under the MIT license.
*/

(function (root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return (root.BotUI = factory(root));
      });
    } else {
      root.BotUI = factory(root);
    }
  }(typeof window !== 'undefined' ? window : this, function (root, undefined) {
    "use strict";
  
    var BotUI = (function (id, opts) {
  
      opts = opts || {};
  
      if(!id) {
        throw Error('BotUI: Container id is required as first argument.');
      }
  
      if(!document.getElementById(id)) {
        throw Error('BotUI: Element with id #' + id + ' does not exist.');
      }
  
      if(!root.Vue && !opts.vue) {
        throw Error('BotUI: Vue is required but not found.');
      }
  
      var _botApp, // current vue instance.
      _options = {
        debug: false,
        fontawesome: true,
        searchselect: true
      },
      _container, // the outermost Element. Needed to scroll to bottom, for now.
      _interface = {}, // methods returned by a BotUI() instance.
      _actionResolve,
      _markDownRegex = {
        icon: /!\(([^\)]+)\)/igm, // !(icon)
        image: /!\[(.*?)\]\((.*?)\)/igm, // ![aleternate text](src)
        link: /\[([^\[]+)\]\(([^\)]+)\)(\^?)/igm // [text](link) ^ can be added at end to set the target as 'blank'
      },
      _fontAwesome = 'https://use.fontawesome.com/ea731dcb6f.js',
      _esPromisePollyfill = 'https://cdn.jsdelivr.net/es6-promise/4.1.0/es6-promise.min.js', // mostly for IE
      _searchselect =  "https://unpkg.com/vue-select@2.4.0/dist/vue-select.js";
  
      root.Vue = root.Vue || opts.vue;
  
      // merge opts passed to constructor with _options
      for (var prop in _options) {
        if (opts.hasOwnProperty(prop)) {
          _options[prop] = opts[prop];
        }
      }
  
      if(!root.Promise && typeof Promise === "undefined" && !opts.promise) {
        loadScript(_esPromisePollyfill);
      }
  
      function _linkReplacer(match, $1, $2, $3) {
        var _target = $3 ? 'blank' : ''; // check if '^' sign is present with link syntax
        return "<a class='botui-message-content-link' target='" + _target + "' href='" + $2 +"'>" + $1 + "</a>";
      }
  
      function _parseMarkDown(text) {
        return text
                   .replace(_markDownRegex.image, "<img class='botui-message-content-image' src='$2' alt='$1' />")
                   .replace(_markDownRegex.icon, "<i class='botui-icon botui-message-content-icon fa fa-$1'></i>")
                   .replace(_markDownRegex.link, _linkReplacer);
      }
  
      function loadScript(src, cb) {
        var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
  
            if(cb) {
              script.onload = cb;
            }
  
        document.body.appendChild(script);
      }
  
      function _handleAction(text) {
        if(_instance.action.addMessage) {
          _interface.message.human({
            delay: 100,
            content: text
          });
        }
        _instance.action.show = !_instance.action.autoHide;
      }
  
      var _botuiComponent = {
        template: '<div class=\"botui botui-container\" v-botui-container><div class=\"botui-messages-container\"><div v-for=\"msg in messages\" class=\"botui-message\" :class=\"msg.cssClass\" v-botui-scroll><transition name=\"slide-fade\"><div v-if=\"msg.visible\"><div v-if=\"msg.photo && !msg.loading\" :class=\"[\'profil\', \'profile\', {human: msg.human, \'agent\': !msg.human}]\"> <img :src=\"msg.photo\" :class=\"[{human: msg.human, \'agent\': !msg.human}]\"></div><div :class=\"[{human: msg.human, \'botui-message-content\': true}, msg.type]\"><span v-if=\"msg.type == \'text\'\" v-text=\"msg.content\" v-botui-markdown></span><span v-if=\"msg.type == \'html\'\" v-html=\"msg.content\"></span> <iframe v-if=\"msg.type == \'embed\'\" :src=\"msg.content\" frameborder=\"0\" allowfullscreen></iframe></div></div></transition><div v-if=\"msg.photo && msg.loading && !msg.human\" :class=\"[\'profil\', \'profile\', {human: msg.human, \'agent\': !msg.human}]\"> <img :src=\"msg.photo\" :class=\"[{human: msg.human, \'agent\': !msg.human}]\"></div><div v-if=\"msg.loading\" class=\"botui-message-content loading\"><i class=\"dot\"></i><i class=\"dot\"></i><i class=\"dot\"></i></div></div></div><div class=\"botui-actions-container\"><transition name=\"slide-fade\"><div v-if=\"action.show\" v-botui-scroll><form v-if=\"action.type == \'text\'\" class=\"botui-actions-text\" @submit.prevent=\"handle_action_text()\" :class=\"action.cssClass\"><i v-if=\"action.text.icon\" class=\"botui-icon botui-action-text-icon fa\" :class=\"\'fa-\' + action.text.icon\"></i> <input type=\"text\" ref=\"input\" :type=\"action.text.sub_type\" v-model=\"action.text.value\" class=\"botui-actions-text-input\" :placeholder=\"action.text.placeholder\" :size=\"action.text.size\" :value=\" action.text.value\" :class=\"action.text.cssClass\" required v-focus/> <button type=\"submit\" :class=\"{\'botui-actions-buttons-button\': !!action.text.button, \'botui-actions-text-submit\': !action.text.button}\"><i v-if=\"action.text.button && action.text.button.icon\" class=\"botui-icon botui-action-button-icon fa\" :class=\"\'fa-\' + action.text.button.icon\"></i> <span>{{(action.text.button && action.text.button.label) || \'Go\'}}</span></button></form><form v-if=\"action.type == \'select\'\" class=\"botui-actions-select\" @submit.prevent=\"handle_action_select()\" :class=\"action.cssClass\"><i v-if=\"action.select.icon\" class=\"botui-icon botui-action-select-icon fa\" :class=\"\'fa-\' + action.select.icon\"></i><v-select v-if=\"action.select.searchselect && !action.select.multipleselect\" v-model=\"action.select.value\" :value=\"action.select.value\" :placeholder=\"action.select.placeholder\" class=\"botui-actions-text-searchselect\" :label=\"action.select.label\" :options=\"action.select.options\"></v-select><v-select v-else-if=\"action.select.searchselect && action.select.multipleselect\" multiple v-model=\"action.select.value\" :value=\"action.select.value\" :placeholder=\"action.select.placeholder\" class=\"botui-actions-text-searchselect\" :label=\"action.select.label\" :options=\"action.select.options\"></v-select> <select v-else v-model=\"action.select.value\" class=\"botui-actions-text-select\" :placeholder=\"action.select.placeholder\" :size=\"action.select.size\" :class=\"action.select.cssClass\" required v-focus><option v-for=\"option in action.select.options\" :class=\"action.select.optionClass\" v-bind:value=\"option.value\" :disabled=\"(option.value == \'\')?true:false\" :selected=\"(action.select.value == option.value)?\'selected\':\'\'\"> {{ option.text }}</option></select> <button type=\"submit\" :class=\"{\'botui-actions-buttons-button\': !!action.select.button, \'botui-actions-select-submit\': !action.select.button}\"><i v-if=\"action.select.button && action.select.button.icon\" class=\"botui-icon botui-action-button-icon fa\" :class=\"\'fa-\' + action.select.button.icon\"></i> <span>{{(action.select.button && action.select.button.label) || \'Ok\'}}</span></button></form><div v-if=\"action.type == \'button\'\" class=\"botui-actions-buttons\" :class=\"action.cssClass\"> <button type=\"button\" :class=\"button.cssClass\" class=\"botui-actions-buttons-button\" v-botui-scroll v-for=\"button in action.button.buttons\" @click=\"handle_action_button(button)\"><i v-if=\"button.icon\" class=\"botui-icon botui-action-button-icon fa\" :class=\"\'fa-\' + button.icon\"></i> {{button.text}}</button></div><form v-if=\"action.type == \'buttontext\'\" class=\"botui-actions-text\" @submit.prevent=\"handle_action_text()\" :class=\"action.cssClass\"><i v-if=\"action.text.icon\" class=\"botui-icon botui-action-text-icon fa\" :class=\"\'fa-\' + action.text.icon\"></i> <input type=\"text\" ref=\"input\" :type=\"action.text.sub_type\" v-model=\"action.text.value\" class=\"botui-actions-text-input\" :placeholder=\"action.text.placeholder\" :size=\"action.text.size\" :value=\"action.text.value\" :class=\"action.text.cssClass\" required v-focus/> <button type=\"submit\" :class=\"{\'botui-actions-buttons-button\': !!action.text.button, \'botui-actions-text-submit\': !action.text.button}\"><i v-if=\"action.text.button && action.text.button.icon\" class=\"botui-icon botui-action-button-icon fa\" :class=\"\'fa-\' + action.text.button.icon\"></i> <span>{{(action.text.button && action.text.button.label) || \'Go\'}}</span></button><div class=\"botui-actions-buttons\" :class=\"action.cssClass\"> <button type=\"button\" :class=\"button.cssClass\" class=\"botui-actions-buttons-button\" v-for=\"button in action.button.buttons\" @click=\"handle_action_button(button)\" autofocus><i v-if=\"button.icon\" class=\"botui-icon botui-action-button-icon fa\" :class=\"\'fa-\' + button.icon\"></i> {{button.text}}</button></div></form></div></transition></div></div>', // replaced by HTML template during build. see Gulpfile.js
        data: function () {
          return {
            action: {
              text: {
                size: 30,
                placeholder: 'Write here ..'
              },
              button: {},
              show: false,
              type: 'text',
              autoHide: true,
              addMessage: true
            },
            messages: []
          };
        },
        computed: {
          isMobile: function () {
            return root.innerWidth && root.innerWidth <= 768;
          }
        },
          methods: {
              handle_action_button: function (button) {
            for (var i = 0; i < this.action.button.buttons.length; i++) {
              if(this.action.button.buttons[i].value == button.value && typeof(this.action.button.buttons[i].event) == 'function') {
                this.action.button.buttons[i].event(button);
                if (this.action.button.buttons[i].actionStop) return false;
                break;
              }
            }
  
            _handleAction(button.text);
  
            var defaultActionObj = {
              type: 'button',
              text: button.text,
              value: button.value
            };
  
            for (var eachProperty in button) {
              if (button.hasOwnProperty(eachProperty)) {
                if (eachProperty !== 'type' && eachProperty !== 'text' && eachProperty !== 'value') {
                  defaultActionObj[eachProperty] = button[eachProperty];
                }
              }
            }
  
            _actionResolve(defaultActionObj);
              },
              handle_action_text: function () {
                  if(!this.action.text.value) return;
            _handleAction(this.action.text.value);
                  _actionResolve({
              type: 'text',
              value: this.action.text.value
            });
                  this.action.text.value = '';
              },
          handle_action_select: function () {
            if(this.action.select.searchselect && !this.action.select.multipleselect) {
              if(!this.action.select.value.value) return;
              _handleAction(this.action.select.value[this.action.select.label]);
              _actionResolve({
                type: 'text',
                value: this.action.select.value.value,
                text: this.action.select.value.text,
                obj: this.action.select.value
              });
            }
            if(this.action.select.searchselect && this.action.select.multipleselect) {
              if(!this.action.select.value) return;
              var values = new Array();
              var labels = new Array();
              for (var i = 0; i < this.action.select.value.length; i++) {
                values.push(this.action.select.value[i].value);
                labels.push(this.action.select.value[i][this.action.select.label]);
              }
              _handleAction(labels.join(', '));
              _actionResolve({
                type: 'text',
                value: values.join(', '),
                text: labels.join(', '),
                obj: this.action.select.value
              });
            }
            else {
              if(!this.action.select.value) return;
              for (var i = 0; i < this.action.select.options.length; i++) { // Find select title
                if (this.action.select.options[i].value == this.action.select.value) {
                  _handleAction(this.action.select.options[i].text);
                  _actionResolve({
                    type: 'text',
                    value: this.action.select.value,
                    text: this.action.select.options[i].text
                  });
                }
              }
            }
          }
          }
      };
  
      root.Vue.directive('botui-markdown', function (el, binding) {
        if(binding.value == 'false') return; // v-botui-markdown="false"
        el.innerHTML = _parseMarkDown(el.textContent);
      });
  
      root.Vue.directive('botui-scroll', {
        inserted: function (el) {
          _container.scrollTop = _container.scrollHeight;
          // 弹弹乐问题定位
      el.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
        }
      });
  
      root.Vue.directive('focus', {
        inserted: function (el) {
          el.focus();
        }
      });
  
      root.Vue.directive('botui-container', {
        inserted: function (el) {
          _container = el;
        }
      });
  
      _botApp = new root.Vue({
        components: {
          'bot-ui': _botuiComponent
        }
      }).$mount('#' + id);
  
      var _instance = _botApp.$children[0]; // to access the component's data
  
      function _addMessage(_msg) {
  
        if(!_msg.loading && !_msg.content) {
          throw Error('BotUI: "content" is required in a non-loading message object.');
        }
  
        _msg.type = _msg.type || 'text';
        _msg.visible = (_msg.delay || _msg.loading) ? false : true;
        var _index = _instance.messages.push(_msg) - 1;
  
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            if(_msg.delay) {
              _msg.visible = true;
  
              if(_msg.loading) {
                _msg.loading = false;
              }
            }
            resolve(_index);
          }, _msg.delay || 0);
        });
      }
  
      function _checkOpts(_opts) {
        if(typeof _opts === 'string') {
          _opts = {
            content: _opts
          };
        }
        return _opts || {};
      }
  
      _interface.message =  {
        add: function (addOpts) {
          return _addMessage( _checkOpts(addOpts) );
        },
        bot: function (addOpts) {
          addOpts = _checkOpts(addOpts);
          return _addMessage(addOpts);
        },
        human: function (addOpts) {
          addOpts = _checkOpts(addOpts);
          addOpts.human = true;
          return _addMessage(addOpts);
        },
        get: function (index) {
          return Promise.resolve(_instance.messages[index]);
        },
        remove: function (index) {
          _instance.messages.splice(index, 1);
          return Promise.resolve();
        },
        update: function (index, msg) { // only content can be updated, not the message type.
          var _msg = _instance.messages[index];
          _msg.content = msg.content;
          _msg.visible = !msg.loading;
          _msg.loading = !!msg.loading;
          return Promise.resolve(msg.content);
        },
        removeAll: function () {
          _instance.messages.splice(0, _instance.messages.length);
          return Promise.resolve();
        }
      };
  
      function mergeAtoB(objA, objB) {
        for (var prop in objA) {
          if (!objB.hasOwnProperty(prop)) {
            objB[prop] = objA[prop];
          }
        }
      }
  
      function _checkAction(_opts) {
        if(!_opts.action && !_opts.actionButton  && !_opts.actionText) {
          throw Error('BotUI: "action" property is required.');
        }
      }
  
      function _showActions(_opts) {
  
        _checkAction(_opts);
  
        mergeAtoB({
          type: 'text',
          cssClass: '',
          autoHide: true,
          addMessage: true
        }, _opts);
  
        _instance.action.type = _opts.type;
        _instance.action.cssClass = _opts.cssClass;
        _instance.action.autoHide = _opts.autoHide;
        _instance.action.addMessage = _opts.addMessage;
  
        return new Promise(function(resolve, reject) {
          _actionResolve = resolve; // resolved when action is performed, i.e: button clicked, text submitted, etc.
          setTimeout(function () {
            _instance.action.show = true;
          }, _opts.delay || 0);
        });
      };
  
      _interface.action = {
        show: _showActions,
        hide: function () {
          _instance.action.show = false;
          return Promise.resolve();
        },
        text: function (_opts) {
          _checkAction(_opts);
          _instance.action.text = _opts.action;
          return _showActions(_opts);
        },
        button: function (_opts) {
          _checkAction(_opts);
          _opts.type = 'button';
          _instance.action.button.buttons = _opts.action;
          return _showActions(_opts);
        },
        select: function (_opts) {
          _checkAction(_opts);
          _opts.type = 'select';
          _opts.action.label = _opts.action.label || 'text';
          _opts.action.value = _opts.action.value || '';
          _opts.action.searchselect = typeof _opts.action.searchselect !== 'undefined' ? _opts.action.searchselect : _options.searchselect;
          _opts.action.multipleselect = _opts.action.multipleselect || false;
          if (_opts.action.searchselect && typeof(_opts.action.value) == 'string') {
            if (!_opts.action.multipleselect) {
              for (var i = 0; i < _opts.action.options.length; i++) { // Find object
                if (_opts.action.options[i].value == _opts.action.value) {
                  _opts.action.value = _opts.action.options[i]
                }
              }
            }
            else {
              var vals = _opts.action.value.split(',');
              _opts.action.value = new Array();
              for (var i = 0; i < _opts.action.options.length; i++) { // Find object
                for (var j = 0; j < vals.length; j++) { // Search values
                  if (_opts.action.options[i].value == vals[j]) {
                    _opts.action.value.push(_opts.action.options[i]);
                  }
                }
              }
            }
          }
          if (!_opts.action.searchselect) { _opts.action.options.unshift({value:'',text : _opts.action.placeholder}); }
          _instance.action.button = _opts.action.button;
          _instance.action.select = _opts.action;
          return _showActions(_opts);
        },
        buttontext: function (_opts) {
          _checkAction(_opts);
          _opts.type = 'buttontext';
          _instance.action.button.buttons = _opts.actionButton;
          _instance.action.text = _opts.actionText;
          return _showActions(_opts);
        }
      };
  
      if(_options.fontawesome) {
        loadScript(_fontAwesome);
      }
  
      if(_options.searchselect) {
        loadScript(_searchselect, function() {
          Vue.component('v-select', VueSelect.VueSelect);
        });
      }
  
      if(_options.debug) {
        _interface._botApp = _botApp; // current Vue instance
      }
  
      return _interface;
    });
  
    return BotUI;
  
  }));
  
 // botui_init.js
 function botui_init() {
    var botui = new BotUI("hello-akilar");
    botui.message.add({
      delay: 800,
      content: "Hi, 欢迎光临可以清心の小站😊"
    }).then(function() {
      botui.message.add({
        delay: 1100,
        content: "我是可以清心😄"
      }).then(function() {
        botui.message.add({
          delay: 1100,
          content: "你也可以叫我清心~😋"
        }).then(function() {
          botui.action.button({
            delay: 1600,
            action: [{
              text: "我想知道更多关于清心的故事!😃",
              value: "sure"
            }, {
              text: "好的，就这样吧，拜拜！🙄",
              value: "skip"
            }]
          }).then(function(a) {
            "sure" == a.value && sure();
            "skip" == a.value && end()
          })
        })
      })
    });
    var sure = function() {
        botui.message.add({
          delay: 600,
          content: "🎉🎉🎉🎉🎉🎉"
        }).then(function() {
          secondpart()
        })
      },
      end = function() {
        botui.message.add({
          delay: 600,
          content: "w(ﾟДﾟ)w 不要走！再看看嘛！"
        })
      },
      secondpart = function() {
        botui.message.add({
          delay: 5000,
          content: "首先呢，很感谢您肯在这里驻足片刻❤️。这是一个个人性质的博客，我会在这里发表各种各样的内容。"
        }).then(function() {
          botui.message.add({
            delay: 15000,
            content: "👀"
          }).then(function() {
            botui.message.add({
              delay: 5000,
              content: "分类也有一点我的恶趣味在。👀"
            }).then(function() {
              botui.message.add({
                delay: 8000,
                content: "🎉"
              }).then(function() {
                botui.message.add({
                  delay: 5000,
                  content: "😶"
                }).then(function() {
                  botui.message.add({
                    delay: 4000,
                    content: "👻"
                  }).then(function() {
                    botui.action.button({
                      delay: 1100,
                      action: [{
                        text: "🤔",
                        value: "why-mashiro"
                      }]
                    }).then(function(a) {
                      thirdpart()
                    })
                  })
                })
              })
            })
          })
        })
      },
      thirdpart = function() {
        botui.message.add({
          delay: 1e3,
          content: "诶？😲"
        }).then(function() {
          botui.action.button({
            delay: 1500,
            action: [{
              text: "😲，那英文名为什么叫Akilar呢？",
              value: "why-cat"
            }]
          }).then(function(a) {
            fourthpart()
          })
        })
      },
      fourthpart = function() {
        botui.message.add({
          delay: 3000,
          content: "😲 "
        }).then(function() {
          botui.message.add({
            delay: 3000,
            content: "灵感来自于刀剑神域~"
          }).then(function() {
            botui.action.button({
              delay: 1500,
              action: [{
                text: "方便透露一下真名吗？👀",
                value: "why-domain"
              }]
            }).then(function(a) {
              fifthpart()
            })
          })
        })
      },
      fifthpart = function() {
        botui.message.add({
          delay: 5000,
          content: "emmmm,流水幽吟绕耳边，煦风馨语抚心弦，挥臂欲揽冰钩月，银星斟酌醉人涎~"
        }).then(function() {
          botui.message.add({
            delay: 3000,
            content: "只是一介无名小卒而已^_^"
          })
        })
      }
  }
