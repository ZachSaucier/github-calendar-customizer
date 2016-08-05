var imgCanvas = document.createElement('canvas'),
    imgContext = imgCanvas.getContext('2d'),
    cellCanvas = document.getElementById('cellCanvas'),
    cellContext = cellCanvas.getContext('2d'),
    pixelInterval = 1, // Rather than inspect every single pixel in the image inspect every pixelInterval'th pixel
    img = document.getElementById('imageToBeUsed'), // The image to be averaged
    cellSize = 20, // The size of square to average the color
    gutter = 2, // The number of pixels between each cell
    offset = 0,
    numXCells, // The width of our scaled image in cell size
    numYCells = 7, // The height of our scaled image in cell size
    icellSizeX,
    icellSizeY;

var indexArray,
    reformattedArray;

var gitfiti = document.getElementById('gitfiti'),
    githubBoard = document.getElementById('github-board');

// The input elements
var urlInput = document.querySelector('[name=imageURL'),
    nameInput = document.querySelector('[name=imageName'),
    paletteChoices = document.querySelectorAll('#palette input');
    
var themeColorsArray = ['#eee', '#d6e685', '#8cc665', '#44a340', '#1e6823'];
themeColorsArray = parseColorArray(themeColorsArray);


// Add listeners for our palette options
for(var i = 0; i < paletteChoices.length; i++) {
  paletteChoices[i].onclick = setColor;
}

var selectedColor = null;
function setColor() {
  selectedColor = this.value;
}

