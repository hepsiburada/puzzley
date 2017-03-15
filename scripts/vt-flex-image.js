(function($) {
  "use strict";

  var defaultOptions = {
		contentWidth: 960,
		itemClass: '.categoryBanner',
		gutter: 16
	};

  $.fn.createFlex = function (options) {

  	if(!options) {
  		options = defaultOptions;
  	} else {
  		options = Object.assign(defaultOptions, options);
  	}

  	var $element = this;
  	
    var $contentElement = this,
        contentWidth = $contentElement.outerWidth(),
        index = 0,
        dataObject = [],
        activeObject = { row: [] };

  	var percent = options.contentWidth / options.contentWidth;
    
    var gutter = options.gutter * percent;

    $contentElement.width(options.contentWidth);

    $contentElement
        .find(options.itemClass)
        .each((data, e) => {
            let $element = $(e).find('img');
            let elementWidth = (parseInt($element.attr('width')) * percent) + (gutter * 2),
                elementHeight = (parseInt($element.attr('height')) * percent) + (gutter * 2),
                elementData = {
                    width: elementWidth,
                    height: elementHeight
                },
                rowWidth = 0;

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
                    activeObject = { row: [] };
                    activeObject.row.push(elementData);
                }
            }

            if (index === $contentElement.find('.categoryBanner').length) {
                dataObject.push(activeObject);
            }

        });

    $.run(dataObject, $contentElement, options);
  }

  $.run = function(data, $contentElement, options) {
  	let contentWidth = $contentElement.outerWidth(),
        index = 0,
        rowIndex = 0,
        maxHeight = 0,
        percent = contentWidth / options.contentWidth;
    let spaceData = [];
    let spaceArea = { top: 0, left: 0, width: 0, height: 0, index: rowIndex };
    let spaceWidth = 0;

    $contentElement.css({ 'position': 'relative' });

    for (var i = 0; i < data.length; i++) {
        let maxWidth = 0;
        let rowHeight = 0;
        let rowSpace = 0;
        let maxData = _.maxBy(data[i].row, (o) => {
            return o['height'];
        });

        if (!maxData) {
            this.stopAnimate();
            return false;
        }

        rowHeight = maxData['height'];

        for (var j = 0; j < data[i].row.length; j++) {
            let activeData = data[i].row[j];
            let $element = $contentElement.find(options.itemClass).eq(index);
            let elementTop = options.gutter + maxHeight;
            let elementLeft = options.gutter + maxWidth;

            if (spaceData[0] && spaceData[0].width >= activeData.width && (spaceData[0].left === maxWidth || maxWidth === 0) && rowIndex !== spaceData[0].index) {
                if (rowHeight === activeData.height) {
                    let val = 0;
                    let spaceVal = 0;
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
                    spaceArea = { top: 0, left: 0, width: 0, height: 0, index: index };
                }

                spaceData.splice(0, 1);
            } else if (spaceData[0] && rowIndex !== spaceData[0].index) {
                spaceData = [];
            }

            $element.css({ 'position': 'absolute' });
            $element.css({ 'left': elementLeft, 'top': elementTop, 'width': activeData.width, 'height': activeData.height });

            if (rowHeight > activeData.height) {
                spaceArea.top = maxHeight + activeData.height;
                spaceArea.left = maxWidth;
                spaceArea.width = activeData.width;
                spaceArea.height = rowHeight - activeData.height;
                spaceArea.index = rowIndex;

                spaceData.push(spaceArea);
                spaceArea = { top: 0, left: 0, width: 0, height: 0, index: index };
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
                spaceArea = { top: 0, left: 0, width: 0, height: 0, index: rowIndex };
            }
            
        } else {
            spaceData = [];
        }

        maxHeight += rowHeight - rowSpace;

        $contentElement.css({ 'height': maxHeight + options.gutter * 2 + 'px' });
        rowIndex++;
    }

    this.stopAnimate($contentElement);
  }

  $.stopAnimate = function($contentElement) {
      $contentElement.removeClass('preLoader');
  }
})(jQuery);