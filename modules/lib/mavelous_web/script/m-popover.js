/* ===========================================================
 * bootstrap-popover.js v2.0.4
 * http://twitter.github.com/bootstrap/javascript.html#popovers
 * ===========================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================== */


!function ($) {

  "use strict"; // jshint ;_;


 /* POPOVER PUBLIC CLASS DEFINITION
  * =============================== */

  var Popover = function ( element, options ) {
    this.init('popover', element, options)
  }

  Popover.prototype = {

    constructor: Popover

  , setContent: function (content) {
      var $tip = this.tip()
        , title = this.getTitle()
      /* customization to use optional content function, pch (mavelous) */
      $tip.find('.popover-title').text(title)
      $tip.find('.popover-content').html(content);
      $tip.removeClass('fade top bottom left right in')
    }

  , getContent: function () {
      var content
        , $e = this.$element
        , o = this.options
      content = $e.attr('data-content')
        || (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)

      return content
    }

  , tip: function () {
      if (!this.$tip) {
        this.$tip = $(this.options.template)
      }
      return this.$tip
    }

  , init: function (type, element, options) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)

    }

  , getOptions: function (options) {
      return $.extend({}, $.fn[this.type].defaults, options,
                      this.$element.data())

    }

  , show: function (content) {
      var $tip
        , inside
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp

      $tip = this.tip()
      this.setContent(content)

      if (this.options.animation) {
        $tip.addClass('fade')
      }

      placement = this.options.placement;

      inside = false;

      $tip
        .remove()
        .css({ top: 0, left: 0, display: 'block' })
        .appendTo(inside ? this.$element : document.body)

      pos = this.getPosition(inside)

      actualWidth = $tip[0].offsetWidth
      actualHeight = $tip[0].offsetHeight

      switch (inside ? placement.split(' ')[1] : placement) {
        case 'bottom':
          tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
          break
        case 'top':
          tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
          break
        case 'left':
          tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
          break
        case 'right':
          tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
          break
      }

      $tip
        .css(tp)
        .addClass(placement)
        .addClass('in')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).remove()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.remove()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.remove()
    }

  , getPosition: function (inside) {
      return $.extend({}, this.$element.offset(), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  }


 /* POPOVER PLUGIN DEFINITION
  * ======================= */

  $.fn.popover = function (option, extra) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('popover')
        , options = typeof option == 'object' && option
      if (!data) $this.data('popover', (data = new Popover(this, options)))
      if (typeof option == 'string') {
        if (typeof extra == 'undefined') {
          data[option]()
        } else {
          data[option](extra)
        }
      }
    })
  }

  $.fn.popover.Constructor = Popover

  $.fn.popover.defaults = {
    placement: 'right'
  , content: ''
  , animation: true
  , selector: false
  , trigger: 'hover'
  , title: ''
  }

}(window.jQuery);