// Listen for click events to change the color
cellCanvas.onmousemove = cellCanvas.onclick = function(e) {
  if(selectedColor != null 
     && e.which == 1) // Left click
  {
    changeCell(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  }
}

function changeCell(x, y) {
  var xCell = Math.floor(y / (cellSize + gutter)),
      yCell = Math.floor(x / (cellSize + gutter)),
      index = xCell + yCell * 7;

  if(typeof reformattedArray[xCell] != "undefined" 
     && typeof reformattedArray[xCell][yCell] != "undefined"
     && typeof indexArray[index] != "undefined") 
  {
    indexArray[index] = selectedColor;
    updateBoards(indexArray);
  }
}





// Use a CORS proxy to allow the image to be used
img.crossOrigin = 'Anonymous';
img.src = urlInput.value;
//img.src = 'https://crossorigin.me/' + urlInput.value;
img.onload = function() {
  // Once the CORS enabled image loads, get the image data
  var imgData = newImg(img);

  // Size the grid based on the desired dimensions; get the dimensions
  // of the image get scale data; get averaged colors based on inputs.
  // Get the indexes, corresponding to a theme range, of the lightness
  // using the method desired (round, floor, ceil)
  indexArray = processImage(imgData, false, false);
  // Get the colors based on ^^ and a given theme and update the output
  updateBoards(indexArray);
}





function processImage(imgData, invertBool, roundBool) {
  var averagedColors = gridifyAvgColors(imgData);
  var lightnessObj = getLightnessObject(averagedColors);
  var colorIntervals = createColorIntervals(lightnessObj.lightest, lightnessObj.darkest);
  return getThemeIndexes(lightnessObj.array, colorIntervals, invertBool, roundBool);
}


// Updates the image to be used
function newImg(imgElem) {
  img = imgElem;
  
  // Size our github canvas based on the calendar size
  cellCanvas.height = cellSize * numYCells + numYCells * gutter; // 7 days of week + gutter px inbetween each
  imgCanvas.width = cellCanvas.width = cellSize * 53 + 53 * gutter; // 53 weeks + gutter px inbetween
  
  // Size our image canvas based on the image size
  var imageWidth = imgCanvas.width = img.naturalWidth || img.offsetWidth || img.width,
      imageHeight = imgCanvas.height = img.naturalHeight || img.offsetHeight || img.height;

  // Scale the width based on the height of the calendar
  numXCells = Math.ceil( imageWidth * numYCells / imageHeight );

  icellSizeX = Math.floor( imageWidth / numXCells ); // The x size of a cell for the image
  icellSizeY = Math.floor( imageHeight / numYCells ); // The y size of a cell for the image
  
  // Draw the image to our hidden canvas for calculations
  imgContext.drawImage(img, 0, 0);
  
  // Set the image data
  var data = []; // A 1D array containing the image color info
  try {
    data = imgContext.getImageData(0, 0, imageWidth, imageHeight);
  } catch(e) {
    // Catch errors - usually due to cross domain security issues
    console.log(e);
    return;
  }

  return data.data;
}


function gridifyAvgColors(imgDataArray) {
	gridColors = [];
  
  for(var i = 0; i < 53; i++) {
    for(var j = 0; j < numYCells; j++) {
      var ix,
          iy,
          color;
      
      if(i >= offset 
         && (i < numXCells + offset && j < numYCells)) {
      	ix = (i - offset) * icellSizeX;
        iy = j * icellSizeY;
      	color = getAvgColorAsRGB(imgDataArray, ix, iy);
      } else {
      	color = { r: 255, g: 255, b: 255 };
      }
      
      gridColors.push(color);
    }
  }
  
  return gridColors;
}


function drawGrid(colorArray, fillColor) {
  for(var i = 0; i < 53; i++) {
    for(var j = 0; j < numYCells; j++) {
      var x = i * cellSize,
          y = j * cellSize,
          color;
      
      var colorCheck = colorArray[i * numYCells + j];
      if(colorCheck.r !== '238'
         || colorCheck.g !== '238'
         || colorCheck.b != '238') {
      	color = colorArray[i * numYCells + j];
      } else {
      	if(fillColor)
        	color = parseColorArray([fillColor])[0];
        else
      		color = { r: 238, g: 238, b: 238 };
      }
      
      cellContext.fillStyle = 'rgb(' + color.r + ', ' + color.g + ', ' + color.b + ')';
      cellContext.fillRect(x + i * gutter, y + j * gutter, cellSize, cellSize);
    }
  }
}


// Gets the average color of the requested area
function getAvgColorAsRGB(imgDataArray, startX, startY) {
	var rgb = { r: 0, g: 0, b: 0 };
  
  var count = 0;
      
  for(var j = startY; j < startY + icellSizeY; j += pixelInterval) {
  	for(var i = startX; i < startX + icellSizeX; i += pixelInterval) { // Do this second for lookup perf reasons
      count++;
      var index = (i + j * imgCanvas.width) * 4;
      rgb.r += imgDataArray[index];
      rgb.g += imgDataArray[index + 1];
      rgb.b += imgDataArray[index + 2];
    }
  }
  
  // Round the number values
  rgb.r = Math.floor(rgb.r / count);
  rgb.g = Math.floor(rgb.g / count);
  rgb.b = Math.floor(rgb.b / count);

  return rgb;
}

function getLightnessObject(colorsArray) {
	var lightnessArray = [],
      lightestColor = 0,
      darkestColor = 255;

  for(var i = 0; i < colorsArray.length; i++) {
  	var lightVal = calculatePerceivedLuminance(colorsArray[i]);
    if(lightVal < darkestColor)
    	darkestColor = lightVal;
    if(lightVal > lightestColor)
    	lightestColor = lightVal;
  	lightnessArray.push(lightVal);
  }
  return { array: lightnessArray, lightest: lightestColor, darkest: darkestColor };
}

function calculatePerceivedLuminance(color) {
  return color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
}

// Light value should be greater than or equal to the dark value
function createColorIntervals(lightVal, darkVal) {
  var intervalSize = (lightVal - darkVal) / 4;
  return [
    lightVal,
    lightVal - intervalSize,
    lightVal - intervalSize * 2,
    lightVal - intervalSize * 3,
    lightVal - intervalSize * 4
  ];
}

function getThemeIndexes(lightnessArray, colorIntervalsArray, invertBool, roundBool) {
  var indexArray = lightnessArray.slice();
	for(var i = 0; i < lightnessArray.length; i++) {
    for(var j = 0, l = colorIntervalsArray.length; j < l; j++) {
      /* Round */
      if(roundBool
         && lightnessArray[i] >= Math.floor(colorIntervalsArray[j])
         && i < (offset + numXCells) * numYCells 
         && i >= offset * numYCells
         && colorIntervalsArray[j + 1]) {
        
        var distToBot = Math.abs(lightnessArray[i] - colorIntervalsArray[j]),
            distToTop = Math.abs(colorIntervalsArray[j + 1] - lightnessArray[i]);

        if(invertBool) 
        {
          if(distToBot > distToTop) {
            indexArray[i] = l - j - 2;
          } 
          else {
            indexArray[i] = l - j - 1;
          }
        } 
        else {
          if(distToBot > distToTop) {
            indexArray[i] = j;
          } 
          else {
            indexArray[i] = j + 1;
          }
        }
          
        break;
      }/**/
    
      /* Floor */
      if(lightnessArray[i] >= Math.floor(colorIntervalsArray[j])) {
        if(invertBool 
           && i < (offset + numXCells) * numYCells 
           && i >= offset * numYCells) 
        {
          indexArray[i] = l - j - 1;
        }
        else
          indexArray[i] = j;

        break;
      }/**/
    }
  }

  return indexArray;
}

function themifyIndexArray(indexArray, themeArray) {
  var themeColorArray = indexArray.slice();

  for(var i = 0; i < indexArray.length; i++)
    themeColorArray[i] = themeArray[themeColorArray[i]];

  return themeColorArray;
}



function parseColorArray(colorArray) {
  var div = document.createElement('div'), m;
  document.body.appendChild(div);
  for(var i = 0; i < colorArray.length; i++) {
  	div.style.color = colorArray[i];
    m = getComputedStyle(div).color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
    if(m) colorArray[i] = { r: m[1], g: m[2], b: m[3] };
    else throw new Error('Color ' + input + ' could not be parsed.');
  }
  document.body.removeChild(div);
  
  return colorArray;
}

function shiftArr(colorIndexArray, shiftAmnt) {
	var shiftedArray = new Array(colorIndexArray.length).fill(0);
	for(var i = 0; i < colorIndexArray.length; i++) {
  	var newIndex = i + shiftAmnt * 53;
    if(colorIndexArray[newIndex])
    	shiftedArray[newIndex] = colorIndexArray[i];
  }
  return shiftedArray;
}




// Since both formats go ltr then ttb and we go ttb then ltr, have to convert
function reformatArray(indexArray) {
  var reformattedArray = [[],[],[],[],[],[],[]];
  for(var i = 0; i < indexArray.length; i++) {
    var index = i % 7;
    reformattedArray[index].push(indexArray[i]);
  }

  return reformattedArray;
}

function createGitfitiFormat(indexArray, name) {
  var output = ':' + name + '\n[';
  for(var i = 0; i < 7; i++) {
    if(i != 0)
      output += ' [';
    else
      output += '[';

    output += indexArray[i].join(',');

    if(i != 6)
      output += ']\n';
    else
      output += ']';
  }
  output += ']';

  return output;
}

function createGithubBoardFormat(indexArray, name) {
  var output = '';
  for(var i = 0; i < 7; i++)
    output += indexArray[i].join('') + '\n';

  return output;
}



function updateBoards(indexArray) {
  // Update the canvas
  var themeIndexArray = themifyIndexArray(indexArray, themeColorsArray);
  drawGrid(themeIndexArray);

  // CHANGE so it only does this on image change, updates individual values otherwise
  reformattedArray = reformatArray(indexArray);

  gitfiti.innerText = createGitfitiFormat(reformattedArray, nameInput.value);
  githubBoard.innerText = createGithubBoardFormat(reformattedArray);
}
