(function ($) {
  "use strict";

  var defaultOptions = {
    contentWidth: 960,
    itemClass: '.categoryBanner',
    gutter: 16
  };

  $.fn.puzzley = function (options) {
    if (!options) {
      options = defaultOptions;
    } else {
      options = Object.assign(defaultOptions, options);
    }

    var $contentElement = this;
    var index = 0;
    var dataObject = [];
    var activeObject = {row: []};

    var percent = options.contentWidth / options.contentWidth;

    var gutter = options.gutter * percent;

    $contentElement.width(options.contentWidth);

    $contentElement
      .find(options.itemClass)
      .each(function (data, e) {
        var $element = $(e).find('img');

        var elementWidth = (parseInt($element.attr('width')) * percent) + (gutter * 2);
        var elementHeight = (parseInt($element.attr('height')) * percent) + (gutter * 2);

        var elementData = {
          width: elementWidth,
          height: elementHeight
        };

        var rowWidth = 0;

        index++;

        if (activeObject.row.length === 0) {
          activeObject.row.push(elementData);
        } else {
          for (var i = 0; i < activeObject.row.length; i++) {
            rowWidth += activeObject.row[i].width;
          }

          if (rowWidth + elementWidth <= options.contentWidth) {
            activeObject.row.push(elementData);
          } else {
            dataObject.push(activeObject);
            activeObject = {row: []};
            activeObject.row.push(elementData);
          }
        }

        if (index === $contentElement.find('.categoryBanner').length) {
          dataObject.push(activeObject);
        }
      });

    $.run(dataObject, $contentElement, options);
  };

  $.maxBy = function (array, next) {
    var result;
    var index = -1;
    const length = array == null ? 0 : array.length;

    while (++index < length) {
      var computed;
      const value = array[index];
      const current = next(value);

      if (current != null &&
        (computed === undefined ? (current === current) : (current > computed))) {
        computed = current;
        result = value;
      }
    }
    return result;
  };

  $.run = function (data, $contentElement, options) {
    var contentWidth = $contentElement.outerWidth();
    var index = 0;
    var rowIndex = 0;
    var maxHeight = 0;
    var percent = contentWidth / options.contentWidth;
    var spaceData = [];
    var spaceArea = {top: 0, left: 0, width: 0, height: 0, index: rowIndex};

    $contentElement.css({'position': 'relative'});

    for (var i = 0; i < data.length; i++) {
      var maxWidth = 0;
      var rowHeight = 0;
      var rowSpace = 0;

      var maxData = $.maxBy(data[i].row, function (o) {
        return o['height'];
      });

      if (!maxData) {
        return false;
      }

      rowHeight = maxData['height'];

      for (var j = 0; j < data[i].row.length; j++) {
        var activeData = data[i].row[j];

        var $element = $contentElement.find(options.itemClass).eq(index);

        var elementTop = options.gutter + maxHeight;
        var elementLeft = options.gutter + maxWidth;

        if (spaceData[0] && spaceData[0].width >= activeData.width && (spaceData[0].left === maxWidth || maxWidth === 0) && rowIndex !== spaceData[0].index) {
          if (rowHeight === activeData.height) {
            var val = 0;
            var spaceVal = 0;
            for (var a = 0; a < data[i].row.length; a++) {
              val += data[i].row[a].width;
            }

            for (var b = 0; b < spaceData.length; b++) {
              spaceVal += spaceData[b].width;
            }

            if (activeData.width < 928 && (data[i].row.length === 1 || spaceVal >= val)) {
              maxHeight = maxHeight - activeData.height;
            }
            maxWidth = maxWidth - activeData.width;
          }

          elementTop = spaceData[0].top + (options.gutter * percent);
          elementLeft = spaceData[0].left + (options.gutter * percent);

          if (spaceData[0].height > activeData.height) {
            spaceArea.top = spaceData[0].top + activeData.height;
            spaceArea.left = spaceData[0].left;
            spaceArea.width = activeData.width;
            spaceArea.height = spaceData[0].height - activeData.height;
            spaceArea.index = spaceData[0].index;

            spaceData.push(spaceArea);
            rowSpace = rowHeight - spaceArea.height;
            spaceArea = {top: 0, left: 0, width: 0, height: 0, index: index};
          }

          spaceData.splice(0, 1);
        } else if (spaceData[0] && rowIndex !== spaceData[0].index) {
          spaceData = [];
        }

        $element.css({'position': 'absolute'});
        $element.css({'left': elementLeft, 'top': elementTop, 'width': activeData.width, 'height': activeData.height});

        if (rowHeight > activeData.height) {
          spaceArea.top = maxHeight + activeData.height;
          spaceArea.left = maxWidth;
          spaceArea.width = activeData.width;
          spaceArea.height = rowHeight - activeData.height;
          spaceArea.index = rowIndex;

          spaceData.push(spaceArea);
          spaceArea = {top: 0, left: 0, width: 0, height: 0, index: index};
        }

        maxWidth += activeData.width;
        index++;
      }

      if (contentWidth > maxWidth && maxWidth !== 0) {
        spaceArea.top = maxHeight;
        spaceArea.left = maxWidth;
        spaceArea.width = contentWidth - maxWidth;
        spaceArea.height = rowHeight;
        spaceArea.index = rowIndex;

        if ((spaceArea.width > options.gutter * 2)) {
          spaceData.push(spaceArea);
          spaceArea = {top: 0, left: 0, width: 0, height: 0, index: rowIndex};
        }

      } else {
        spaceData = [];
      }

      maxHeight += rowHeight - rowSpace;

      $contentElement.css({'height': maxHeight + options.gutter * 2 + 'px'});
      rowIndex++;
    }
  };
})(jQuery);